// these are the helper methods for filling the cells in the voxel complex

import { gefFace, getCenterOfVoxelFace, getFaceQuad, getLeftQuad, getRightQuad, getSideQuad, isFaceInVoxelClosed } from './voxelComplex';
import { Voxel, VoxelComplex } from './types/voxelComplex';
import { VoxelState } from './types/voxelState';
import { getVoxelFaceState } from './voxelComplex.states';
import {
  VoxelFaceStateHandlingException,
  VoxelFaceStateIndexArray,
  VoxelFaceStateIndexMap,
  VoxelFaceStateIndexPair,
  VoxelInternalFaceState,
} from './types/voxelInternalFaceState';
import { getHalfEdgeMeshFromMesh } from '../halfEdgeMesh/halfedge';
import { HalfEdgeMesh } from '../halfEdgeMesh/types/halfEdgeMesh';
import { QuadFace } from '../helpers/face';
import { LoftOption } from '../helpers/loftOptions';
import { V3 } from '../helpers/v3';
import { SimpleMesh } from '../helpers/simpleMesh';

// helper interface that defines the four corner vertices of a frame to be filled in with the frames of the voxel
export class VoxelMesh {
  static MINIMUM_VERTICAL_COVERING = 1.5;
  static MINIMUM_HORIZONTAL_COVERING = 2.2;

  private static arcDivisionCount = import.meta.env.DEV ? 32 : 8; // keeping the resolution of archs low (it's still basically 32 for a full circle, because all current arcs are always 90 degrees)
  private static getTopVertexSideEdge = (v: Voxel, vX: VoxelComplex, i: number): V3 => vX.vertices[v.vertices[i + v.n]];
  private static getBottomVertexSideEdge = (v: Voxel, vX: VoxelComplex, i: number): V3 => vX.vertices[v.vertices[i]];
  private static getTopEdgeCenter = (v: Voxel, vX: VoxelComplex, i: number): V3 =>
    V3.mul(V3.add(VoxelMesh.getTopVertexSideEdge(v, vX, i), VoxelMesh.getTopVertexSideEdge(v, vX, (i + v.n - 1) % v.n)), 0.5);
  private static getBottomEdgeCenter = (v: Voxel, vX: VoxelComplex, i: number): V3 =>
    V3.mul(V3.add(VoxelMesh.getBottomVertexSideEdge(v, vX, i), VoxelMesh.getBottomVertexSideEdge(v, vX, (i + v.n - 1) % v.n)), 0.5);

  private static getBottomFaceCenter = (v: Voxel, vX: VoxelComplex): V3 => getCenterOfVoxelFace(v, vX, 0);
  private static getTopFaceCenter = (v: Voxel, vX: VoxelComplex): V3 => getCenterOfVoxelFace(v, vX, 1);

  public static getFaceVerticesForVoxel = (v: Voxel, vX: VoxelComplex, fId: number): V3[] => gefFace(v, fId).map((v) => vX.vertices[v]);

  public static getBottomFaceVertexes = (v: Voxel, vX: VoxelComplex): V3[] => VoxelMesh.getFaceVerticesForVoxel(v, vX, 0);
  public static getTopFaceVertexes = (v: Voxel, vX: VoxelComplex): V3[] => VoxelMesh.getFaceVerticesForVoxel(v, vX, 1);

  /**
   * Helper method to get the quad face for a voxel face
   * this only works for faces that are not top and bottom
   * @param v - Voxel
   * @param vX - VoxelComplex
   * @param i - index of the side face (same as in the neighbour map)
   * @returns QuadFace
   */
  private static getQuad = (v: Voxel, vX: VoxelComplex, i: number): QuadFace => getFaceQuad(v, vX, i - 2);

  /**
   * Helper method to get the left half of a quad
   * this only works for faces that are not top and bottom
   * @param v - Voxel
   * @param vX - VoxelComplex
   * @param i - index of the side face (same as in the neighbour map)
   * @returns QuadFace
   */
  private static getLeftQuad = (v: Voxel, vX: VoxelComplex, i: number): QuadFace => getLeftQuad(v, vX, i - 2);

  /**
   * Helper method to get the left half of a quad
   * this only works for faces that are not top and bottom
   * @param v - Voxel
   * @param vX - VoxelComplex
   * @param i - index of the side face (same as in the neighbour map)
   * @returns QuadFace
   */
  private static getRightQuad = (v: Voxel, vX: VoxelComplex, i: number): QuadFace => getRightQuad(v, vX, i - 2);

  /**
   * Helper method to get the correct mapping to the side index
   * left index is directive, right index is the neighbour
   * @param v - Voxel
   * @param faceLeftIndex - index of the left face
   * @returns QuadFace
   */
  private static getSideIndex = (v: Voxel, faceLeftIndex: number): number => (faceLeftIndex - 1) % v.n;

  /**
   * Helper method to get the side quad for a voxel face
   * @param v - Voxel
   * @param vX - VoxelComplex
   * @param faceLeftIndex - index of the left face (indicative)
   * @param faceRightIndex - index of the right face (neighbour)
   * @returns QuadFace
   */
  private static getSideQuad = (v: Voxel, vX: VoxelComplex, faceLeftIndex: number): QuadFace => getSideQuad(v, vX, VoxelMesh.getSideIndex(v, faceLeftIndex));

  private static getHorizontalInset = (v0: V3, d: V3, inset: number): V3 =>
    V3.add(
      v0,
      V3.getLength(d) * inset < VoxelMesh.MINIMUM_HORIZONTAL_COVERING ? V3.mul(V3.getUnit(d), VoxelMesh.MINIMUM_HORIZONTAL_COVERING) : V3.mul(d, inset)
    );

  /**
   * Helper method to get the vertically corrected position of a vertex
   * @param v - V3, vertex
   * @param d - direction to correct
   * @param inset - relative inset value
   * @returns V3
   */
  private static getVerticalInset = (v: V3, d: V3, inset: number): V3 =>
    V3.add(v, V3.getLength(d) * inset < VoxelMesh.MINIMUM_VERTICAL_COVERING ? V3.mul(V3.getUnit(d), VoxelMesh.MINIMUM_VERTICAL_COVERING) : V3.mul(d, inset));

  private static getInsetQuad = (f: QuadFace, extrusionParameters: ExtrusionParameters): QuadFace => {
    // left side
    const v10a = VoxelMesh.getHorizontalInset(f.v10, V3.sub(f.v11, f.v10), extrusionParameters.insetSides);
    const v00a = VoxelMesh.getHorizontalInset(f.v00, V3.sub(f.v01, f.v00), extrusionParameters.insetSides);

    return {
      v11: VoxelMesh.getVerticalInset(f.v11, V3.sub(f.v01, f.v11), extrusionParameters.insetBottom),
      v01: VoxelMesh.getVerticalInset(f.v01, V3.sub(f.v11, f.v01), extrusionParameters.insetTop),
      v10: VoxelMesh.getVerticalInset(v10a, V3.sub(v00a, v10a), extrusionParameters.insetBottom),
      v00: VoxelMesh.getVerticalInset(v00a, V3.sub(v10a, v00a), extrusionParameters.insetTop),
    };
  };

  static extrusionCurveForQuad = (f: QuadFace, extrusionParameters: ExtrusionParameters): V3[] => {
    const insetQuad = VoxelMesh.getInsetQuad(f, extrusionParameters);
    return V3.curveForQuad(insetQuad, extrusionParameters.uvs);
  };

  public static getUVsForGeometryState = (gBD: GeometryBaseData): ExtrusionParameters =>
    ExtrusionProfileFactory.getExtrusionParameters(gBD.extrusion, VoxelMesh.arcDivisionCount);

  static getClosingMesh = (f: QuadFace, profile: V3[], splitIndex: number, invert: boolean = false): SimpleMesh => ({
    vertices: [...profile, f.v00, f.v01, f.v11, f.v10],
    faces: [
      [profile.length, profile.length + 1, 0],
      ...[...Array(splitIndex).keys()].map((i) => [profile.length, i, i + 1]),
      [profile.length + 3, profile.length, splitIndex],
      ...[...Array(profile.length - splitIndex - 1).keys()].map((i) => [profile.length + 3, splitIndex + i, splitIndex + i + 1]),
      [profile.length + 2, profile.length + 3, profile.length - 1],
    ].map((l) => (invert ? l.reverse() : l)),
  });

  /**
   * Method for getting the face state map of the Voxel faces
   * @param voxel - Voxel
   * @param vX - VoxelComplex
   */
  private static getVoxelFaceStates = (voxel: Voxel, vX: VoxelComplex): VoxelFaceStateIndexArray => ({
    array: [...Array(voxel.n).keys()].map((i) => ({ index: i + 2, state: getVoxelFaceState(voxel, vX, i + 2) })),
    continuous: true,
  });

  /**
   * Method for getting the closing face SimpleMeshf for a quad
   * @param quad - QuadFace
   * @param inverse - optional whether the quad vertices should be swapped
   * @returns SimpleMesh
   */
  private static getQuadClosingMesh = (quad: QuadFace, inverse?: boolean) => SimpleMesh.makeFromPolygon([quad.v00, quad.v01, quad.v11, quad.v10], inverse);

  /**
   * Method for handling a pair of open or dead end faces - can also deal with dead end faces
   * @param voxel - Voxel
   * @param vX - VoxelComplex
   * @param i0 - index of the left face
   * @param i1 - indef of the right face
   * @param extrusionParameters - ExtrusionParameters to be applied
   */
  static getOpenPairMesh = (voxel: Voxel, vX: VoxelComplex, i0: number, i1: number, extrusionParameters: ExtrusionParameters): SimpleMesh => {
    const splitIndex = getSplitIndex(extrusionParameters);
    const SimpleMeshes: SimpleMesh[] = [];

    const side = VoxelMesh.extrusionCurveForQuad(VoxelMesh.getSideQuad(voxel, vX, i0), extrusionParameters);
    const rightFrontQuad = VoxelMesh.getRightQuad(voxel, vX, i0);
    const rightFrontProfile = VoxelMesh.extrusionCurveForQuad(rightFrontQuad, extrusionParameters);

    const leftFrontQuad = VoxelMesh.getLeftQuad(voxel, vX, i1);
    const leftFrontProfile = VoxelMesh.extrusionCurveForQuad(leftFrontQuad, extrusionParameters);
    SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, rightFrontProfile, side, leftFrontProfile));

    if (isFaceInVoxelClosed(voxel, vX, i0)) SimpleMeshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));
    else if (getVoxelFaceState(voxel, vX, i0) === VoxelInternalFaceState.DEADEND) SimpleMeshes.push(SimpleMesh.makeFromPolygon(rightFrontProfile));
    if (isFaceInVoxelClosed(voxel, vX, i1)) SimpleMeshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));
    else if (getVoxelFaceState(voxel, vX, i1) === VoxelInternalFaceState.DEADEND) SimpleMeshes.push(SimpleMesh.makeFromPolygon(leftFrontProfile.reverse()));

    return SimpleMesh.joinMeshes(SimpleMeshes);
  };

  /**
   * Helper method that goes through the face state indexes and finds the indexes of the loops that have a certain index
   * Returns an array with a given buffer and the other continious loops (the first and last value of the buffer are also added to the previous and the next loop)
   * @param givenState - VoxelInternalFaceState
   * @param faceStateIndexes - VoxelFaceStateIndexArray this assumed to be non-zero!
   * @param buffer - number of indexes to add to the loops
   * @returns object with the loops of the given state and other loops
   */
  private static deconstructVoxelFaceStateIndexesByStateWithBuffer = (
    givenState: VoxelInternalFaceState,
    faceStateIndexes: VoxelFaceStateIndexArray,
    buffer: number = 1
  ): {
    givenStateLoops?: VoxelFaceStateIndexArray[];
    otherLoops?: VoxelFaceStateIndexArray[];
    exceptionState: VoxelFaceStateHandlingException;
  } => {
    const firstSplitIndex = faceStateIndexes.array.findIndex((fI) => fI.state === givenState);
    // if the state is not found, return the whole array as other loops
    if (firstSplitIndex === -1) return { otherLoops: [faceStateIndexes], exceptionState: VoxelFaceStateHandlingException.STATE_NOT_FOUND };
    // quick check whether all the faces are of the given state
    const ofGivenStateCount = faceStateIndexes.array.filter((fI) => fI.state === givenState).length;
    if (ofGivenStateCount === faceStateIndexes.array.length)
      return { givenStateLoops: [faceStateIndexes], exceptionState: VoxelFaceStateHandlingException.ONLY_OF_STATE };
    if (ofGivenStateCount > faceStateIndexes.array.length - buffer)
      return { givenStateLoops: [faceStateIndexes], exceptionState: VoxelFaceStateHandlingException.INVALID_BUFFER };
    // otherwise loop through the whole array and cut up the loops when the state changes
    const allIndexes: VoxelFaceStateIndexArray[] = [{ array: [faceStateIndexes.array[0]], continuous: false }];

    for (let i = 1; i < faceStateIndexes.array.length; i++) {
      const currentIndexState = faceStateIndexes.array[i].state;
      const previousIndexState = faceStateIndexes.array[i - 1].state;
      if ((currentIndexState === givenState && previousIndexState === givenState) || (currentIndexState !== givenState && previousIndexState !== givenState))
        allIndexes[allIndexes.length - 1].array.push(faceStateIndexes.array[i]);
      else allIndexes.push({ array: [faceStateIndexes.array[i]], continuous: false });
    }

    // checking whether the first and last loop are connected in the case face state indexes is continuous
    if (faceStateIndexes.continuous) {
      const firstState = allIndexes[0].array[0].state;
      const lastState = allIndexes[allIndexes.length - 1].array[allIndexes[allIndexes.length - 1].array.length - 1].state;
      if ((firstState === givenState && lastState === givenState) || (firstState !== givenState && lastState !== givenState))
        allIndexes[0].array = [...(allIndexes.pop() as VoxelFaceStateIndexArray).array, ...allIndexes[0].array];
    }

    const givenStateLoops: VoxelFaceStateIndexArray[] = [];
    const otherLoops: VoxelFaceStateIndexArray[] = [];

    try {
      // adding buffer amount of indexes to the given state loops
      // shortening the non given state loops by buffer-1
      for (let i = 1; i < allIndexes.length - 1; i++) {
        if (allIndexes[i].array[0].state === givenState)
          givenStateLoops.push({
            array: [...allIndexes[i - 1].array.slice(-buffer), ...allIndexes[i].array, ...allIndexes[i + 1].array.slice(0, buffer)],
            continuous: false,
          });
        else if (allIndexes[i].array.length > (buffer - 1) * 2)
          otherLoops.push({ array: allIndexes[i].array.slice(buffer - 1, 1 - buffer), continuous: false });
      }

      // adding the first and last loop if the faceStateIndexes are continuous
      if (faceStateIndexes.continuous) {
        // adding the first
        if (allIndexes[0].array[0].state === givenState)
          givenStateLoops.push({
            array: [...allIndexes[allIndexes.length - 1].array.slice(-buffer), ...allIndexes[0].array, ...allIndexes[1].array.slice(0, buffer)],
            continuous: false,
          });
        else if (allIndexes[0].array.length > (buffer - 1) * 2)
          otherLoops.push({ array: allIndexes[0].array.slice(buffer - 1, 1 - buffer), continuous: false });
        // adding the last
        if (allIndexes[allIndexes.length - 1].array[0].state === givenState)
          givenStateLoops.push({
            array: [
              ...allIndexes[allIndexes.length - 2].array.slice(-buffer),
              ...allIndexes[allIndexes.length - 1].array,
              ...allIndexes[0].array.slice(0, buffer),
            ],
            continuous: false,
          });
        else if (allIndexes[allIndexes.length - 1].array.length > (buffer - 1) * 2)
          otherLoops.push({ array: allIndexes[allIndexes.length - 1].array.slice(buffer - 1, 1 - buffer), continuous: false });
      }

      return {
        givenStateLoops,
        otherLoops,
        exceptionState: VoxelFaceStateHandlingException.NONE,
      };
    } catch (e) {
      console.log(e);
      return { givenStateLoops: [faceStateIndexes], exceptionState: VoxelFaceStateHandlingException.INVALID_BUFFER };
    }
  };

  /**
   * Method for deconstructing VoxelFaceStateIndexArray
   * @param faceStateIndexes - VoxelFaceStateIndexArray
   * @returns index map
   */
  static getDeconstructedStateIndexesMap = (faceStateIndexes: VoxelFaceStateIndexArray): VoxelFaceStateIndexMap => {
    // first going through the naked edges
    const nakeEdgeResult = VoxelMesh.deconstructVoxelFaceStateIndexesByStateWithBuffer(VoxelInternalFaceState.NAKED, faceStateIndexes, 2);
    const closedFaceLoops: VoxelFaceStateIndexArray[] = [];
    const openFacePairs: VoxelFaceStateIndexPair[] = [];
    if (nakeEdgeResult.otherLoops)
      nakeEdgeResult.otherLoops.forEach((fI) => {
        const localResult = VoxelMesh.deconstructVoxelFaceStateIndexesByStateWithBuffer(VoxelInternalFaceState.CLOSED, fI, 1);
        if (localResult.exceptionState === VoxelFaceStateHandlingException.NONE && localResult.givenStateLoops)
          closedFaceLoops.push(...localResult.givenStateLoops);
        else if (fI.array.length > 1)
          [...Array(fI.array.length - (fI.continuous ? 0 : 1)).keys()].forEach((i) => openFacePairs.push([fI.array[i], fI.array[(i + 1) % fI.array.length]]));
      });

    return {
      nakedFaceLoops: nakeEdgeResult.givenStateLoops,
      closedFaceLoops,
      openFacePairs,
    };
  };

  /**
   * Method for handling an array of naked edges, should be preceded by an open / dead end face pair (which can be the same ! in that case there is just one column)
   * @param voxel - Voxel
   * @param vX - VoxelComplex
   * @param faceStateIndexes - [index, faceState][] - face states with there indexes
   * @param extrusionParameters - ExtrusionParameters to be applied
   */
  static getNakedEdgeMesh = (
    voxel: Voxel,
    vX: VoxelComplex,
    faceStateIndexes: VoxelFaceStateIndexArray,
    extrusionParameters: ExtrusionParameters
  ): SimpleMesh => {
    const splitIndex = getSplitIndex(extrusionParameters);
    const SimpleMeshes: SimpleMesh[] = [];

    console.log(faceStateIndexes.array.map(({ index }) => index));

    // first check the special case in which the first and last edge are the same
    if (faceStateIndexes.array[0].index === faceStateIndexes.array[faceStateIndexes.array.length - 2].index) {
      // in this case we have to only a single extrusion (and maybe cover the start and end faces)
      const v11 = VoxelMesh.getTopVertexSideEdge(voxel, vX, faceStateIndexes.array[0].index - 2);
      const v01 = VoxelMesh.getBottomVertexSideEdge(voxel, vX, faceStateIndexes.array[0].index - 2);

      const rawExtrusionData = faceStateIndexes.array.slice(1, -2).map(({ index }) => {
        const v10 = VoxelMesh.getTopVertexSideEdge(voxel, vX, index - 2);
        const v00 = VoxelMesh.getBottomVertexSideEdge(voxel, vX, index - 2);

        const quadFace: QuadFace = { v00, v01, v10, v11 };

        const extrusionProfile = VoxelMesh.extrusionCurveForQuad(quadFace, extrusionParameters);
        return [quadFace, extrusionProfile] as [QuadFace, V3[]];
      });

      SimpleMeshes.push(
        SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionData.map(([quadFace, profile]) => [quadFace.v00, ...profile, quadFace.v10]).reverse())
      );

      // seeing whether anything needs to be closed
      if (isFaceInVoxelClosed(voxel, vX, faceStateIndexes.array[1].index))
        SimpleMeshes.push(VoxelMesh.getClosingMesh(rawExtrusionData[0][0], rawExtrusionData[0][1], splitIndex));
      else if (getVoxelFaceState(voxel, vX, faceStateIndexes.array[1].index) === VoxelInternalFaceState.DEADEND)
        SimpleMeshes.push(SimpleMesh.makeFromPolygon(rawExtrusionData[0][1]));
      if (isFaceInVoxelClosed(voxel, vX, faceStateIndexes.array[0].index))
        SimpleMeshes.push(
          VoxelMesh.getClosingMesh(rawExtrusionData[rawExtrusionData.length - 1][0], rawExtrusionData[rawExtrusionData.length - 1][1], splitIndex, true)
        );
      else if (getVoxelFaceState(voxel, vX, faceStateIndexes.array[0].index) === VoxelInternalFaceState.DEADEND)
        SimpleMeshes.push(SimpleMesh.makeFromPolygon(rawExtrusionData[rawExtrusionData.length - 1][1].reverse()));
    } else {
      // in this case we have to do everything in two pairs
      const extrusionEndPositions = faceStateIndexes.array.slice(1, -2).map(({ index }) => ({
        v10: VoxelMesh.getTopVertexSideEdge(voxel, vX, index - 2),
        v00: VoxelMesh.getBottomVertexSideEdge(voxel, vX, index - 2),
      }));

      const v01 = VoxelMesh.getTopFaceCenter(voxel, vX);
      const v00 = VoxelMesh.getBottomFaceCenter(voxel, vX);

      const rawExtrusionDataA: [QuadFace, V3[]][] = [];
      const rawExtrusionDataB: [QuadFace, V3[]][] = [];

      const v11a = VoxelMesh.getTopVertexSideEdge(voxel, vX, faceStateIndexes.array[0].index - 2);
      const v10a = VoxelMesh.getBottomVertexSideEdge(voxel, vX, faceStateIndexes.array[0].index - 2);

      const v11b = VoxelMesh.getTopVertexSideEdge(voxel, vX, faceStateIndexes.array[faceStateIndexes.array.length - 2].index - 2);
      const v10b = VoxelMesh.getBottomVertexSideEdge(voxel, vX, faceStateIndexes.array[faceStateIndexes.array.length - 2].index - 2);

      const leftFrontQuadA = VoxelMesh.getLeftQuad(voxel, vX, faceStateIndexes.array[0].index);
      rawExtrusionDataA.push([leftFrontQuadA, VoxelMesh.extrusionCurveForQuad(leftFrontQuadA, extrusionParameters)]);
      const sideQuadA = { v00, v01, v11: v11a, v10: v10a };
      rawExtrusionDataA.push([sideQuadA, VoxelMesh.extrusionCurveForQuad(sideQuadA, extrusionParameters)]);

      const leftFrontQuadB = VoxelMesh.getLeftQuad(voxel, vX, faceStateIndexes.array[faceStateIndexes.array.length - 2].index);
      rawExtrusionDataB.push([leftFrontQuadB, VoxelMesh.extrusionCurveForQuad(leftFrontQuadB, extrusionParameters)]);
      const sideQuadB = { v00, v01, v11: v11b, v10: v10b };
      rawExtrusionDataB.push([sideQuadB, VoxelMesh.extrusionCurveForQuad(sideQuadB, extrusionParameters)]);

      // adding the extrusion data for the naked edges
      const keyFaceIndex = Math.floor((faceStateIndexes.array.length - 1) * 0.5);
      if (extrusionEndPositions.length % 2 === 0) {
        // this means an additional two points need to be introduced
        const v00naked = VoxelMesh.getBottomEdgeCenter(voxel, vX, (keyFaceIndex + 1) % voxel.n);
        const v01naked = VoxelMesh.getTopEdgeCenter(voxel, vX, (keyFaceIndex + 1) % voxel.n);

        const nakedCenterQuadA = { v00: v00naked, v01: v01naked, v11: v11a, v10: v10a };
        rawExtrusionDataA.push([nakedCenterQuadA, VoxelMesh.extrusionCurveForQuad(nakedCenterQuadA, extrusionParameters)]);

        const nakedCenterQuadB = { v00: v00naked, v01: v01naked, v11: v11b, v10: v10b };
        rawExtrusionDataB.push([nakedCenterQuadB, VoxelMesh.extrusionCurveForQuad(nakedCenterQuadB, extrusionParameters)]);
      }

      extrusionEndPositions
        .slice(0, keyFaceIndex)
        .reverse()
        .forEach(({ v10, v00 }) => {
          const quadFace = { v00, v01, v10, v11: v11a };
          rawExtrusionDataA.push([quadFace, VoxelMesh.extrusionCurveForQuad(quadFace, extrusionParameters)]);
        });

      extrusionEndPositions
        .slice(keyFaceIndex)
        .reverse()
        .forEach(({ v10, v00 }) => {
          const quadFace = { v00, v01, v10, v11: v11a };
          rawExtrusionDataB.push([quadFace, VoxelMesh.extrusionCurveForQuad(quadFace, extrusionParameters)]);
        });

      SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionDataA.map(([, profile]) => profile)));

      // // adding the open extrusions
      // SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionDataA.slice(0, 3).map(([, profile]) => profile)));
      // SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionDataB.slice(0, 3).map(([, profile]) => profile)));

      // // adding the naked extrusions
      // SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionDataA.slice(2).map(([quadFace, profile]) => [quadFace.v00, ...profile, quadFace.v01])));
      // SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, ...rawExtrusionDataB.slice(2).map(([quadFace, profile]) => [quadFace.v00, ...profile, quadFace.v01])));

      // ToDo closing the open faces if necessary
    }

    return SimpleMesh.joinMeshes(SimpleMeshes);
  };

  /**
   * Method for handling an array of closed edges, is either preceded and ended by an open / dead end face or can be a closed naked edge loop
   * @param voxel - Voxel
   * @param vX - VoxelComplex
   * @param faceStateIndexes - [index, faceState][] - face states with there indexes
   * @param extrusionParameters - ExtrusionParameters to be applied
   */
  static getClosedEdgesMesh = (
    voxel: Voxel,
    vX: VoxelComplex,
    faceStateIndexes: VoxelFaceStateIndexArray,
    extrusionParameters: ExtrusionParameters
  ): SimpleMesh => {
    const SimpleMeshes: SimpleMesh[] = [];

    // first checking the special case of the naked edge loop, in that case we can just return a closed loft and be done with it
    // ToDo decide whether I actually want the interior geometry, or rather want to leave it out
    if (faceStateIndexes.array[0].state === VoxelInternalFaceState.CLOSED)
      SimpleMeshes.push(
        SimpleMesh.makeLoft(
          LoftOption.Uloop,
          ...faceStateIndexes.array.map(({ index }) => {
            const quad = VoxelMesh.getSideQuad(voxel, vX, index);
            isFaceInVoxelClosed(voxel, vX, index) && SimpleMeshes.push(VoxelMesh.getQuadClosingMesh(VoxelMesh.getQuad(voxel, vX, index), true));
            return VoxelMesh.extrusionCurveForQuad(quad, extrusionParameters);
          })
        )
      );
    else {
      const splitIndex = getSplitIndex(extrusionParameters);

      const i0 = faceStateIndexes.array[0].index;
      const i1 = faceStateIndexes.array[faceStateIndexes.array.length - 1].index;

      // code copied from open pair faces
      const rightFrontQuad = VoxelMesh.getRightQuad(voxel, vX, i0);
      const rightFrontProfile = VoxelMesh.extrusionCurveForQuad(rightFrontQuad, extrusionParameters);
      const leftFrontQuad = VoxelMesh.getLeftQuad(voxel, vX, i1);
      const leftFrontProfile = VoxelMesh.extrusionCurveForQuad(leftFrontQuad, extrusionParameters);

      const sides = [...faceStateIndexes.array]
        .slice(0, -1)
        .map(({ index }) => VoxelMesh.extrusionCurveForQuad(VoxelMesh.getSideQuad(voxel, vX, index), extrusionParameters));

      faceStateIndexes.array
        .slice(1, -1)
        .forEach(
          ({ index }) => isFaceInVoxelClosed(voxel, vX, index) && SimpleMeshes.push(VoxelMesh.getQuadClosingMesh(VoxelMesh.getQuad(voxel, vX, index), true))
        );

      SimpleMeshes.push(SimpleMesh.makeLoft(LoftOption.Open, rightFrontProfile, ...sides, leftFrontProfile));

      if (isFaceInVoxelClosed(voxel, vX, i0)) SimpleMeshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));
      else if (getVoxelFaceState(voxel, vX, i0) === VoxelInternalFaceState.DEADEND) SimpleMeshes.push(SimpleMesh.makeFromPolygon(leftFrontProfile));
      if (isFaceInVoxelClosed(voxel, vX, i1)) SimpleMeshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));
      else if (getVoxelFaceState(voxel, vX, i1) === VoxelInternalFaceState.DEADEND) SimpleMeshes.push(SimpleMesh.makeFromPolygon(rightFrontProfile.reverse()));
    }

    return SimpleMesh.joinMeshes(SimpleMeshes);
  };

  /**
   * Method for getting the internal SimpleMesh of a Voxel - should only be ran if the VoxelState is not None
   * @param voxel
   * @param vX
   */
  private static getVoxelMesh = (voxel: Voxel, vX: VoxelComplex, extrusionParameters: ExtrusionParameters): SimpleMesh => {
    const SimpleMeshes: SimpleMesh[] = [];

    // seeing whether the top and bottom SimpleMesh are getting closed
    if (isFaceInVoxelClosed(voxel, vX, 0)) SimpleMeshes.push(SimpleMesh.makeFromPolygon(VoxelMesh.getBottomFaceVertexes(voxel, vX)));
    if (isFaceInVoxelClosed(voxel, vX, 1)) SimpleMeshes.push(SimpleMesh.makeFromPolygon(VoxelMesh.getTopFaceVertexes(voxel, vX)));

    // dealing straight away with the massive case
    if (voxel.state === VoxelState.MASSIVE) {
      for (let i = 0; i < voxel.n; i++)
        if (isFaceInVoxelClosed(voxel, vX, i + 2)) SimpleMeshes.push(SimpleMesh.makeFromPolygon(VoxelMesh.getFaceVerticesForVoxel(voxel, vX, i + 2)));

      return SimpleMesh.joinMeshes(SimpleMeshes);
    }

    // handling the face states
    const voxelFaceStates = VoxelMesh.getVoxelFaceStates(voxel, vX);
    const deconstructedStateIndexesMap = VoxelMesh.getDeconstructedStateIndexesMap(voxelFaceStates);

    if (deconstructedStateIndexesMap.openFacePairs)
      deconstructedStateIndexesMap.openFacePairs.forEach(([i0, i1]) =>
        SimpleMeshes.push(VoxelMesh.getOpenPairMesh(voxel, vX, i0.index, i1.index, extrusionParameters))
      );
    if (deconstructedStateIndexesMap.closedFaceLoops)
      deconstructedStateIndexesMap.closedFaceLoops.forEach((fI) => SimpleMeshes.push(VoxelMesh.getClosedEdgesMesh(voxel, vX, fI, extrusionParameters)));
    if (deconstructedStateIndexesMap.nakedFaceLoops)
      deconstructedStateIndexesMap.nakedFaceLoops.forEach((fI) => SimpleMeshes.push(VoxelMesh.getNakedEdgeMesh(voxel, vX, fI, extrusionParameters)));

    return SimpleMesh.joinMeshes(SimpleMeshes);
  };

  /**
   * Helper geometry for visualizing the logic of the base
   * @param voxel
   * @param vX
   * @param extrusionParameters
   */
  public static getSegmentLogicForVoxel = (voxel: Voxel, vX: VoxelComplex, extrusionParameters: ExtrusionParameters): SimpleMesh[] => {
    const voxelFaceStates = VoxelMesh.getVoxelFaceStates(voxel, vX);
    const deconstructedStateIndexesMap = VoxelMesh.getDeconstructedStateIndexesMap(voxelFaceStates);

    console.log(deconstructedStateIndexesMap);

    return [];
  };

  /**
   *
   * @param voxel
   * @param vX
   * @param extrusionParameters
   * @returns
   */

  public static getMeshForVoxel = (voxel: Voxel, vX: VoxelComplex, extrusionParameters: ExtrusionParameters): SimpleMesh => {
    switch (voxel.state) {
      case VoxelState.NONE:
        return { vertices: [], faces: [] };
      default:
        return VoxelMesh.getVoxelMesh(voxel, vX, extrusionParameters);
    }
  };

  public static getMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): SimpleMesh => {
    const exParameters = VoxelMesh.getUVsForGeometryState(gBD);
    const SimpleMesh = SimpleMesh.joinMeshes(Object.values(vX.voxels).map((v) => VoxelMesh.getMeshForVoxel(v, vX, exParameters)));
    return SimpleMesh;
  };

  public static getHalfEdgeMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): HalfEdgeMesh =>
    getHalfEdgeMeshFromMesh(VoxelMesh.getMeshForVoxelComplex(vX, gBD));
}
