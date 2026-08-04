import { DiscoveryManager } from './manager'
import { HttpConnector } from './httpConnector'
import { discoveryManager } from './manager'

// Register connectors via environment or dynamic plugin loader.
export function registerBuiltInConnectors() {
  // No hardcoded real sources. A placeholder example shows how to register one if configured.
  const sample = process.env.DISCOVERY_SAMPLE_ENDPOINT
  if (sample) {
    const c = new HttpConnector('sample-http', sample, { scanIntervalSec: 60 })
    discoveryManager.register(c)
  }
}
