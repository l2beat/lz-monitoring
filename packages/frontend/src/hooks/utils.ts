export function hasBeenAborted(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === 'AbortError'
}
