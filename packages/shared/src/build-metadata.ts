export const BUILD_METADATA = {
  version: process.env.npm_package_version || '0.0.0',
  git_sha: process.env.BUILD_GIT_SHA || process.env.GIT_SHA || 'dev',
  build_ts: process.env.BUILD_TS || new Date().toISOString()
}
