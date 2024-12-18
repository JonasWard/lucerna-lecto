import { V2 } from '../helpers/v2'

const NO_SLOPE = 1e-3

class CircleRenderer {
  private points: V2[]

  constructor(points: V2[]) {
    if (points.length !== 3) {
      throw new Error('Circular spline requires exactly 3 points')
    }
    this.points = points
  }

  /**
   * Calculate the center and radius of the circumscribed circle
   * @returns Object containing center coordinates and radius
   */
  private calculateCircumcircle(): { center: V2; radius: number } | undefined {
    const [p1, p2, p3] = this.points

    // Calculate the midpoints of two chords
    const midAB = {
      u: (p1.u + p2.u) / 2,
      v: (p1.v + p2.v) / 2,
    }

    const midBC = {
      u: (p2.u + p3.u) / 2,
      v: (p2.v + p3.v) / 2,
    }

    // Calculate perpendicular slopes
    const slopeAB = -(p2.u - p1.u) / (p2.v - p1.v)
    const slopeBC = -(p3.u - p2.u) / (p3.v - p2.v)

    if (Math.abs(slopeAB - slopeBC) < NO_SLOPE) return undefined

    // Calculate center using intersection of perpendicular bisectors
    const centerX = (midBC.v - midAB.v + slopeAB * midAB.u - slopeBC * midBC.u) / (slopeAB - slopeBC)

    const centerY = midAB.v + slopeAB * (centerX - midAB.u)

    const center = { u: centerX, v: centerY }

    // Calculate radius
    const radius = Math.sqrt(Math.pow(center.u - p1.u, 2) + Math.pow(center.v - p1.v, 2))

    return { center, radius }
  }

  /**
   * Calculate the start and end angles for the arc
   * @returns Object with startAngle and endAngle in radians
   */
  private static calculateAngles(
    circle: { center: V2; radius: number },
    points: V2[]
  ): { startAngle: number; midAngle: number; endAngle: number } {
    const [p1, p2, p3] = points

    const startAngle = Math.atan2(p1.v - circle.center.v, p1.u - circle.center.u)
    const midAngle = Math.atan2(p2.v - circle.center.v, p2.u - circle.center.u)
    const endAngle = Math.atan2(p3.v - circle.center.v, p3.u - circle.center.u)

    return { startAngle, midAngle, endAngle }
  }

  /**
   * Generate points along the spline
   * @param numPoints Number of interpolated points to generate
   * @returns Array of interpolated points
   */
  public interpolate(goalLength: number): V2[] {
    const circle = this.calculateCircumcircle()
    const interpolatedPoints: V2[] = []
    if (!circle) {
      const d = V2.sub(this.points[2], this.points[0])

      const numPoints = Math.ceil(V2.getLength(d) / goalLength)

      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1)

        interpolatedPoints.push(V2.add(this.points[0], V2.mul(d, t)))
      }
    } else {
      const { startAngle, endAngle } = CircleRenderer.calculateAngles(circle, this.points)

      const rawAngle = endAngle - startAngle

      const reverse = Math.abs(rawAngle) > Math.PI
      const dAngle = reverse ? (Math.PI * 2 - Math.abs(rawAngle)) % Math.PI : rawAngle
      const angle0 = reverse ? endAngle : startAngle

      const numPoints = Math.ceil((Math.abs(dAngle) * circle.radius) / goalLength)

      for (let i = 0; i < numPoints + 1; i++) {
        const t = i / numPoints
        const angle = angle0 + dAngle * t

        interpolatedPoints.push({
          u: circle.center.u + circle.radius * Math.cos(angle),
          v: circle.center.v + circle.radius * Math.sin(angle),
        })
      }

      if (reverse) interpolatedPoints.reverse()
    }

    return interpolatedPoints
  }
}

export default CircleRenderer
