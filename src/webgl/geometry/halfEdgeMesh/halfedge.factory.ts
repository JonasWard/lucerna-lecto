import { getHalfEdgeMeshFromMesh as getHalfEdgeMeshFromSimpleMesh, markFacesWithOneNakedEdge } from './halfedge';
import { FootprintFactory } from '../footprints/footprintFactory';
import { HalfEdgeMesh } from './types/halfEdgeMesh';
import { HalfEdge } from './types/halfEdge';
import { HalfEdgeModifier } from './halfedge.modifier';
import { VoxelMesh } from '../voxelComplex/voxelComplex.mesh';
import { VoxelState } from '../voxelComplex/types/voxelState';
import { V3 } from '../helpers/v3';
import { SimpleMesh } from '../helpers/simpleMesh';
import { getRandomUUID } from '../../helpermethods';
import { Version0Type } from '../../../modelDefinition/types/version0.generatedType';
import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';

abstract class MeshFactory {
  public static createCylinder = (radiuses: number[], divisions: number): SimpleMesh => {
    const vertices: V3[] = [];
    const faces: number[][] = [];

    const alphaDelta = (Math.PI * 2.0) / divisions;

    for (let i = 0; i < divisions; i++) {
      const alpha = alphaDelta * i;
      const cosAlpha = Math.cos(alpha);
      const sinAlpha = Math.sin(alpha);

      radiuses.forEach((r) => {
        vertices.push({ x: r * cosAlpha, y: r * sinAlpha, z: 0 });
      });

      const baseIndex = i * radiuses.length;
      const nextBaseIndex = ((i + 1) % divisions) * radiuses.length;

      for (let j = 0; j < radiuses.length - 1; j++) {
        faces.push([baseIndex + j, nextBaseIndex + j, nextBaseIndex + j + 1, baseIndex + j + 1].reverse());
      }
    }

    return { vertices, faces };
  };
}

export abstract class HalfEdgeMeshFactory {
  public static createHalfEdgeMeshFromMesh = (mesh: SimpleMesh): HalfEdgeMesh => getHalfEdgeMeshFromSimpleMesh(mesh, true);
  public static markFacesWithOneNakedEdge = (heMesh: HalfEdgeMesh): void => markFacesWithOneNakedEdge(heMesh);

  public static createCylinder = (radiuses: number[], divisions: number): HalfEdgeMesh => {
    const heMesh = getHalfEdgeMeshFromSimpleMesh(MeshFactory.createCylinder(radiuses, divisions), true);
    markFacesWithOneNakedEdge(heMesh);
    return heMesh;
  };

  public static createEdgeLoopFromVertexIDs = (vertexIDs: string[], faceID: string): HalfEdge[] => {
    const halfEdgeIDs = vertexIDs.map(() => getRandomUUID());
    return halfEdgeIDs.map((id, i, arr) => {
      const next = arr[(i + 1) % arr.length];
      return {
        id,
        face: faceID,
        vertex: vertexIDs[i],
        next,
        previous: arr[(i + arr.length - 1) % arr.length],
      };
    });
  };

  public static getFootprintFromGeometryBaseData = (gBD: Version0Type): HalfEdgeMesh =>
    HalfEdgeModifier.createBufferedHalfEdgeMesh(
      FootprintFactory.createFootprintHalfedgeMesh(gBD[AttributeNames.Footprint]),
      VoxelState.ONEDIRECTION,
      VoxelMesh.MINIMUM_HORIZONTAL_COVERING
    );
}
