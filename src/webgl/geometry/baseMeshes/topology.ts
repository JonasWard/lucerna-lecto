/**
 * Helper method to get faces for a pair of indices
 * @param setA - number[] pairs A
 * @param setB - number[] pairs B
 */
export const getFacesForIndices = (indexA: number[], indexB: number[]): number[][] => {
  const result: number[][] = []
  if (indexA.length === indexB.length && indexA.length === 1) return []
  if (indexA.length === indexB.length)
    for (let i = 0; i < indexA.length - 1; i++) result.push([indexA[i], indexA[i + 1], indexB[i + 1], indexB[i]])
  else if (indexA.length < indexB.length) return getFacesForIndices(indexB, indexA).map((r) => r.reverse())
  else if ((indexA.length - indexB.length) % 2 === 0) {
    const halfDiv = (indexA.length - indexB.length) / 2
    // introducing quads, but trim start and end
    for (let i = 0; i < halfDiv; i++) result.push([indexA[i], indexA[i + 1], indexB[0]])
    for (let i = 0; i < indexB.length - 1; i++)
      result.push([indexA[i + halfDiv], indexA[i + halfDiv + 1], indexB[i + 1], indexB[i]])
    for (let i = indexA.length - halfDiv - 1; i < indexA.length - 1; i++)
      result.push([indexA[i], indexA[i + 1], indexB[indexB.length - 1]])
  } else if ((indexA.length - indexB.length) % 2 === 1) {
    const halfDiv = (indexA.length - indexB.length - 1) / 2
    // introducing triangles, but trim start and end
    for (let i = 0; i < halfDiv; i++) result.push([indexA[i], indexA[i + 1], indexB[0]])
    for (let i = 0; i < indexB.length; i++) result.push([indexA[i + halfDiv], indexA[i + halfDiv + 1], indexB[i]])
    for (let i = 0; i < indexB.length - 1; i++) result.push([indexB[i + 1], indexB[i], indexA[i + halfDiv + 1]])
    for (let i = indexA.length - halfDiv - 1; i < indexA.length - 1; i++)
      result.push([indexA[i], indexA[i + 1], indexB[indexB.length - 1]])
  }

  return result
}
