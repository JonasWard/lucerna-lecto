import { Color, InstancedMesh, MeshNormalMaterial, MeshPhongMaterial, Object3D, SphereGeometry } from 'three'
import { Mesh } from '../mesh/type'

/**
 * Helper method that renders a sphere of given radius at the vertex positions of the given Mesh
 * @param mesh - Mesh
 * @param radius - radius (default 1)
 * @returns
 */
export const getVertexInstancedMeshForMesh = (mesh: Mesh, radius = 1): InstancedMesh => {
  // create an instanced mesh for a simple sphere rendererd at each vertex
  const baseSphere = new SphereGeometry(undefined, radius)
  const normalMaterial = new MeshPhongMaterial()
  const instancedMesh = new InstancedMesh(baseSphere, normalMaterial, mesh.vertices.length)

  const mock = new Object3D()

  mesh.vertices.forEach((v, i) => {
    mock.position.set(v.x, v.y, v.z)
    mock.updateMatrix()

    instancedMesh.setColorAt(
      i,
      new Color(mesh.normals[i].x * 0.5 + 0.5, mesh.normals[i].y * 0.5 + 0.5, mesh.normals[i].z * 0.5 + 0.5)
    )
    instancedMesh.setMatrixAt(i, mock.matrix)
  })

  return instancedMesh
}
