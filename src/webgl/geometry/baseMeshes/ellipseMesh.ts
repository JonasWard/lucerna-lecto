import { V3 } from '../helpers/v3';
import { Mesh } from '../mesh/type';
import { createLoftQuads } from './createLoftQuads';

const RADIAL_SPACING = 2.5;
const VERTICAL_SPACING = 10;

const createVertexAndNormalLoop = (r: number, css: [number, number][], z: number = 0, vs: V3[] = [], ns: V3[] = []): V3[] => {
  for (const [x, y] of css) {
    ns.push({ x, y, z: 0 });
    vs.push({ x: x * r, y: y * r, z });
  }

  return vs;
};

const getCosSinArray = (divs: number): [number, number][] => {
  const css: [number, number][] = [];
  for (let i = 0; i < divs; i++) {
    const a = (i / divs) * Math.PI * 2;
    css.push([Math.cos(a), Math.sin(a)]);
  }
  return css;
};

const getHeightRadii = (h: number, r0: number, r1: number): [number, number][] => {
  const r = (r1 - r0) * 0.5 + h ** 2 / ((r1 - r0) * 8);
  const theta = 2 * Math.asin((h * 0.5) / r);
  const divs = Math.ceil(h / VERTICAL_SPACING);
  const tDelta = theta / divs;

  console.log(r, theta, divs);

  const hrs: [number, number][] = [];

  for (let t = 0; t <= divs; t++) {
    const a = t * tDelta - 0.5 * theta;
    console.log(a);
    hrs.push([h * 0.5 + r * Math.sin(a), r0 + r * (1 - Math.cos(a))]);
  }

  return hrs;
};

export const getSphereMesh = (h: number, r0: number, r1: number): Mesh => {
  // row

  const vs: V3[] = [];
  const ns: V3[] = [];
  const fs: number[][] = [];

  const css = getCosSinArray(Math.ceil(Math.min(r0, r1) / RADIAL_SPACING));
  const hrs = getHeightRadii(h, r0, r1);

  console.log(css, hrs);

  for (let i = 0; i < hrs.length - 1; i++) {
    const [h, r] = hrs[i];
    createLoftQuads(vs.length, css.length, fs);
    createVertexAndNormalLoop(r, css, h, vs, ns);
  }

  createVertexAndNormalLoop(r1, css, h, vs, ns);

  return {
    vertices: vs,
    normals: ns,
    faces: fs,
  };
};
