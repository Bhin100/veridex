import { workerRegistry } from './registry'

// ensure worker modules are loaded so they auto-register
// Importing the modules has side-effect of registering them in registry
import './website.worker'
import './wordpress.worker'
import './bugfix.worker'
import './content.worker'
import './docs.worker'
import './data.worker'
import './research.worker'

export function initWorkers() {
  // no-op; modules register themselves on import
  return workerRegistry.list()
}
