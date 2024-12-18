import { V3 } from '../helpers/v3'

export abstract class Curve {
  public vertices: V3[] = []
  public isPeriodic: boolean = false
  static SegmentResolution = 32
  public getVertexAtT = (t: number): V3 => ({ x: 0, y: 0, z: 0 })
  /**
   * Method that renders the polyline representation of the curve and finds the total length of that polyline
   * @returns number, total length of the curve
   */
  public getLength = (): number => 0
}
