export interface SecretProvider {
  getSecret(key: string): Promise<string | undefined>
}

export class EnvSecretProvider implements SecretProvider {
  async getSecret(key: string) {
    return process.env[key]
  }
}

export class VaultSecretProvider implements SecretProvider {
  // Placeholder adapter. To enable Vault provide configuration via env and
  // implement the client here. No credentials are stored in the repo.
  async getSecret(key: string) {
    // TODO: integrate HashiCorp Vault client when secrets are provisioned.
    return undefined
  }
}
