export const buildTime = new Date().toISOString()
export const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'dev'
