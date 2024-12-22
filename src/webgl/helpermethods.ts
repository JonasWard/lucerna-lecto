import { V3 } from './geometry/helpers/v3'

/**
 * Helper method that returns a random V4 UUID
 * @returns uuid V4 string
 */
export const getRandomUUID = (): string => {
  const validChars = '0123456789abcdef'
  const s = (count: number) =>
    [...Array(count)].map(() => validChars[Math.floor(Math.random() * validChars.length)]).join('')
  const M = ['1', '2', '3', '4', '5']
  const N = ['8', '9', 'a', 'b']
  return `${s(7)}-${s(4)}-${M[Math.floor(Math.random() * M.length)]}${s(3)}-${
    N[Math.floor(Math.random() * N.length)]
  }${s(3)}-${s(12)}`
}

/**
 * Returns a string hash of a V3 based on its position
 * It is used to quickly see whether vertices are coliding
 * @param v - V3 to be hashed
 * @returns string representation of the V3
 */
export const getVertexHash = (v: V3): string =>
  `${v.x.toFixed(2).replace('-0.00', '0.00')}_${v.y.toFixed(2).replace('-0.00', '0.00')}_${v.z
    .toFixed(2)
    .replace('-0.00', '0.00')}`

/**
 * Benchmarking helper method that wraps a method, returns it output and measure the output
 * @param fn - () => any method to benchmark
 * @param text - optional name / decsription of the method (displays as <text> took: <time> ms), default is the method name
 * @returns output of the method
 */
export const measurePerformance = (fn: () => any, text?: string) => {
  const start = performance.now()
  const output = fn()
  const end = performance.now()
  const fText = text ?? fn.name
  console.log(`${fText} took: ${(end - start).toFixed(2)} ms`)
  return output
}
