import { V3 } from '../helpers/v3'
import { Curve } from './curve'

export class BSpline implements Curve {
  public vertices: V3[]
  public degree: number
  private baseFuncRangeInt: number
  private baseFunc: (t: number) => number
  private static SEGMENT_LENGTH_MAP_PRECISSION = 16
  // length is BSpline.segmentLengthMapPrecission * segments (-1 in case the curve isn't periodic)
  private localLengthMap: [number, number][]
  public isPeriodic: boolean = false
  private length: number = 0

  constructor(vertices: V3[], degree: number) {
    this.vertices = vertices
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

    this.localLengthMap = this.setLocalLengthMap()
  }

  private getSegmentLengthCount = () =>
    (this.vertices.length - (this.isPeriodic ? 0 : 1)) * BSpline.SEGMENT_LENGTH_MAP_PRECISSION -
    (this.isPeriodic ? 0 : 1)

  public setLocalLengthMap = () => {
    const localLengthMap: [number, number][] = []

    const segmentLengthCount = this.getSegmentLengthCount()
    const localVertices: V3[] = []

    let length = 0

    for (let i = 0; i <= segmentLengthCount; i++) localVertices.push(this.getVertexAtT(i / segmentLengthCount))
    for (let i = 0; i < segmentLengthCount; i++) {
      const localLength = V3.getLength(V3.sub(localVertices[i], localVertices[i + 1]))
      length += localLength
      localLengthMap.push([length, localLength])
    }

    this.length = length
    return localLengthMap
  }

  public getVertexAtT = (t: number): V3 => this.calcAt(t)

  private seqAt = (dim: 0 | 1 | 2): ((n: number) => number) => {
    const vertices = this.vertices
    const margin = this.degree + 1
    const attribute = ['x', 'y', 'z'][dim] as keyof V3
    return (n: number): number => {
      if (n < margin) return vertices[0][attribute]
      else if (vertices.length + margin <= n) return vertices[vertices.length - 1][attribute]
      else return vertices[n - margin][attribute]
    }
  }

  public getLength(interval?: [number, number]): number {
    if (!interval) return this.length
    // otherwise get the length of the intervals starting at interval[0] and ending at interval[1]
    const [start, end] = interval.sort()
  }

  private basisDeg2 = (x: number): number => {
    if (-0.5 <= x && x < 0.5) return 0.75 - x * x
    else if (0.5 <= x && x <= 1.5) return 1.125 + (-1.5 + x * 0.5) * x
    else if (-1.5 <= x && x < -0.5) return 1.125 + (1.5 + x * 0.5) * x
    else return 0
  }

  private basisDeg3 = (x: number): number => {
    if (-1 <= x && x < 0) return 2.0 / 3.0 + (-1.0 - x * 0.5) * x * x
    else if (1 <= x && x <= 2) return 4.0 / 3.0 + x * (-2.0 + (1.0 - x / 6.0) * x)
    else if (-2 <= x && x < -1) return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x)
    else if (0 <= x && x < 1) return 2.0 / 3.0 + (-1.0 + x * 0.5) * x * x
    else return 0
  }

  private basisDeg4 = (x: number): number => {
    if (-1.5 <= x && x < -0.5)
      return 55.0 / 96.0 + x * (-(5.0 / 24.0) + x * (-(5.0 * 0.25) + (-(5.0 / 6.0) - x / 6.0) * x))
    else if (0.5 <= x && x < 1.5)
      return 55.0 / 96.0 + x * (5.0 / 24.0 + x * (-(5.0 * 0.25) + (5.0 / 6.0 - x / 6.0) * x))
    else if (1.5 <= x && x <= 2.5)
      return 625.0 / 384.0 + x * (-(125.0 / 48.0) + x * (25.0 * 0.0625 + (-(5.0 / 12.0) + x / 24.0) * x))
    else if (-2.5 <= x && x <= -1.5)
      return 625.0 / 384.0 + x * (125.0 / 48.0 + x * (25.0 * 0.0625 + (5.0 / 12.0 + x / 24.0) * x))
    else if (-1.5 <= x && x < 1.5) return 115.0 / 192.0 + x * x * (-(5.0 * 0.125) + x * x * 0.25)
    else return 0
  }

  private basisDeg5 = (x: number): number => {
    if (-2 <= x && x < -1)
      return (
        17.0 * 0.025 +
        x * (-(5.0 * 0.125) + x * (-(7.0 * 0.25) + x * (-(5.0 * 0.25) + (-(3.0 * 0.125) - x / 24.0) * x)))
      )
    else if (0 <= x && x < 1) return 11.0 * 0.05 + x * x * (-(1.0 * 0.5) + (1.0 * 0.25 - x / 12.0) * x * x)
    else if (2 <= x && x <= 3)
      return (
        81.0 * 0.025 + x * (-(27.0 * 0.125) + x * (9.0 * 0.25 + x * (-(3.0 * 0.25) + (1.0 * 0.125 - x / 120.0) * x)))
      )
    else if (-3 <= x && x < -2)
      return 81.0 * 0.025 + x * (27.0 * 0.125 + x * (9.0 * 0.25 + x * (3.0 * 0.25 + (1.0 * 0.125 + x / 120.0) * x)))
    else if (1 <= x && x < 2)
      return 17.0 * 0.025 + x * (5.0 * 0.125 + x * (-(7.0 * 0.25) + x * (5.0 * 0.25 + (-(3.0 * 0.125) + x / 24.0) * x)))
    else if (-1 <= x && x < 0) return 11.0 * 0.05 + x * x * (-(1.0 * 0.5) + (1.0 * 0.25 + x / 12.0) * x * x)
    else return 0
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

  private getVertexAtLength = (l: number): V3 => {
    if (l <= 0) return this.getVertexAtT(0)
    else if (l >= this.length) return this.getVertexAtT(1)
    // find the index for which the cumulativeSegment length is greater than l
    const index = this.localLengthMap.findIndex(([cumLength, _]) => cumLength > l)
    return this.getVertexAtT(
      (index + (l - this.localLengthMap[index][0]) / this.localLengthMap[index][1]) / this.getSegmentLengthCount()
    )
  }

  public getEquiDistancePoints = (c: number): V3[] => {
    if (c < 2) throw new Error("can't have fewer than 2 vertices")
    const lDelta = this.length / (c - 1)
    const points = []
    for (let l = 0; l <= this.length; l += lDelta) points.push(this.getVertexAtLength(l))
    return points
  }
}
