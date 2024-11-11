import { BaseFrame } from './baseFrame';
import { V3 } from './v3';

export type TransformationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export const getWorldXYToFrameTransformation = (f: BaseFrame): TransformationMatrix => [
  f.x.x,
  f.y.x,
  f.z.x,
  f.o.x,
  f.x.y,
  f.y.y,
  f.z.y,
  f.o.y,
  f.x.z,
  f.y.z,
  f.z.z,
  f.o.z,
  0,
  0,
  0,
  1,
];

const getFrameToFrameForV3Transformation = (p: V3, fA: BaseFrame, fB: BaseFrame): V3 => {
  const v: V3 = { x: p.x, y: p.y, z: p.z };
  const oA: V3 = { x: fA.o.x, y: fA.o.y, z: fA.o.z };
  const xA: V3 = { x: fA.x.x, y: fA.x.y, z: fA.x.z };
  const yA: V3 = { x: fA.y.x, y: fA.y.y, z: fA.y.z };
  const zA: V3 = { x: fA.z.x, y: fA.z.y, z: fA.z.z };
  const oB: V3 = { x: fB.o.x, y: fB.o.y, z: fB.o.z };
  const xB: V3 = { x: fB.x.x, y: fB.x.y, z: fB.x.z };
  const yB: V3 = { x: fB.y.x, y: fB.y.y, z: fB.y.z };
  const zB: V3 = { x: fB.z.x, y: fB.z.y, z: fB.z.z };

  const locP = V3.sub(v, oA);
  const xT = V3.dot(locP, xA);
  const yT = V3.dot(locP, yA);
  const zT = V3.dot(locP, zA);

  const vProjected = V3.add(oB, V3.mul(xB, xT), V3.mul(yB, yT), V3.mul(zB, zT));
  return { x: vProjected.x, y: vProjected.y, z: vProjected.z };
};

export const getFrameToFrameTransformation = (a: BaseFrame, b: BaseFrame): TransformationMatrix => {
  const o = getFrameToFrameForV3Transformation({ x: 0, y: 0, z: 0 }, a, b);
  const x = getFrameToFrameForV3Transformation({ x: 1, y: 0, z: 0 }, a, b);
  const y = getFrameToFrameForV3Transformation({ x: 0, y: 1, z: 0 }, a, b);
  const z = getFrameToFrameForV3Transformation({ x: 0, y: 0, z: 1 }, a, b);
  const frame: BaseFrame = {
    o,
    x: { x: x.x - o.x, y: x.y - o.y, z: x.z - o.z },
    y: { x: y.x - o.x, y: y.y - o.y, z: y.z - o.z },
    z: { x: z.x - o.x, y: z.y - o.y, z: z.z - o.z },
  };
  return getWorldXYToFrameTransformation(frame);
};

export const WorldXY: BaseFrame = {
  o: V3.Origin,
  x: V3.XAxis,
  y: V3.YAxis,
  z: V3.ZAxis,
};
