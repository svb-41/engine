export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export const clear = () => postMessage({ type: 'log.clear' })
export const logger = (...values: any[]) =>
  postMessage({ type: 'log.add', values })
