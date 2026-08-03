export class ServiceContainer {
  private map = new Map<string, any>()

  register<T>(name: string, instance: T) {
    this.map.set(name, instance)
  }

  resolve<T>(name: string): T {
    if (!this.map.has(name)) throw new Error(`Service ${name} not registered`)
    return this.map.get(name)
  }
}

export const container = new ServiceContainer()
