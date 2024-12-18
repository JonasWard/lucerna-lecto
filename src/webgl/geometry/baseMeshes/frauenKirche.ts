import { BSpline } from '../curves/bSpline'
import { V3 } from '../helpers/v3'
import { Mesh } from '../mesh/type'
import { getFacesForIndices } from './topology'

const MAX_BASE_LENGTH = 4
const BASE_INSET = 1
const MINIMUM_LENGTH = 0.001

// structure has 3 parts from a base curve perspective
// 1. the tower - lofting between 4 curves
// 2. the lower part of the spire that also has alcoves - lofting between 12 curves
// 3. spire part on top (exclusively spire) - lofting between 4 curves
// to generate the entire structure, one first decides at which heights to render the geometry
// for each height, vertices and normals are found and index stored in a set
// then for each height pair, index[] pairs are used to ge and a mesh topology to fit them is generated
// however, some custom meshing logic needs to be defined for the transition areas

const getVertices = (p0: V3, p1: V3): V3[] => {
  const d = V3.sub(p1, p0)
  const l = V3.getLength(d)
  if (l < MAX_BASE_LENGTH) return [p0]
  else {
    const dCount = Math.ceil(l / MAX_BASE_LENGTH)
    return [...Array(dCount)].map((_, i) => V3.add(p0, V3.mul(d, i / dCount)))
  }
}

const getNormalsForVertices = (vertices: V3[]): V3[] => {
  const normals: V3[] = []
  // getting the positive angle
  for (let i = 0; i < vertices.length; i++) {
    const d0 = V3.sub(vertices[(i + vertices.length - 1) % vertices.length], vertices[i])
    const d1 = V3.sub(vertices[(i + 1) % vertices.length], vertices[i])

    const angle = V3.getVectorAngle(d0, d1) * 0.5

    normals.push(
      V3.getUnit({
        x: d0.x * Math.cos(angle) - d0.y * Math.sin(angle),
        y: d0.x * Math.sin(angle) + d0.y * Math.cos(angle),
        z: 0,
      })
    )
  }

  return normals
}

const addVerticesAndGetLayerIndexesForBase = (
  basePoints: V3[],
  startIndex: number,
  zeroCount = 4
): [V3[], V3[], number[][]] => {
  if (basePoints.length === 1)
    return [basePoints, [{ x: 0, y: 0, z: 0 }], [...Array(zeroCount)].map(() => [startIndex])]

  const layerIndexArrays: number[][] = []
  let vertexArray: V3[] = []

  for (let i = 0; i < basePoints.length; i++) {
    const localStartIndex = startIndex + vertexArray.length

    const p0 = basePoints[i]
    const p1 = basePoints[(i + 1) % basePoints.length]
    const newVertices = getVertices(p0, p1)
    vertexArray = vertexArray.concat(newVertices)

    const layerIndexArray: number[] = []

    for (let j = 0; j < newVertices.length; j++) layerIndexArray.push(localStartIndex + j)
    if (i === basePoints.length - 1) layerIndexArray.push(startIndex)
    else layerIndexArray.push(layerIndexArray[layerIndexArray.length - 1] + 1)

    layerIndexArrays.push(layerIndexArray)
  }

  return [vertexArray, getNormalsForVertices(vertexArray), layerIndexArrays]
}

export const frauenKirche = (
  sideWidth: number,
  baseHeight: number,
  spireHeight: number,
  sideCount: number,
  proportionSpire: number,
  expressionSpire: number
): Mesh => {
  const vertices: V3[] = []
  const normals: V3[] = []
  let faces: number[][] = []
  const z0 = (baseHeight + spireHeight) * -0.5

  // outer radius of regular polygon based on side width and side count
  const baseRadius = sideWidth / Math.tan(Math.PI / sideCount)

  const pts = [...Array(sideCount)].map((_, i) => ({
    x: baseRadius * Math.cos((i * (Math.PI * 2)) / sideCount),
    y: baseRadius * Math.sin((i * (Math.PI * 2)) / sideCount),
    z: 0,
  }))

  let lastLayerIndexes: number[][] | undefined = undefined

  // making the base a thing
  const baseCount = Math.ceil(baseHeight / MAX_BASE_LENGTH)
  const heightDelta = baseHeight / baseCount

  for (let i = 0; i < baseCount; i++) {
    const z = z0 + i * heightDelta
    const [newVertices, newNormals, currentLayerIndexes] = addVerticesAndGetLayerIndexesForBase(
      pts.map((v) => ({ ...v, z })),
      vertices.length
    )
    vertices.push(...newVertices)
    normals.push(...newNormals)
    if (lastLayerIndexes)
      for (let i = 0; i < currentLayerIndexes.length; i++)
        faces = faces.concat(getFacesForIndices(lastLayerIndexes[i], currentLayerIndexes[i]))
    lastLayerIndexes = currentLayerIndexes
  }

  if (spireHeight < MINIMUM_LENGTH)
    return {
      vertices,
      normals,
      faces,
    }

  // making the spire a thing
  const spireCurves: BSpline[] = pts.map(
    (p) =>
      new BSpline(
        [
          { ...p, z: z0 + baseHeight },
          {
            x: p.x * (0.1 + (1 + proportionSpire) * 0.45),
            y: p.y * (0.1 + (1 + proportionSpire) * 0.45),
            z: z0 + spireHeight * ((1 + proportionSpire) * 0.5),
          },
          { x: p.x * 0.1, y: p.y * 0.1, z: z0 + baseHeight + spireHeight },
        ],
        3
      )
  )

  const spireCount = Math.ceil(spireCurves[0].getLength() / MAX_BASE_LENGTH)

  // http://localhost:3012/lucerna-lecto/#BOIJxBOIIhBdIISBwhOIPtjhD9AADIAAPnA-gEt67dHA

  const pArrays: V3[][] = spireCurves.map((c) => c.getEquiDistancePoints(spireCount + 1))

  for (let i = 0; i < spireCount; i++) {
    const [newVertices, newNormals, currentLayerIndexes] = addVerticesAndGetLayerIndexesForBase(
      pArrays.map((pArray) => pArray[i]),
      vertices.length,
      pts.length
    )
    vertices.push(...newVertices)
    normals.push(...newNormals)
    if (lastLayerIndexes)
      for (let i = 0; i < currentLayerIndexes.length; i++)
        faces = faces.concat(getFacesForIndices(lastLayerIndexes[i], currentLayerIndexes[i]))
    lastLayerIndexes = currentLayerIndexes
  }

  return {
    vertices,
    normals,
    faces,
  }
}
