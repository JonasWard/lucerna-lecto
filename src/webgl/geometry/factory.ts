import { Color } from 'three'
import { ColorType, Version0Type } from '../../modelDefinition/types/version0.generatedType'
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
    mesh = getCubeMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value,
      (data[AttributeNames.LampShades] as any).v['Has Base'].s.value
        ? {
            hBase: (data[AttributeNames.LampShades] as any).v['Has Base'].v['h-base'].value,
            baseAngle: (data[AttributeNames.LampShades] as any).v['Has Base'].v['baseAngle'].value,
          }
        : undefined,
      data[AttributeNames.LampShades].v['max radius'].value,
      data[AttributeNames.LampShades].v['edge radius'].value,
      5 / 2 ** data[AttributeNames.GlobalGeometry].subDivisions.value,
      getMaxExpression(data)
    )
  }
  if (data[AttributeNames.LampShades].s.value === 1) {
    mesh = getSphereMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.r0.value,
      data[AttributeNames.LampShades].v.r1.value,
      data[AttributeNames.LampShades].v.r2.value
    )
  }
  if (data[AttributeNames.LampShades].s.value === 2) {
    mesh = getCubeMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.inset.value,
      data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value,
      undefined,
      undefined,
      data[AttributeNames.GlobalGeometry].expression.value
    )
  }

  if (data[AttributeNames.LampShades].s.value === 3) {
    mesh = frauenKirche(
      data[AttributeNames.LampShades].v.w.value,
      Math.min(data[AttributeNames.LampShades].v['h-base'].value, data[AttributeNames.LampShades].v.h.value),
      data[AttributeNames.LampShades].v.h.value - data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v['sides'].value,
      data[AttributeNames.LampShades].v['alcove-percentage'].value,
      data[AttributeNames.LampShades].v['alcove-expression'].value
    )
  }

  // for (let i = 0; i < data[AttributeNames.GlobalGeometry].subDivisions.value; i++)
  //   mesh = (data[AttributeNames.GlobalGeometry].smoothing.value < 0.01 ? subdivide : catmullClark)(mesh) //, smoothing);

  return mesh
}

export const getMaterialColor = (c: ColorType): Color => new Color(c.R.value / 255, c.G.value / 255, c.B.value / 255)

export const isDoubleSide = (data: Version0Type): boolean =>
  data[AttributeNames.Visualization][AttributeNames.DoubleSided].value
export const isWireframe = (data: Version0Type): boolean =>
  data[AttributeNames.Visualization][AttributeNames.Wireframe].value
