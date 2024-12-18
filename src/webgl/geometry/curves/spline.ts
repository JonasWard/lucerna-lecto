import { V3 } from '../helpers/v3'
import { Curve } from './curve'

export class NurbsCurve implements Curve {
  public static SegmentResolution = 32
  constructor(vertices: V3[], weights: number[], degree: number, closed: boolean) {
    this.vertices = vertices
    this.weights = weights
    this.isPeriodic = closed
    this.degree = degree
  }
  public vertices: V3[]
  public weights: number[]
  public isPeriodic: boolean
  public degree: number

  /**
   * Generate a knot vector
   * @returns Array of knot values
   */
  private generateKnotVector(): number[] {
    const n = this.vertices.length - 1
    const knots: number[] = []

    if (this.isPeriodic) {
      // Periodic knot vector generation
      for (let i = 0; i <= n + this.degree; i++) knots.push(i)
    } else {
      // Clamped knot vector generation
      for (let i = 0; i <= this.degree; i++) knots.push(0)
      const innerKnotCount = n - this.degree + 1
      for (let i = 1; i < innerKnotCount; i++) knots.push(i / (innerKnotCount - 1))
      for (let i = 0; i <= this.degree; i++) knots.push(1)
    }

    return knots
  }

  /**
   * Calculates the basis functions for B-Spline interpolation
   * @param t Interpolation parameter
   * @param k Knot index
   * @param p Degree of the spline
   * @param knots Knot vector
   * @returns Array of basis function values
   */
  private calculateBasisFunctions(t: number, k: number, p: number, knots: number[]): number[] {
    const N: number[] = new Array(p + 1).fill(0)
    N[0] = 1

    for (let j = 1; j <= p; j++) {
      let saved = 0
      for (let i = 0; i < j; i++) {
        const Lki = knots[k + i] - knots[k + i - j]
        const Lkj = knots[k + j] - knots[k - 1]
        const temp = N[i] / Lkj
        N[i] = saved + Lki * temp
        saved = (1 - Lki) * temp
      }
      N[j] = saved
    }

    return N
  }

  /**
   * Interpolate a point along the weighted spline
   * @param t Interpolation parameter (0 to 1)
   * @returns Interpolated vertex
   */
  public getVertexAtT(t: number): V3 {
    const knots = this.generateKnotVector()
    const n = this.vertices.length - 1

    // Adjust t for periodic or clamped spline
    let adjustedT = t
    if (this.isPeriodic) {
      adjustedT = t * (n + 1)
    } else {
      adjustedT = t * (n - this.degree + 1) + this.degree
    }

    const k = Math.floor(adjustedT)
    const localT = adjustedT - k

    // Calculate basis functions
    const basisFuncs = this.calculateBasisFunctions(localT, k, this.degree, knots)

    // Interpolate coordinates with weights
    const result: V3 = { x: 0, y: 0, z: 0 }
    let totalWeight = 0

    for (let i = 0; i <= this.degree; i++) {
      const idx = this.isPeriodic ? (k - this.degree + i + n + 1) % (n + 1) : k - this.degree + i
      const weight = this.weights[idx] * basisFuncs[i]

      result.x += this.vertices[idx].x * weight
      result.y += this.vertices[idx].y * weight
      result.z += this.vertices[idx].z * weight

      totalWeight += weight
    }

    // Normalize by total weight
    result.x /= totalWeight
    result.y /= totalWeight
    result.z /= totalWeight

    return result
  }

  public getLength = (interval?: [number, number]): number => {
    const vs = this.getRenderPoints()
    return vs.reduce((acc, v, i) => acc + (i > 0 ? V3.getLength(V3.sub(vs[i - 1], v)) : 0), 0)
  }
  private getRenderPoints = (): V3[] =>
    this.getPoints(this.vertices.length + (this.isPeriodic ? 1 : 0) * NurbsCurve.SegmentResolution)
  public getPoints = (v: number): V3[] => [...Array(v + 1)].map((_, i) => this.getVertexAtT(i / v))
}
