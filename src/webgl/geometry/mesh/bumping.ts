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

// method that constructs the distance method
const getDistanceMethod = (data: Version0Type): ((dataV: V3) => number) => {
  switch (data[AttributeNames.MainMethods].v.length) {
    case 1:
      return (dataV: V3) =>
        getSpecificMethod(data[AttributeNames.MainMethods].v[0].MainMethodEnum.value)(
          dataV,
          data[AttributeNames.MainMethods].v[0].MethodScale.value
        )
    case 2:
      return (dataV: V3) =>
        getSpecificMethod(data[AttributeNames.MainMethods].v[0].MainMethodEnum.value)(
          dataV,
          data[AttributeNames.MainMethods].v[0].MethodScale.value *
            getSpecificMethod(data[AttributeNames.MainMethods].v[1]!.MainMethodEnum.value)(
              dataV,
              data[AttributeNames.MainMethods].v[1]!.MethodScale.value
            )
        )
    case 3:
      return (dataV: V3) =>
        getSpecificMethod(data[AttributeNames.MainMethods].v[0].MainMethodEnum.value)(
          dataV,
          data[AttributeNames.MainMethods].v[0].MethodScale.value *
            getSpecificMethod(data[AttributeNames.MainMethods].v[1]!.MainMethodEnum.value)(
              dataV,
              data[AttributeNames.MainMethods].v[1]!.MethodScale.value *
                getSpecificMethod(data[AttributeNames.MainMethods].v[2]!.MainMethodEnum.value)(
                  dataV,
                  data[AttributeNames.MainMethods].v[2]!.MethodScale.value
                )
            )
        )
  }
}

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
