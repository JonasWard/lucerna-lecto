import { VoxelState } from '../voxelComplex/types/voxelState';
import { getBoundariesForHalfEdgeMesh } from './halfedge';
import { HalfEdgeGeometry } from './halfedge.geometry';
import { HalfEdgeMesh } from './types/halfEdgeMesh';
import { HalfEdge } from './types/halfEdge';
import { HalfEdgeFace } from './types/halfEdgeFace';
import { HalfEdgeMeshFactory } from './halfedge.factory';
import { V3 } from '../helpers/v3';
import { getRandomUUID, getVertexHash } from '../../helpermethods';

/**
 * Class that contains methdos that update the topology of a half edge mesh
 */
export class HalfEdgeModifier {
  /**
   * Private method that adds a buffer with a certain thickness to a naked boundary of a half edge mesh
   * @param heMesh - source half edge mesh
   * @param boundary - the naked edge boundary of the half edge mesh (order is the inverse direction to the direction of the half edges themselves)
   * @param newFacesState - the Voxel state of the new faces that are created
   * @param bufferDistance - the size of the buffer
   * @param cornerAngleThreshold - the maximal angle before the cornet is split
   * @returns
   */
  private static addBufferForNakedBoundary = (
    heMesh: HalfEdgeMesh,
    boundary: HalfEdge[],
    newFacesState: VoxelState,
    bufferDistance: number,
    cornerAngleThreshold: number = Math.PI + 0.01
  ): HalfEdgeMesh => {
    // loop through each of the edges of the boundary
    // each of the edges will get an new face assigned to it as well as well as perhaps - multiple additional - faces at it's starting vertex

    const newFaceBaseData: {
      id: string;
      parent: HalfEdge;
      type: 'angle' | 'offset';
      newStartVertex?: string; // only undefined for the first face
      newEndVertex: string;
      additionalVertices: string[];
    }[] = [];

    boundary.forEach((edge, i, arr) => {
      // check whether the angle at the start is larger than 180 degrees => if so we will need to introduce additional faces
      const angle = HalfEdgeGeometry.getAngleBetween(boundary[(i + 1) % boundary.length], edge, heMesh);

      if (angle > cornerAngleThreshold) {
        const startOfEdge = HalfEdgeGeometry.getStart(edge, heMesh);
        const normalOfEdge = HalfEdgeGeometry.getNormal(edge, heMesh);
        const newEndVertex = V3.add(startOfEdge, V3.mul(normalOfEdge, bufferDistance));

        const newVertexHash = getVertexHash(newEndVertex);
        heMesh.vertices[newVertexHash] = newEndVertex;

        // adding the first, new face edge derived data
        newFaceBaseData.push({
          id: getRandomUUID(),
          parent: edge,
          type: 'offset',
          newEndVertex: newVertexHash,
          newStartVertex: i === 0 ? undefined : newFaceBaseData[newFaceBaseData.length - 1].newEndVertex,
          additionalVertices: [],
        });

        // adding the additional face
        const normalNextEdge = HalfEdgeGeometry.getNormal(boundary[(i + 1) % boundary.length], heMesh);
        const additionalFaceEndVertex = V3.add(startOfEdge, V3.mul(normalNextEdge, bufferDistance));

        const additionalFaceEndVertexHash = getVertexHash(additionalFaceEndVertex);
        heMesh.vertices[additionalFaceEndVertexHash] = additionalFaceEndVertex;

        const direction = HalfEdgeGeometry.getOffsetDirectionStart(edge, heMesh, boundary[(i + 1) % boundary.length]);
        const additionalVertex = V3.add(startOfEdge, V3.mul(direction, bufferDistance / Math.sin(Math.PI - angle * 0.5)));

        const additionalVertexHash = getVertexHash(additionalVertex);
        heMesh.vertices[additionalVertexHash] = additionalVertex;

        newFaceBaseData.push({
          id: getRandomUUID(),
          parent: edge,
          type: 'angle',
          newEndVertex: additionalFaceEndVertexHash,
          newStartVertex: newVertexHash,
          additionalVertices: [additionalVertexHash],
        });
      } else {
        const startOfEdge = HalfEdgeGeometry.getStart(edge, heMesh);
        const direction = HalfEdgeGeometry.getOffsetDirectionStart(edge, heMesh, boundary[(i + 1) % boundary.length]);
        const newEndVertex = V3.add(startOfEdge, V3.mul(direction, bufferDistance));

        const newVertexHash = getVertexHash(newEndVertex);
        heMesh.vertices[newVertexHash] = newEndVertex;

        // adding the first, new face edge derived data
        newFaceBaseData.push({
          id: getRandomUUID(),
          parent: edge,
          type: 'offset',
          newEndVertex: newVertexHash,
          newStartVertex: i === 0 ? undefined : newFaceBaseData[newFaceBaseData.length - 1].newEndVertex,
          additionalVertices: [],
        });
      }
    });

    newFaceBaseData[0].newStartVertex = newFaceBaseData[newFaceBaseData.length - 1].newEndVertex;

    const startHalfEdges: HalfEdge[] = [];
    const endHalfEdges: HalfEdge[] = [];

    // create the faces
    newFaceBaseData.forEach((faceData) => {
      if (faceData.type === 'offset') {
        const vs = [faceData.parent.vertex, heMesh.halfEdges[faceData.parent.previous].vertex, faceData.newEndVertex, faceData.newStartVertex as string];
        const halfEdges = HalfEdgeMeshFactory.createEdgeLoopFromVertexIDs(vs, faceData.id);
        const face: HalfEdgeFace = { id: faceData.id, edge: halfEdges[0].id, metaData: { voxelState: newFacesState } };
        halfEdges.forEach((he) => (heMesh.halfEdges[he.id] = he));
        heMesh.faces[face.id] = face;
        // writing in the new neighbour states
        heMesh.halfEdges[faceData.parent.id].neighbour = halfEdges[1].id;
        halfEdges[1].neighbour = faceData.parent.id;
        // storing the start and end half edges
        startHalfEdges.push(halfEdges[0]);
        endHalfEdges.push(halfEdges[2]);
      } else if (faceData.type === 'angle') {
        const vs = [
          heMesh.halfEdges[faceData.parent.previous].vertex,
          faceData.newEndVertex,
          ...faceData.additionalVertices,
          faceData.newStartVertex as string,
        ];
        const halfEdges = HalfEdgeMeshFactory.createEdgeLoopFromVertexIDs(vs, faceData.id);
        const face: HalfEdgeFace = { id: faceData.id, edge: halfEdges[0].id, metaData: { voxelState: VoxelState.MASSIVE } };
        halfEdges.forEach((he) => (heMesh.halfEdges[he.id] = he));
        heMesh.faces[face.id] = face;
        // storing the start and end half edges
        startHalfEdges.push(halfEdges[0]);
        endHalfEdges.push(halfEdges[1]);
      }
    });

    // linking start with end half edges
    endHalfEdges.forEach((he, i) => {
      he.neighbour = startHalfEdges[(i + 1) % startHalfEdges.length].id;
      startHalfEdges[(i + 1) % startHalfEdges.length].neighbour = he.id;
    });

    return heMesh;
  };

  public static createBufferedHalfEdgeMesh = (
    heMesh: HalfEdgeMesh,
    newFacesState: VoxelState,
    bufferDistance: number,
    cornerAngleThreshold?: number
  ): HalfEdgeMesh => {
    const boundaries = getBoundariesForHalfEdgeMesh(heMesh);

    const intermediateHeMesh: HalfEdgeMesh = JSON.parse(JSON.stringify(heMesh));
    boundaries.forEach((boundary) =>
      HalfEdgeModifier.addBufferForNakedBoundary(intermediateHeMesh, boundary, newFacesState, bufferDistance, cornerAngleThreshold)
    );

    return intermediateHeMesh;
  };
}
