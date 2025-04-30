const DEFAULT_MAX_ANGLE = 20

/**
 * Helper method mapping Y-axis value (sin) to X-axis value (cos)
 * @param y - number
 * @returns x - number
 */
const getArcXForYOfArcSegment = (y: number) => (1 - (1 - y) ** 2) ** 0.5

/**
 * Helper method for getting the arc generation data and method.
 * @param maxExpression - maximum width of the arc segment
 * @param maxAngle - angle of the tangent at the top of the arc segment
 * @returns \{ 
 *  dYMin: `number` - distance from max height from which the arching starts,
 *  getDMax: `(dY: number) => number` - method to get maximum distance for given vertical distance to the end of the arc 
 * \}
 */
export const getArcData = (maxExpression: number, maxAngle: number = DEFAULT_MAX_ANGLE) => {
  const localAngle = 90 - Math.max(0, Math.min(maxAngle, 90))

  const c = Math.cos((localAngle * Math.PI) / 180)
  const s = Math.sin((localAngle * Math.PI) / 180)

  // asumme that its just a circulat section
  if (s < 0.01) {
    const dYMin = maxExpression
    return {
      dYMin,
      getDMax: (dY: number) => maxExpression * getArcXForYOfArcSegment(dY / dYMin),
    }
  } else if (s > 0.99) {
    const dYMin = -1
    return {
      dYMin,
      getDMax: (dY: number) => maxExpression,
    }
  } else {
    const dS = 1 - s
    const dC = 1 - c
    const dYMin = (maxExpression * s) / dC
    return {
      dYMin,
      getDMax: (dY: number) => (maxExpression * (getArcXForYOfArcSegment(dS + (dY * s) / dYMin) - c)) / dC,
    }
  }
}
