import { AttributeNames } from '../../../modelDefinition/enums/attributeNames'
import { Version0Type } from '../../../modelDefinition/types/version0.generatedType'
import { V3 } from '../helpers/v3'
import { sdSine, sdGyroid, sdNeovius, sdSchwarzD, sdSchwarzP, sdSphere, sdTorus, sdPerlin } from './sdMethods'
import { Mesh } from './type'

const Z_SCALE = 0.25

const getSpecificMethod = (type: number) => {
  switch (type) {
    case 0: // MethodNames.Gyroid:
      return sdGyroid
    case 1: // MethodNames.SchwarzD:
      return sdSchwarzD
    case 2: // MethodNames.SchwarzP:
      return sdSchwarzP
    case 3: // MethodNames.Perlin:
      return sdPerlin
    case 4: // MethodNames.Neovius:
      return sdNeovius
    case 5: // MethodNames.Mandelbrot:
      return sdTorus
    case 6: // MethodNames.Sin:
      return sdSine
    default:
      return sdSphere
  }
}

const getPositionMethod =
  (data: Version0Type): ((v: V3, dataV: V3, n: V3, sdf: (dataV: V3) => number, maxD?: number) => V3) =>
  (v: V3, dataV: V3, n: V3, sdf: (dataV: V3) => number, maxD?: number) =>
    V3.add(
      v,
      V3.mul(
        n,
        Math.min(maxD === undefined ? 1e3 : maxD, (sdf(dataV) * 0.5 + 0.5) * data['Global Geometry'].expression.value)
      )
    )

const getLocalDistanceMethod = (data: Version0Type[AttributeNames.MainMethods]['v']): ((dataV: V3) => number) =>
  data.length === 1
    ? (dataV: V3) => getSpecificMethod(data[0].MainMethodEnum.value)(dataV, data[0].MethodScale.value)
    : (dataV: V3) =>
        getSpecificMethod(data[0].MainMethodEnum.value)(
          dataV,
          data[0].MethodScale.value *
            getLocalDistanceMethod(data.slice(1) as Version0Type[AttributeNames.MainMethods]['v'])(dataV)
        )

// method that constructs the distance method
const getDistanceMethod = (data: Version0Type): ((dataV: V3) => number) =>
  getLocalDistanceMethod(data[AttributeNames.MainMethods].v)

export const getBumpMesh = (mesh: Mesh, data: Version0Type): Mesh => {
  const sdMethod = getPositionMethod(data)
  const sdfMethod = getDistanceMethod(data)

  return {
    normals: mesh.normals,
    faces: mesh.faces,
    vertices: mesh.vertices.map((v, i) =>
      sdMethod(
        v,
        { x: v.x, y: v.y, z: v.z * Z_SCALE },
        mesh.normals[i],
        sdfMethod,
        mesh.maxDistances ? mesh.maxDistances[i] : undefined
      )
    ),
  }
}
