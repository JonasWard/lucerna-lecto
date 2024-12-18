import CircleRenderer from '../curves/circle'
import { V2 } from '../helpers/v2'
import { V3 } from '../helpers/v3'
import { Mesh } from '../mesh/type'
import { createLoftQuads } from './createLoftQuads'

const RADIAL_SPACING = 2.5
const VERTICAL_SPACING = 10

const createVertexAndNormalLoop = (
  r: number,
  css: [number, number][],
  z: number = 0,
  vs: V3[] = [],
  ns: V3[] = []
): V3[] => {
  for (const [x, y] of css) {
    ns.push({ x, y, z: 0 })
    vs.push({ x: x * r, y: y * r, z })
  }

  return vs
}

const getCosSinArray = (divs: number): [number, number][] => {
  const css: [number, number][] = []
  for (let i = 0; i < divs; i++) {
    const a = (i / divs) * Math.PI * 2
    css.push([Math.cos(a), Math.sin(a)])
  }
  return css
}

const getHeightRadii = (h: number, rBottom: number, rMid: number, rTop: number): V2[] => {
  const v0 = { u: rBottom, v: 0 }
  const v1 = { u: rMid, v: h * 0.5 }
  const v2 = { u: rTop, v: h }

  return new CircleRenderer([v0, v1, v2]).interpolate(VERTICAL_SPACING)
}

export const getSphereMesh = (h: number, r0: number, r1: number, r2: number): Mesh => {
  // row

  const vs: V3[] = []
  const ns: V3[] = []
  const fs: number[][] = []

  const css = getCosSinArray(Math.ceil(Math.min(r0, r1) / RADIAL_SPACING))
  const hrs = getHeightRadii(h, r0, r1, r2)

  for (let i = 0; i < hrs.length; i++) {
    const uv = hrs[i]
    if (i < hrs.length - 1) createLoftQuads(vs.length, css.length, fs)
    createVertexAndNormalLoop(uv.u, css, uv.v, vs, ns)
  }

  return {
    vertices: vs,
    normals: ns,
    faces: fs,
  }
}
