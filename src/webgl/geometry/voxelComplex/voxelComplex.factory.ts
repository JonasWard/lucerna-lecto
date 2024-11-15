import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { ProcessingMethodCategory } from '../../../modelDefinition/types/heights';
import { Version0Type } from '../../../modelDefinition/types/version0.generatedType';
import { getRandomUUID } from '../../helpermethods';
import { getFaceEdges } from '../halfEdgeMesh/halfedge';
import { HalfEdgeMeshFactory } from '../halfEdgeMesh/halfedge.factory';
import { HalfEdge } from '../halfEdgeMesh/types/halfEdge';
import { HalfEdgeMesh } from '../halfEdgeMesh/types/halfEdgeMesh';
import { getHeights } from '../heights/heightmethods';
import { BaseFrame, BaseFrameFactory } from '../helpers/baseFrame';
import { getFrameToFrameTransformation, WorldXY } from '../helpers/transformation';
import { V3 } from '../helpers/v3';
import { VoxelComplex, Voxel } from './types/voxelComplex';
import { VoxelState } from './types/voxelState';

export class VoxelFactory {
  public static simpleExtrusion = (vs: V3[], dir: V3): VoxelComplex => {
    const n = vs.length;
    const state = VoxelState.MASSIVE;
    const vertexList = [...vs, ...vs.map((v) => V3.add(v, dir))];
    const vertices = Object.fromEntries(vertexList.map((v) => [V3.getHash(v), v]));
    const neighbourMap: { [k: number]: [string, number] | null } = {};
    for (let i = 0; i < n + 2; i++) neighbourMap[i] = null;
    const voxel: Voxel = { id: getRandomUUID(), vertices: Object.keys(vertices), n, neighbourMap, state };
    return { voxels: { [voxel.id]: voxel }, vertices };
  };

  private static addVoxelsToVoxelComplexForHalfEdgeMesh = (
    heMesh: HalfEdgeMesh,
    faceVoxelIdMap: { [id: string]: string },
    topVertexMap: { [id: string]: string },
    bottomVertexMap: { [id: string]: string },
    topVoxelIdMap?: { [id: string]: string },
    bottomVoxelIdMap?: { [id: string]: string }
  ): { [k: string]: Voxel } => {
    // each half edge represents a face, we store the indexes here
    const halfEdgeFaceIndexMap: { [k: string]: number } = {};
    const halfEdgeVoxelIndex: { [k: string]: string } = {};
    const halfEdgesInVoxel: { [c: string]: HalfEdge[] } = {};

    // constructing of the voxels
    const voxels: { [k: string]: Voxel } = {};

    Object.values(heMesh.faces).forEach((face) => {
      // storing all the data to correctly map the neighbour map
      const halfEdges = getFaceEdges(face, heMesh);
      halfEdgesInVoxel[faceVoxelIdMap[face.id]] = halfEdges;
      halfEdges.forEach((he, i, arr) => {
        halfEdgeFaceIndexMap[he.id] = ((i + arr.length - 1) % arr.length) + 2;
        halfEdgeVoxelIndex[he.id] = faceVoxelIdMap[face.id];
      });

      const vertexIndexes = [...halfEdges.map((he) => bottomVertexMap[he.vertex]), ...halfEdges.map((he) => topVertexMap[he.vertex])];
      voxels[faceVoxelIdMap[face.id]] = {
        state: face?.metaData?.voxelState ?? VoxelState.OPEN,
        id: faceVoxelIdMap[face.id],
        n: halfEdges.length,
        vertices: vertexIndexes,
        neighbourMap: Object.fromEntries([...Array(halfEdges.length + 2).keys()].map((i) => [i, null])),
      };
    });

    // writing neighbourmap into the voxels
    Object.values(voxels).forEach((c) => {
      halfEdgesInVoxel[c.id].forEach((he, i, arr) => {
        if (he.neighbour) c.neighbourMap[2 + ((i + arr.length - 1) % arr.length)] = [halfEdgeVoxelIndex[he.neighbour], halfEdgeFaceIndexMap[he.neighbour]];
      });
    });

    // if we have a top or bottom face map, we can update the neighbour map for those
    if (topVoxelIdMap) Object.keys(heMesh.faces).forEach((fId) => (voxels[faceVoxelIdMap[fId]].neighbourMap[1] = [topVoxelIdMap[fId], 0]));
    if (bottomVoxelIdMap) Object.keys(heMesh.faces).forEach((fId) => (voxels[faceVoxelIdMap[fId]].neighbourMap[0] = [bottomVoxelIdMap[fId], 1]));

    return voxels;
  };

  public static sweepHalfEdgeMesh = (heMesh: HalfEdgeMesh, frames: BaseFrame[]): VoxelComplex => {
    // if less than 2 frames, we can't sweep
    if (frames.length < 2) throw new Error('need at least 2 frames to sweep');

    const vertices: { [id: string]: V3 } = {};
    // getting all the vertices and vertex maps
    const vertexMapArray: { [hash: string]: string }[] = [];
    const faceVoxelIdMapArray: { [id: string]: string }[] = [];

    // adding the face voxel id maps
    for (let i = 0; i < frames.length - 1; i++) faceVoxelIdMapArray.push(Object.fromEntries(Object.keys(heMesh.faces).map((k) => [k, getRandomUUID()])));

    // adding the vertex maps
    for (const frame of frames) {
      const transformationMatrix = getFrameToFrameTransformation(WorldXY, frame);
      const transformedVertices: { [id: string]: V3 } = Object.fromEntries(
        Object.entries(heMesh.vertices).map(([k, v]) => [k, V3.transform(v, transformationMatrix)])
      );
      const vertexMap: { [hash: string]: string } = Object.fromEntries(Object.entries(transformedVertices).map(([k, v]) => [k, V3.getHash(v)]));
      vertexMapArray.push(vertexMap);
      // writing in the vertices on the voxel object
      Object.keys(transformedVertices).forEach((k) => (vertices[vertexMap[k]] = transformedVertices[k]));
    }

    const voxels: { [k: string]: Voxel } = {};
    for (let i = 0; i < frames.length - 1; i++) {
      const localVoxels = VoxelFactory.addVoxelsToVoxelComplexForHalfEdgeMesh(
        heMesh,
        faceVoxelIdMapArray[i],
        vertexMapArray[i + 1],
        vertexMapArray[i],
        i < frames.length - 2 ? faceVoxelIdMapArray[i + 1] : undefined,
        i > 0 ? faceVoxelIdMapArray[i - 1] : undefined
      );
      Object.entries(localVoxels).forEach(([k, c]) => (voxels[k] = c));
    }

    return { voxels: voxels, vertices };
  };

  public static extrudeHalfEdgeMesh = (heMesh: HalfEdgeMesh, dir: V3): VoxelComplex => {
    // to get all the vertices, we need two maps, the list of all the vertices (also the moved ones) and the map for to which new vertex an old edge corresponds
    const pairedVertexes = Object.fromEntries(Object.entries(heMesh.vertices).map(([k, v]) => [k, V3.add(v, dir)] as [string, V3]));
    const topPairedVertexMap = Object.fromEntries(Object.entries(pairedVertexes).map(([k, v]) => [k, V3.getHash(v)]));
    const bottomPairedVerexMap = Object.fromEntries(Object.keys(pairedVertexes).map((k) => [k, k]));
    const vertices = { ...heMesh.vertices, ...Object.fromEntries(Object.entries(pairedVertexes).map(([k, v]) => [topPairedVertexMap[k], v])) };

    // for each half edge face, initiliase an id for a voxel
    const faceVoxelIdMap = Object.fromEntries(Object.keys(heMesh.faces).map((k) => [k, getRandomUUID()]));

    const voxels = VoxelFactory.addVoxelsToVoxelComplexForHalfEdgeMesh(heMesh, faceVoxelIdMap, topPairedVertexMap, bottomPairedVerexMap);

    return { voxels, vertices };
  };

  public static getCylinder = (radiusses: number[], heights: number[], divisions: number): VoxelComplex => {
    const baseSpiral = HalfEdgeMeshFactory.createCylinder(radiusses, divisions);

    const baseFrames = BaseFrameFactory.getBaseFramArrayAlongDirectionForSpacings(V3.ZAxis, heights);

    return VoxelFactory.sweepHalfEdgeMesh(baseSpiral, baseFrames);
  };

  public static getVoxelComplexFromGeometryBaseData = (gBD: Version0Type): VoxelComplex => {
    const heights = getHeights(gBD[AttributeNames.Heights]);
    const baseFrames = BaseFrameFactory.getBaseFramArrayAlongDirectionForSpacings(V3.ZAxis, heights);
    const heMesh = HalfEdgeMeshFactory.getFootprintFromGeometryBaseData(gBD);

    const voxelComplex = VoxelFactory.sweepHalfEdgeMesh(heMesh, baseFrames);
    // if (gBD.preProcessing) VoxelFactory.applyPreProcessingToVoxelVertexPositions(voxelComplex, gBD.preProcessing);

    return voxelComplex;
  };

  // public static applyPreProcessingToVoxelVertexPositions = (voxelComplex: VoxelComplex, preprocessingMethods: PreProcessingMethods): VoxelComplex => {
  //   if (preprocessingMethods.warp.type === ProcessingMethodCategory.None && preprocessingMethods.twist.type === ProcessingMethodCategory.None)
  //     return voxelComplex;

  //   const applyWarpMethod = PreProcessingMethodFactory.getPreProcessingMethod(preprocessingMethods);

  //   Object.values(voxelComplex.vertices).map((v) => {
  //     const warpedV = applyWarpMethod(v);

  //     v.x = warpedV.x;
  //     v.y = warpedV.y;
  //     // v.z = warpedV.z;
  //   });

  //   return voxelComplex;
  // };
}
