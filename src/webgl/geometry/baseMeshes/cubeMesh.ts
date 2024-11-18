import { V3 } from '../helpers/v3';
import { Mesh } from '../mesh/type';
import { createLoftQuads } from './createLoftQuads';

const MAX_BASE_GRID = 10;
const INSET_ANGLE = 40;

const createVertexLoop = (w: number, wC: number, d: number, dC: number, z: number = 0, vs: V3[] = []): V3[] => {
  const origin: V3 = { x: w * -0.5, y: d * -0.5, z };
  vs.push(origin);
  const wD = w / wC;
  const dD = d / dC;

  let i = 0;
  for (i = 0; i < wC; i++) vs.push({ x: vs[vs.length - 1].x + wD, y: vs[vs.length - 1].y, z });
  for (i = 0; i < dC; i++) vs.push({ x: vs[vs.length - 1].x, y: vs[vs.length - 1].y + dD, z });
  for (i = 0; i < wC; i++) vs.push({ x: vs[vs.length - 1].x - wD, y: vs[vs.length - 1].y, z });
  for (i = 0; i < dC - 1; i++) vs.push({ x: vs[vs.length - 1].x, y: vs[vs.length - 1].y - dD, z });

  return vs;
};

const sqrt2div2 = 1; // / Math.sqrt(2);

const corners: V3[] = [
  { x: -sqrt2div2, y: -sqrt2div2, z: 0 },
  { x: sqrt2div2, y: -sqrt2div2, z: 0 },
  { x: sqrt2div2, y: sqrt2div2, z: 0 },
  { x: -sqrt2div2, y: sqrt2div2, z: 0 },
];

const sides: V3[] = [
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: -1, y: 0, z: 0 },
];

const createNormalLoop = (wC: number, dC: number, noNormal: boolean = true, ns: V3[] = []): V3[] => {
  ns.push(corners[0]);
  for (let i = 0; i < wC - 1; i++) ns.push(sides[0]);
  ns.push(corners[1]);
  for (let i = 0; i < dC - 1; i++) ns.push(sides[1]);
  ns.push(corners[2]);
  for (let i = 0; i < wC - 1; i++) ns.push(sides[2]);
  ns.push(corners[3]);
  for (let i = 0; i < dC - 1; i++) ns.push(sides[3]);
  return ns;
};

export const getCubeMesh = (h: number, inset: number, hBase: number, w: number, d: number): Mesh => {
  // row
  const xCount = Math.max(1, Math.ceil((w - inset * 2) / Math.max((w - inset * 2) / inset, MAX_BASE_GRID)));
  const yCount = Math.max(1, Math.ceil((d - inset * 2) / Math.max((d - inset * 2) / inset, MAX_BASE_GRID)));

  const baseLoopCount = (xCount + yCount) * 2;
  const shapeLoopCount = (xCount + yCount + 4) * 2;

  const vs: V3[] = [];
  const ns: V3[] = [];
  const fs: number[][] = [];
  // first row
  createLoftQuads(0, baseLoopCount, fs);

  createVertexLoop(w - inset * 2, xCount, d - inset * 2, yCount, 0, vs);
  createNormalLoop(xCount, yCount, true, ns);

  createVertexLoop(w - inset * 2, xCount, d - inset * 2, yCount, hBase, vs);
  createNormalLoop(xCount, yCount, true, ns);

  // lofting top and bottom
  let iInner = baseLoopCount;
  let iOuter = 2 * baseLoopCount - 1;
  fs.push([iInner, 2 * baseLoopCount + 1, 2 * baseLoopCount, 2 * baseLoopCount + shapeLoopCount - 1]);
  iOuter += 2;
  for (let j = 0; j < xCount; j++) {
    fs.push([iInner, iInner + 1, iOuter + 1, iOuter]);
    iInner++;
    iOuter++;
  }
  fs.push([iInner, iOuter + 2, iOuter + 1, iOuter]);
  iOuter += 2;
  for (let j = 0; j < yCount; j++) {
    fs.push([iInner, iInner + 1, iOuter + 1, iOuter]);
    iInner++;
    iOuter++;
  }
  fs.push([iInner, iOuter + 2, iOuter + 1, iOuter]);
  iOuter += 2;
  for (let j = 0; j < xCount; j++) {
    fs.push([iInner, iInner + 1, iOuter + 1, iOuter]);
    iInner++;
    iOuter++;
  }
  fs.push([iInner, iOuter + 2, iOuter + 1, iOuter]);
  iOuter += 2;
  for (let j = 0; j < yCount - 1; j++) {
    fs.push([iInner, iInner + 1, iOuter + 1, iOuter]);
    iInner++;
    iOuter++;
  }
  // fs.push([iInner + 1, baseLoopCount, 2 * baseLoopCount + shapeLoopCount - 1, 2 * baseLoopCount]);
  fs.push([2 * baseLoopCount - 1, baseLoopCount, iOuter + 1, iOuter]);

  const insetHeight = Math.tan((INSET_ANGLE * Math.PI) / 180) * inset;

  const zCount = Math.max(1, h / Math.max((h - insetHeight) / inset, MAX_BASE_GRID));
  const zD = (h - insetHeight) / zCount;

  for (let i = 0; i <= zCount; i++) {
    if (i < zCount - 1) createLoftQuads(vs.length, shapeLoopCount, fs);

    const z = zD * i + hBase + insetHeight;
    createVertexLoop(w, xCount + 2, d, yCount + 2, z, vs).length;
    createNormalLoop(xCount + 2, yCount + 2, true, ns);
  }

  return {
    vertices: vs,
    normals: ns,
    faces: fs,
  };
};
