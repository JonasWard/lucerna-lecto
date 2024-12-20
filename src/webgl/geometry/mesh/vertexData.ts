import { V3 } from '../helpers/v3';
import { VertexData } from '../helpers/vertexData';
import { Mesh } from './type';

const triangulateIndices = (indices: number[], indicesArray: number[] = []) => {
  if (indices.length === 3) return indicesArray.push(...indices);
  else if (indices.length > 3) for (let i = 0; i < indices.length - 2; i++) triangulateIndices([indices[0], indices[i + 1], indices[i + 2]], indicesArray);
};

const mapV3 = (v3: V3, vArray: number[]) => vArray.push(v3.x, v3.z, -v3.y);

export const getVertexDataForMesh = (mesh: Mesh): VertexData => {
  const indices: number[] = [];

  mesh.faces.forEach((face) => triangulateIndices(face, indices));

  const positions: number[] = [];
  const normals: number[] = [];

  mesh.vertices.map((v) => mapV3(v, positions));
  mesh.normals.map((n) => mapV3(n, normals));

  const vertexData: VertexData = {
    positions: new Float32Array(positions),
    indices,
    normals: new Float32Array(normals),
    uvs: new Float32Array([]),
  };

  return vertexData;
};
