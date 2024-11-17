import { V3 } from '../helpers/v3';

// 3d methods
export const sdGyroid = (v: V3, scale = 1) =>
  Math.sin(v.x * scale) * Math.cos(v.y * scale) + Math.sin(v.y * scale) * Math.cos(v.z * scale) + Math.sin(v.z * scale) * Math.cos(v.x * scale);
export const sdSchwarzP = (v: V3, scale = 1) => Math.cos(v.x * scale) + Math.cos(v.y * scale) + Math.cos(v.z * scale);
export const sdSchwarzD = (v: V3, scale = 1) =>
  Math.cos(v.x * scale) * Math.cos(v.y * scale) * Math.cos(v.z * scale) - Math.sin(v.x * scale) * Math.sin(v.y * scale) * Math.sin(v.z * scale);
export const sdNeovius = (v: V3, scale = 1) =>
  3 * (Math.cos(v.x * scale) + Math.cos(v.y * scale) + Math.cos(v.z * scale)) - 4 * Math.cos(v.x * scale) * Math.cos(v.y * scale) * Math.cos(v.z * scale);

export const sdSphere = (v: V3, scale = 1, c: V3 = V3.fromNumbers(0, 0, 0)) => V3.getLength(V3.sub(v, c)) * scale - 1;
export const sdBox = (v: V3, scale = 1) => Math.max(Math.abs(v.x * scale), Math.abs(v.y * scale), Math.abs(v.z * scale)) - 1;
export const sdTorus = (v: V3, scale = 1) => {
  const r1 = 1;
  const r2 = 0.25;
  const q = V3.fromNumbers(V3.getLength(V3.fromNumbers(v.x * scale, v.z * scale)) - r1, v.y * scale);
  return V3.getLength(q) - r2;
};

export const sdBoolean = (d0: number, d1: number): number => Math.min(d0, d1);
export const sdDifference = (d0: number, d1: number): number => Math.max(-d0, d1);
export const sdIntersection = (d0: number, d1: number): number => Math.max(d0, d1);
