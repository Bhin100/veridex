import { discoveryManager } from '../services/discovery/manager'
import { registerBuiltInConnectors } from '../services/discovery/register'
import { connectDatabase, disconnectDatabase } from '../lib/db'

export async function startDiscovery() {
  await connectDatabase()
  registerBuiltInConnectors()
  discoveryManager.startAll()
}

export async function stopDiscovery() {
  discoveryManager.stopAll()
  await disconnectDatabase()
}
