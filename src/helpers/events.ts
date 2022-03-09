export const log = (emitter: EventTarget, ...args: any[]) => {
  const detail = { args }
  emitter.dispatchEvent(new CustomEvent('log.add', { detail }))
}

export const clear = (emitter: EventTarget) => {
  emitter.dispatchEvent(new Event('log.clear'))
}
