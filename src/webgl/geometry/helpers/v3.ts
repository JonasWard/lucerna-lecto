import { QuadFace } from './face';
import { TransformationMatrix } from './transformation';
import { V2 } from './v2';

export interface V3 {
  x: number;
  y: number;
  z: number;
}

export class V3 {
  private static zeroTolerance = 1e-3;
  private static zeroToleranceSquared = V3.zeroTolerance ** 2;
  private static massAdd = (vertices: V3[]): V3 => vertices.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }), { x: 0, y: 0, z: 0 });
  public static add = (...vertices: V3[]): V3 => V3.massAdd(vertices);
  public static sub = (v1: V3, v2: V3): V3 => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
  public static mul = (v: V3, s: number): V3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
  public static dot = (v1: V3, v2: V3): number => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  public static cross = (v1: V3, v2: V3): V3 => ({
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  });
  public static getCenter = (vs: V3[]): V3 => V3.mul(V3.massAdd(vs), 1 / vs.length);
  public static getLengthSquared = (v: V3): number => v.x ** 2 + v.y ** 2 + v.z ** 2;
  public static getLength = (v: V3): number => (v.x ** 2 + v.y ** 2 + v.z ** 2) ** 0.5;
  public static getUnit = (v: V3): V3 => (V3.getLengthSquared(v) > V3.zeroToleranceSquared ? V3.mul(v, 1 / V3.getLength(v)) : V3.Origin);
  public static getHash = (v: V3) =>
    `${v.x.toFixed(2).replace('-0.00', '0.00')}_${v.y.toFixed(2).replace('-0.00', '0.00')}_${v.z.toFixed(2).replace('-0.00', '0.00')}`;
  public static transform = (v: V3, m: TransformationMatrix): V3 => ({
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
    y: m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
    z: m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11],
  });
  public static get XAxis() {
    return { x: 1, y: 0, z: 0 };
  }
  public static get YAxis() {
    return { x: 0, y: 1, z: 0 };
  }
  public static get ZAxis() {
    return { x: 0, y: 0, z: 1 };
  }
  public static get Origin() {
    return { x: 0, y: 0, z: 0 };
  }
  public static curveForQuad = (f: QuadFace, uvs: V2[]): V3[] =>
    uvs.map((uv) =>
      V3.add(V3.mul(f.v00, (1 - uv.u) * (1 - uv.v)), V3.mul(f.v10, (1 - uv.u) * uv.v), V3.mul(f.v01, uv.u * (1 - uv.v)), V3.mul(f.v11, uv.u * uv.v))
    );
  public static getNormalForVertices = (vs: V3[]): V3 => {
    if (vs.length < 3) return V3.ZAxis;
    const [a, b, c] = vs;
    return V3.getUnit(V3.cross(V3.sub(c, b), V3.sub(a, b)));
  };
  public static getBoundingBox = (vs: V3[]): { min: V3; max: V3 } => {
    const min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: Number.MAX_VALUE };
    const max = { x: -Number.MAX_VALUE, y: -Number.MAX_VALUE, z: -Number.MAX_VALUE };
    vs.forEach((v) => {
      min.x = Math.min(min.x, v.x);
      min.y = Math.min(min.y, v.y);
      min.z = Math.min(min.z, v.z);
      max.x = Math.max(max.x, v.x);
      max.y = Math.max(max.y, v.y);
      max.z = Math.max(max.z, v.z);
    });
    return { min, max };
  };
  public static fromNumbers = (x: number, y?: number, z?: number): V3 => ({
    x,
    y: y === undefined ? x : y,
    z: z === undefined ? (y === undefined ? x : y) : z,
  });
  public static getVectorAngle(a: V3, b: V3): number {
    if (V3.getLengthSquared(a) < V3.zeroToleranceSquared || V3.getLengthSquared(b) < V3.zeroToleranceSquared)
      throw new Error('Cannot compute angle of zero-length vector.');
    const dotCos = V3.dot(a, b) / (V3.getLength(a) * V3.getLength(b));
    const angle = Math.acos(Math.min(Math.max(dotCos, -1), 1));

    // avoiding cross product calculations that don't make sense
    if (Math.abs(angle) < V3.zeroTolerance) return 0;
    if (Math.abs(Math.PI - angle) < V3.zeroTolerance) return Math.PI;

    // if the reference is defined and the vectors are anti-parallel, return the complement of the angle
    if (V3.dot(V3.cross(a, b), V3.ZAxis) < 0) return Math.PI * 2 - angle;

    return angle;
  }
}
