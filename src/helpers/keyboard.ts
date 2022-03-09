export const isCmd = (event: KeyboardEvent) => {
  return event.metaKey || event.altKey || event.ctrlKey
}
