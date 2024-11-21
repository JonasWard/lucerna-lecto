import { Color } from 'three';
import { Version0Type } from '../../modelDefinition/types/version0.generatedType';
import { VertexData } from './helpers/vertexData';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import { getCubeMesh } from './baseMeshes/cubeMesh';
import { getVertexDataForMesh } from './mesh/vertexData';
import { bumpMesh } from './mesh/bumping';
import { Mesh } from './mesh/type';
import { catmullClark, subdivide } from './mesh/modifier';
import { getSphereMesh } from './baseMeshes/ellipseMesh';

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

  console.log(data[AttributeNames.LampShades].v);

  if (data[AttributeNames.LampShades].s.value === 0) {
    mesh = getCubeMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value,
      (data[AttributeNames.LampShades] as any).v['Has Base'].s.value ? (data[AttributeNames.LampShades] as any).v['Has Base'].v.inset.value : undefined,
      (data[AttributeNames.LampShades] as any).v['Has Base'].s.value ? (data[AttributeNames.LampShades] as any).v['Has Base'].v['h-base'].value : undefined
    );
  }
  if (data[AttributeNames.LampShades].s.value === 1) {
    mesh = getSphereMesh(data[AttributeNames.LampShades].v.h.value, data[AttributeNames.LampShades].v.r0.value, data[AttributeNames.LampShades].v.r1.value);
  }
  if (data[AttributeNames.LampShades].s.value === 2) {
    mesh = getCubeMesh(
      data[AttributeNames.LampShades].v.h.value,
      data[AttributeNames.LampShades].v.inset.value,
      data[AttributeNames.LampShades].v['h-base'].value,
      data[AttributeNames.LampShades].v.w.value,
      data[AttributeNames.LampShades].v.d.value
    );
  }

  for (let i = 0; i < data[AttributeNames.Material].subDivisions.value; i++)
    mesh = (data[AttributeNames.Material].smoothing.value < 0.01 ? subdivide : catmullClark)(mesh); //, smoothing);

  mesh = bumpMesh(mesh, data);

  return getVertexDataForMesh(mesh);
};

export const getMaterialColor = (data: Version0Type): Color => {
  const c = data[AttributeNames.Material].color;
  return new Color(c.R.value / 255, c.G.value / 255, c.B.value / 255);
};

export const isDoubleSide = (data: Version0Type): boolean => data[AttributeNames.Material][AttributeNames.DoubleSided].value;
export const isWireframe = (data: Version0Type): boolean => data[AttributeNames.Material][AttributeNames.Wireframe].value;
