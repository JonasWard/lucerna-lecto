import { Color } from 'three';
import { Version0Type } from '../../modelDefinition/types/version0.generatedType';
import { VertexData } from './helpers/vertexData';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import { getBaseMesh } from './cube/cubeMesh';
import { getVertexDataForMesh } from './mesh/vertexData';
import { bumpMesh } from './mesh/bumping';
import { Mesh } from './mesh/type';

const size = 5;

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
};

export const getVertexData = (data: Version0Type): VertexData => {
  let mesh: Mesh = {
    vertices: [],
    faces: [],
    normals: [],
  };

  if (data[AttributeNames.LampShades].s.value === 0) {
    mesh = getBaseMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.inset.value,
      data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value,
      data[AttributeNames.Material].subDivisions.value,
      data[AttributeNames.Material].smoothing.value
    );
  }
  if (data[AttributeNames.LampShades].s.value === 1) {
    mesh = getBaseMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.inset.value,
      data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v.r0.value,
      data[AttributeNames.LampShades].v.r1.value
    );
  }
  if (data[AttributeNames.LampShades].s.value === 2) {
    mesh = getBaseMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.inset.value,
      data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value
    );
  }

  mesh = bumpMesh(mesh, data);

  return getVertexDataForMesh(mesh);
};

export const getMaterialColor = (data: Version0Type): Color => {
  const c = data[AttributeNames.Material].color;
  return new Color(c.R.value / 255, c.G.value / 255, c.B.value / 255);
};

export const isWireframe = (data: Version0Type): boolean => data[AttributeNames.Material][AttributeNames.Wireframe].value;
