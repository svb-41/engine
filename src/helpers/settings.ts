export const getInitialSpeed = () => {
  const stored = localStorage.getItem('state.initialSpeed') ?? '1'
  const result = parseInt(stored, 10)
  return result
}

export const setInitialSpeed = (value: number) => {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem('state.initialSpeed', value.toString())
  }
}
