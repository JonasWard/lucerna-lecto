import { Version0Type } from '../../../modelDefinition/types/version0.generatedType'
import { getBumpedVector } from '../sdMathematics/javascript/geometryComposer'
import { Mesh } from './type'

export const getBumpMesh = (mesh: Mesh, data: Version0Type): Mesh => {
  const bumpingMethod = getBumpedVector(data)

  return {
    normals: mesh.normals,
    faces: mesh.faces,
    vertices: mesh.vertices.map((v, i) => {
      const mappedV = bumpingMethod(
        [v.x, v.y, v.z],
        [mesh.normals[i].x, mesh.normals[i].y, mesh.normals[i].z],
        mesh.maxDistances![i]
      )
      return { x: mappedV[0], y: mappedV[1], z: mappedV[2] }
    }),
  }
}
