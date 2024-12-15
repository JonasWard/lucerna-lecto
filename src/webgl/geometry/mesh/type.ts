import { V3 } from '../helpers/v3'

/**
 * A basic mesh
 * @type {Mesh}
 * vertices: vertices of the mesh
 * normals: normals of the vertices
 * faces: faces of the mesh, an array of vertex indexes (should be 3 or more)
 * faceType: (optional) type of the face
 */
export type Mesh = {
  vertices: V3[]
  faces: number[][]
  normals: V3[]
  maxDistances?: number[]
  faceType?: number[]
}
