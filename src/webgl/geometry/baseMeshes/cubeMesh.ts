import { V2 } from '../helpers/v2'
import { V3 } from '../helpers/v3'
import { Mesh } from '../mesh/type'
import { getFacesForIndices } from './topology'

type LoopType = {
  vertices: V3[]
  normals: V3[]
  indices: number[][]
}

const MAX_BASE_GRID = 2

const getDivisions = (length: number, goalEdgeLength: number) => Math.ceil(length / goalEdgeLength)

const getVerticesAndNormalsForCenterAndRadius = (
  c: V3,
  r: number,
  startAngle: number,
  endAngle: number,
  goalEdgeLength: number
): { vertices: V3[]; normals: V3[] } => {
  if (r < 1e-3) {
    const n = { x: Math.cos((startAngle + endAngle) * 0.5), y: Math.sin((startAngle + endAngle) * 0.5), z: 0 }
    const v = V3.add(c, V3.mul(n, r))
    return {
      vertices: [v],
      normals: [n],
    }
  }

  const count = getDivisions((endAngle - startAngle) * r, goalEdgeLength)
  const vertices: V3[] = []
  const normals: V3[] = []

  for (let i = 0; i < count + 1; i++) {
    const alpha = startAngle + ((endAngle - startAngle) * i) / (count + 1)
    const n = { x: Math.cos(alpha), y: Math.sin(alpha), z: 0 }
    normals.push(n)
    vertices.push(V3.add(c, V3.mul(n, r)))
  }

  return {
    vertices,
    normals,
  }
}

const getInterpolatedVertices = (start: V3, end: V3, goalEdgeLength: number): { vertices: V3[]; normals: V3[] } => {
  const d = V3.sub(end, start)
  const l = V3.getLength(d)
  const divisions = getDivisions(l, goalEdgeLength)
  const n: V3 = { x: d.y / l, y: -d.x / l, z: d.z }
  const vertices: V3[] = []
  const normals: V3[] = []

  for (let i = 1; i < divisions; i++) {
    vertices.push(V3.add(start, V3.mul(d, i / divisions)))
    normals.push(n)
  }

  return {
    vertices,
    normals,
  }
}

const getVertexLoop = (w: number, d: number, z: number, r: number, goalEdgeLength: number): LoopType => {
  const corners = [
    { x: w * -0.5, y: d * -0.5, z },
    { x: w * 0.5, y: d * -0.5, z },
    { x: w * 0.5, y: d * 0.5, z },
    { x: w * -0.5, y: d * 0.5, z },
  ]

  const anglePairs: [number, number][] = [
    [Math.PI, Math.PI * 1.5],
    [Math.PI * 1.5, Math.PI * 2],
    [0, Math.PI * 0.5],
    [Math.PI * 0.5, Math.PI],
  ]

  const cornerPositions = corners.map((c, i) =>
    getVerticesAndNormalsForCenterAndRadius(c, r, anglePairs[i][0], anglePairs[i][1], goalEdgeLength)
  )
  const interpolatedVertices = cornerPositions.map((d, i, arr) =>
    getInterpolatedVertices(d.vertices[d.vertices.length - 1], arr[(i + 1) % arr.length].vertices[0], goalEdgeLength)
  )

  const vertices: V3[] = []
  const normals: V3[] = []
  const indices: number[][] = []

  let index = 0

  for (let i = 0; i < 4; i++) {
    normals.push(...cornerPositions[i].normals)
    normals.push(...interpolatedVertices[i].normals)
    vertices.push(...cornerPositions[i].vertices)
    vertices.push(...interpolatedVertices[i].vertices)

    const cornerIndexes: number[] = []

    for (let j = 0; j < cornerPositions[i].vertices.length; j++) {
      cornerIndexes.push(index)
      index++
    }
    const interpolatedIndexes: number[] = [index - 1]
    for (let j = 0; j < interpolatedVertices[i].vertices.length; j++) {
      interpolatedIndexes.push(index)
      index++
    }
    if (i === 3) interpolatedIndexes.push(0)
    else interpolatedIndexes.push(index)

    indices.push(cornerIndexes)
    indices.push(interpolatedIndexes)
  }

  return {
    vertices,
    normals,
    indices,
  }
}

export const getCubeMesh = (
  h: number,
  w: number,
  d: number,
  base?: {
    hBase: number
    baseAngle: number
  },
  maxRadius: number = 5,
  edgeRadius: number = 5,
  goalEdgeLength: number = MAX_BASE_GRID
): Mesh => {
  const vertices: V3[] = []
  const normals: V3[] = []
  const faces: number[][] = []
  const maxDistances: number[] = []

  const [rMinRaw, rMax] = [maxRadius, edgeRadius].sort((a, b) => a - b)
  const r0 = Math.min(rMinRaw, Math.max(h, w) * 0.5)

  const dMax = rMax - r0

  const indices: number[][][] = []
  let baseIndexCount = 0

  if (base) {
    const { hBase, baseAngle } = base

    const w0 = w - 2 * r0
    const d0 = d - 2 * r0

    // add the bottom of the base
    ;[0, hBase].forEach((z) => {
      const loop = getVertexLoop(w0, d0, z, 0, goalEdgeLength)
      vertices.push(...loop.vertices)
      normals.push(...loop.normals)
      indices.push(loop.indices.map((ix) => ix.map((i) => i + baseIndexCount)))
      loop.vertices.forEach(() => maxDistances.push(0))
      baseIndexCount += loop.vertices.length
    })

    // add the last non movable part of the base
    const zMinDelta = Math.tan((baseAngle * Math.PI) / 180) * r0
    const zMaxDelta = Math.tan((baseAngle * Math.PI) / 180) * rMax

    const vSlopeStart: V2 = { u: r0, v: hBase + zMinDelta }
    const slopeD: V2 = {
      u: rMax - r0,
      v: zMaxDelta - zMinDelta,
    }

    if (zMinDelta > h - hBase) {
      const loop = getVertexLoop(w0, d0, h, r0, goalEdgeLength)
      vertices.push(...loop.vertices)
      normals.push(...loop.normals)
      indices.push(loop.indices.map((ix) => ix.map((i) => i + baseIndexCount)))
      loop.vertices.forEach(() => maxDistances.push(0))
      baseIndexCount += loop.vertices.length
    } else {
      const l = V2.getLength(slopeD)
      const slopeDivsisions = getDivisions(l, goalEdgeLength)

      for (let i = 0; i < slopeDivsisions; i++) {
        const v = V2.add(vSlopeStart, V2.mul(slopeD, i / slopeDivsisions))

        const loop = getVertexLoop(w0, d0, v.v, r0, goalEdgeLength)
        vertices.push(...loop.vertices)
        normals.push(...loop.normals)
        indices.push(loop.indices.map((ix) => ix.map((i) => i + baseIndexCount)))
        loop.vertices.forEach(() => maxDistances.push(v.u - r0))
        baseIndexCount += loop.vertices.length
      }

      const hCount = getDivisions(h - hBase - zMaxDelta, goalEdgeLength)
      const hDelta = (h - hBase - zMaxDelta) / hCount

      for (let i = 0; i < hCount + 1; i++) {
        const loop = getVertexLoop(w0, d0, hBase + zMaxDelta + i * hDelta, r0, goalEdgeLength)
        vertices.push(...loop.vertices)
        normals.push(...loop.normals)
        indices.push(loop.indices.map((ix) => ix.map((i) => i + baseIndexCount)))
        loop.vertices.forEach(() => maxDistances.push(dMax))
        baseIndexCount += loop.vertices.length
      }
    }
  } else {
    const count = getDivisions(h, goalEdgeLength)
    const zDelta = h / count
    for (let i = 0; i < count + 1; i++) {
      const loop = getVertexLoop(w - 2 * edgeRadius, d - 2 * edgeRadius, i * zDelta, edgeRadius, goalEdgeLength)
      vertices.push(...loop.vertices)
      normals.push(...loop.normals)
      indices.push(loop.indices.map((ix) => ix.map((i) => i + baseIndexCount)))
      baseIndexCount += loop.vertices.length
    }

    for (let i = 0; i < vertices.length; i++) maxDistances.push(dMax)
  }

  for (let i = 0; i < indices.length - 1; i++)
    for (let j = 0; j < indices[i].length; j++) faces.push(...getFacesForIndices(indices[i][j], indices[i + 1][j]))

  return {
    vertices,
    normals,
    faces,
    maxDistances,
  }
}
