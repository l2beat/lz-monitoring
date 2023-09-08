import { execSync } from 'child_process'

export function getGitCommitSha(): string | undefined {
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    console.warn('Unable to read commit sha')
  }
}
