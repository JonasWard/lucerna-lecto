import { Color } from 'three'
import {
  ChurchShadeType,
  ColorType,
  CubeShadeType,
  HangingShadeType,
  SphereShadeType,
  Version0Type,
} from '../../modelDefinition/types/version0.generatedType'
import { VertexData } from './helpers/vertexData'
import { AttributeNames } from '../../modelDefinition/enums/attributeNames'
import { getCubeMesh } from './baseMeshes/cubeMesh'
import { Mesh } from './mesh/type'
import { getSphereMesh } from './baseMeshes/ellipseMesh'
import { frauenKirche } from './baseMeshes/frauenKirche'
import { getMaxExpression } from './helpers/remapRange'

const size = 5

// prettier-ignore
const positions = new Float32Array([
  -size, -size, 0,
  size, -size, 0,
  size, size, 0,
  size, size, 0,
  -size, size, 0, 
  -size, -size, 0
]);

// prettier-ignore
const uvs = new Float32Array([
  -size, -size,
  size, -size,
  size, size,
  size, size,
  -size, size, 
  -size, -size
]);

export const boilerPlateData: VertexData = {
  positions,
  indices: [0, 1, 2, 3, 2, 1],
  normals: new Float32Array(),
  uvs,
}

export const getMesh = (data: Version0Type): Mesh => {
  let mesh: Mesh = {
    vertices: [],
    faces: [],
    normals: [],
  }

  if (data[AttributeNames.LampShades].s.value === 0) {
    const cubeShadeData = data[AttributeNames.LampShades] as CubeShadeType
    mesh = getCubeMesh(
      cubeShadeData.v.h.value,
      cubeShadeData.v.w.value,
      cubeShadeData.v.d.value,
      cubeShadeData.v['Has Base'].s.value
        ? {
            hBase: (data[AttributeNames.LampShades] as any).v['Has Base'].v['h-base'].value,
            baseAngle: (data[AttributeNames.LampShades] as any).v['Has Base'].v['baseAngle'].value,
          }
        : undefined,
      cubeShadeData.v['max radius'].value,
      cubeShadeData.v['edge radius'].value,
      5 / 2 ** data[AttributeNames.GlobalGeometry].subDivisions.value,
      getMaxExpression(data),
      data[AttributeNames.Pattern]['no-smoothing'].value
    )
  }
  if (data[AttributeNames.LampShades].s.value === 1) {
    const sphereShadeData = data[AttributeNames.LampShades] as SphereShadeType
    mesh = getSphereMesh(
      sphereShadeData.v.h.value,
      sphereShadeData.v.r0.value,
      sphereShadeData.v.r1.value,
      sphereShadeData.v.r2.value
    )
  }
  if (data[AttributeNames.LampShades].s.value === 2) {
    const hangingShadeData = data[AttributeNames.LampShades] as HangingShadeType
    mesh = getCubeMesh(
      hangingShadeData.v.h.value,
      hangingShadeData.v.w.value,
      hangingShadeData.v.d.value,
      undefined,
      hangingShadeData.v.inset.value,
      hangingShadeData.v['h-base'].value,
      5 / 2 ** data[AttributeNames.GlobalGeometry].subDivisions.value,
      getMaxExpression(data),
      data[AttributeNames.Pattern]['no-smoothing'].value
    )
  }

  if (data[AttributeNames.LampShades].s.value === 3) {
    const churchShadeData = data[AttributeNames.LampShades] as ChurchShadeType
    mesh = frauenKirche(
      churchShadeData.v.w.value,
      churchShadeData.v['h-base'].value,
      churchShadeData.v.h.value,
      churchShadeData.v['sides'].value,
      churchShadeData.v['alcove-percentage'].value,
      churchShadeData.v['alcove-expression'].value
    )
  }

  return mesh
}

export const getMaterialColor = (c: ColorType): Color => new Color(c.R.value / 255, c.G.value / 255, c.B.value / 255)

export const isDoubleSide = (data: Version0Type): boolean =>
  data[AttributeNames.Visualization][AttributeNames.DoubleSided].value
export const isWireframe = (data: Version0Type): boolean =>
  data[AttributeNames.Visualization][AttributeNames.Wireframe].value
