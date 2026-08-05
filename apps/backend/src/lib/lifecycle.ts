type InitFn = () => Promise<void>
type ShutdownFn = () => Promise<void>

export class Lifecycle {
  private initFns: InitFn[] = []
  private shutdownFns: ShutdownFn[] = []

  register(initFn: InitFn, shutdownFn?: ShutdownFn) {
    this.initFns.push(initFn)
    if (shutdownFn) this.shutdownFns.push(shutdownFn)
  }

  async start() {
    for (const fn of this.initFns) {
      await fn()
    }
  }

  async stop() {
    for (const fn of this.shutdownFns.reverse()) {
      try {
        await fn()
      } catch (err) {
        // swallow to continue shutdown
      }
    }
  }
}

export const lifecycle = new Lifecycle()
