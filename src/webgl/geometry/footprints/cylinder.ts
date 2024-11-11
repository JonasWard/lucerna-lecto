import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { FootprintCylinderType } from '../../../modelDefinition/types/version0.generatedType';
import { HalfEdgeMeshFactory } from '../halfEdgeMesh/halfedge.factory';
import { SimpleMesh } from '../helpers/simpleMesh';
import { V3 } from '../helpers/v3';

const MINIMUM_INNER_RADIUS = 1;

const getRadii = (cylinder: FootprintCylinderType): number[] => {
  const filteredRadii = cylinder[AttributeNames.Radiusses].v.map((v) => v[AttributeNames.Radiusses].value).filter((r) => r >= MINIMUM_INNER_RADIUS);

  const radii = [filteredRadii[0] - cylinder[AttributeNames.BufferInside].value, filteredRadii[0]];

  for (const radius of filteredRadii.slice(1)) radii.push(radii[radii.length - 1] + radius);
  radii.push(radii[radii.length - 1] + cylinder[AttributeNames.BufferOutside].value);

  return radii;
};

export const createFootprintMesh = (cylinder: FootprintCylinderType): SimpleMesh => {
  const radii = getRadii(cylinder);

  const vertices: V3[] = [];
  const faces: number[][] = [];

  const alphaDelta = (Math.PI * 2.0) / cylinder.Segments.value;

  for (let i = 0; i < cylinder.Segments.value; i++) {
    const alpha = alphaDelta * i;
    const cosAlpha = Math.cos(alpha);
    const sinAlpha = Math.sin(alpha);

    radii.forEach((r) => {
      vertices.push({ x: r * cosAlpha, y: r * sinAlpha, z: 0 });
    });

    const baseIndex = i * radii.length;
    const nextBaseIndex = ((i + 1) % cylinder.Segments.value) * radii.length;

    for (let j = 0; j < radii.length - 1; j++) {
      faces.push([baseIndex + j, nextBaseIndex + j, nextBaseIndex + j + 1, baseIndex + j + 1].reverse());
    }
  }

  return { vertices, faces };
};

export const createFootprintHalfedgeMesh = (cylinder: FootprintCylinderType) => HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(cylinder));
