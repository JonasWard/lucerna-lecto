import { V3 } from '../helpers/v3'
import { Curve } from './curve'

export class WeightedBSpline implements Curve {
  public vertices: V3[]
  public weights: number[]
  public degree: number
  private baseFuncRangeInt: number
  private baseFunc: (t: number) => number

  constructor(vertices: V3[], weights: number[], degree: number) {
    this.vertices = vertices
    this.weights = weights
    this.degree = degree

    switch (degree) {
      case 2:
        this.baseFunc = this.basisDeg2
        this.baseFuncRangeInt = 2
        break
      case 3:
        this.baseFunc = this.basisDeg3
        this.baseFuncRangeInt = 2
        break
      case 4:
        this.baseFunc = this.basisDeg4
        this.baseFuncRangeInt = 3
        break
      case 5:
        this.baseFunc = this.basisDeg5
        this.baseFuncRangeInt = 3
        break
      default:
        this.baseFunc = this.basisDeg3
        this.degree = 3
        this.baseFuncRangeInt = 2
        break
    }
  }
  public isPeriodic: boolean
  public getLength: () => number

  public getVertexAtT = (t: number): V3 => this.calcAt(t)

  private seqAt = (dim: 0 | 1 | 2): ((n: number) => number) => {
    const vertices = this.vertices
    const margin = this.degree + 1
    const attribute = ['x', 'y', 'z'][dim] as keyof V3
    return (n: number): number => {
      if (n < margin) return vertices[0][attribute] * this.getWeightAt(0)
      else if (vertices.length + margin <= n)
        return vertices[vertices.length - 1][attribute] * this.getWeightAt(vertices.length - 1)
      else return vertices[n - margin][attribute] * this.getWeightAt(n - margin)
    }
  }

  private basisDeg2 = (x: number): number => {
    if (-0.5 <= x && x < 0.5) return 0.75 - x * x
    else if (0.5 <= x && x <= 1.5) return 1.125 + (-1.5 + x / 2.0) * x
    else if (-1.5 <= x && x < -0.5) return 1.125 + (1.5 + x / 2.0) * x
    else return 0
  }

  private basisDeg3 = (x: number): number => {
    if (-1 <= x && x < 0) return 2.0 / 3.0 + (-1.0 - x / 2.0) * x * x
    else if (1 <= x && x <= 2) return 4.0 / 3.0 + x * (-2.0 + (1.0 - x / 6.0) * x)
    else if (-2 <= x && x < -1) return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x)
    else if (0 <= x && x < 1) return 2.0 / 3.0 + (-1.0 + x / 2.0) * x * x
    else return 0
  }

  private basisDeg4 = (x: number): number => {
    if (-1.5 <= x && x < -0.5)
      return 55.0 / 96.0 + x * (-(5.0 / 24.0) + x * (-(5.0 / 4.0) + (-(5.0 / 6.0) - x / 6.0) * x))
    else if (0.5 <= x && x < 1.5) return 55.0 / 96.0 + x * (5.0 / 24.0 + x * (-(5.0 / 4.0) + (5.0 / 6.0 - x / 6.0) * x))
    else if (1.5 <= x && x <= 2.5)
      return 625.0 / 384.0 + x * (-(125.0 / 48.0) + x * (25.0 / 16.0 + (-(5.0 / 12.0) + x / 24.0) * x))
    else if (-2.5 <= x && x <= -1.5)
      return 625.0 / 384.0 + x * (125.0 / 48.0 + x * (25.0 / 16.0 + (5.0 / 12.0 + x / 24.0) * x))
    else if (-1.5 <= x && x < 1.5) return 115.0 / 192.0 + x * x * (-(5.0 / 8.0) + (x * x) / 4.0)
    else return 0
  }

  private basisDeg5 = (x: number): number => {
    if (-2 <= x && x < -1)
      return 17.0 / 40.0 + x * (-(5.0 / 8.0) + x * (-(7.0 / 4.0) + x * (-(5.0 / 4.0) + (-(3.0 / 8.0) - x / 24.0) * x)))
    else if (0 <= x && x < 1) return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 - x / 12.0) * x * x)
    else if (2 <= x && x <= 3)
      return 81.0 / 40.0 + x * (-(27.0 / 8.0) + x * (9.0 / 4.0 + x * (-(3.0 / 4.0) + (1.0 / 8.0 - x / 120.0) * x)))
    else if (-3 <= x && x < -2)
      return 81.0 / 40.0 + x * (27.0 / 8.0 + x * (9.0 / 4.0 + x * (3.0 / 4.0 + (1.0 / 8.0 + x / 120.0) * x)))
    else if (1 <= x && x < 2)
      return 17.0 / 40.0 + x * (5.0 / 8.0 + x * (-(7.0 / 4.0) + x * (5.0 / 4.0 + (-(3.0 / 8.0) + x / 24.0) * x)))
    else if (-1 <= x && x < 0) return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 + x / 12.0) * x * x)
    else return 0
  }

  private getWeightAt = (i: number): number => {
    if (i < 0) return this.weights[0]
    else if (i >= this.weights.length) return this.weights[this.weights.length - 1]
    else return this.weights[i]
  }

  private getInterpol = (seq: (n: number) => number, t: number): number => {
    const f = this.baseFunc
    const rangeInt = this.baseFuncRangeInt
    const tInt = Math.floor(t)
    let result = 0
    for (let i = tInt - rangeInt; i <= tInt + rangeInt; i++) result += seq(i) * f(t - i)

    return result
  }

  private calcAt = (t: number): V3 => {
    t = t * ((this.degree + 1) * 2 + this.vertices.length)
    return {
      x: this.getInterpol(this.seqAt(0), t),
      y: this.getInterpol(this.seqAt(1), t),
      z: this.getInterpol(this.seqAt(2), t),
    }
  }
}
