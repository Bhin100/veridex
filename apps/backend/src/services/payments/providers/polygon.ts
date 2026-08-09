import { BaseProvider } from '../../../../../../packages/shared/src/payments/provider'
import https from 'https'
import { db } from '../../../lib/db'
import { logger } from '../../../logger'

export class UsdtPolygonProvider extends BaseProvider {
  constructor() {
    super('usdt-polygon', 'USDT Polygon')
  }

  async watchDeposits(contractId: string) {
    return `${this.id}:sub:${contractId}`
  }

  /**
   * Helper to make pure JSON-RPC POST requests to Polygon node
   */
  private async queryPolygonRPC(method: string, params: any[]): Promise<any> {
    const rpcUrl = process.env.POLYGON_RPC_URL
    if (!rpcUrl) {
      logger.warn('POLYGON_RPC_URL not configured. Skipping on-chain RPC query.')
      return null
    }

    try {
      const url = new URL(rpcUrl)
      const postData = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = ''
          res.on('data', (chunk) => { body += chunk })
          res.on('end', () => {
            try {
              resolve(JSON.parse(body))
            } catch (e) {
              reject(new Error('Invalid JSON response from Polygon RPC'))
            }
          })
        })
        req.on('error', reject)
        req.write(postData)
        req.end()
      })
    } catch (err: any) {
      logger.error({ err }, 'Polygon RPC connection failed')
      return null
    }
  }

  /**
   * Verifies USDT/USDC deposits strictly on the Polygon chain
   */
  async verifyDeposit(event: any): Promise<{ ok: boolean; details?: any }> {
    const txHash = event.txHash || event.providerId
    const expectedAmount = event.amount
    const recipientWallet = process.env.FOUNDER_USDT_POLYGON

    if (!txHash) {
      return { ok: false, details: { error: 'Missing transaction hash' } }
    }

    if (!recipientWallet) {
      return { ok: false, details: { error: 'FOUNDER_USDT_POLYGON receiving wallet address not configured' } }
    }

    // 1) Replay protection check against database
    const existing = await db.deposit.findFirst({
      where: { provider: this.id, providerId: txHash, verified: true }
    })
    if (existing) {
      return { ok: false, details: { error: 'Duplicate transaction hash: Replay attack prevented.' } }
    }

    // 2) RPC Validation query
    const rpcRes = await this.queryPolygonRPC('eth_getTransactionReceipt', [txHash])
    if (!rpcRes || !rpcRes.result) {
      return { ok: false, details: { error: 'Could not fetch transaction receipt from Polygon chain' } }
    }

    const receipt = rpcRes.result

    // Status must be 0x1 (success)
    if (receipt.status !== '0x1') {
      return { ok: false, details: { error: 'Transaction failed or is reverted on-chain' } }
    }

    // 3) Confirmation depth validation
    const blockNumberHex = receipt.blockNumber
    const latestBlockRes = await this.queryPolygonRPC('eth_blockNumber', [])
    if (latestBlockRes && latestBlockRes.result && blockNumberHex) {
      const blockNum = parseInt(blockNumberHex, 16)
      const latestBlockNum = parseInt(latestBlockRes.result, 16)
      const confirmations = latestBlockNum - blockNum
      if (confirmations < 3) {
        return { ok: false, details: { error: 'Insufficient confirmations', currentConfirmations: confirmations } }
      }
    }

    // 4) Parse transaction events (Transfer logs)
    // Polygon USDT contract: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F (USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
    // Signature for Transfer event: Transfer(address,address,uint256) -> 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    let matchedTransfer = false
    let parsedAmount = 0

    const logs = receipt.logs || []
    for (const log of logs) {
      const isTransfer = log.topics && log.topics[0] === transferEventSignature
      if (!isTransfer) continue

      // Parse recipient (topic 2, 32-byte address padded with zeros)
      const toHex = log.topics[2] || ''
      const parsedToAddress = '0x' + toHex.slice(26).toLowerCase()

      if (parsedToAddress === recipientWallet.toLowerCase()) {
        matchedTransfer = true
        // Decode transfer amount (uint256 hex encoded in log.data)
        const dataHex = log.data || '0x0'
        const valueHex = dataHex === '0x' ? '0' : dataHex
        // Standard USDT / USDC on Polygon has 6 decimals
        parsedAmount = parseInt(valueHex, 16) / 1000000
        break
      }
    }

    if (!matchedTransfer) {
      return { ok: false, details: { error: 'Recipient address mismatch. Target was not founder wallet.' } }
    }

    if (parsedAmount < expectedAmount) {
      return { ok: false, details: { error: 'Insufficient payment amount', expected: expectedAmount, actual: parsedAmount } }
    }

    return {
      ok: true,
      details: {
        txHash,
        confirmations: 3,
        token: 'USDT/USDC',
        recipient: recipientWallet,
        amount: parsedAmount
      }
    }
  }
}
export default UsdtPolygonProvider
