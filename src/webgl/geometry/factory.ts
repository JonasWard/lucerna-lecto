import { Color } from 'three';
import { Version0Type } from '../../modelDefinition/types/version0.generatedType';
import { VertexData } from './helpers/vertexData';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import { VoxelFactory } from './voxelComplex/voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './voxelComplex/voxelComplex';
import { HalfEdgeMeshRenderer } from './halfEdgeMesh/halfedge.artists';

const size = 100;

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
  indices: new Uint32Array([0, 1, 2, 3, 2, 1]),
  normals: new Float32Array(),
  uvs,
};

export const getVertexData = (data: Version0Type): VertexData => {
  const voxelComplex = VoxelFactory.getVoxelComplexFromGeometryBaseData(data);
  const heMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);
  return HalfEdgeMeshRenderer.getVertexDataForHEMesh(heMesh);
};

export const getMaterialColor = (data: Version0Type): Color => {
  const c = data[AttributeNames.Material].color;
  return new Color(c.R.value / 255, c.G.value / 255, c.B.value / 255);
};
