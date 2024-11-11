export enum VoxelInternalFaceState {
  NONE,
  NAKED,
  OPEN,
  CLOSED,
  DEADEND,
}

export type VoxelFaceStateIndex = { index: number; state: VoxelInternalFaceState };
export type VoxelFaceStateIndexPair = [VoxelFaceStateIndex, VoxelFaceStateIndex];
export type VoxelFaceStateIndexArray = { array: VoxelFaceStateIndex[]; continuous: boolean };
export type VoxelFaceStateIndexMap = {
  nakedFaceLoops?: VoxelFaceStateIndexArray[];
  openFacePairs?: VoxelFaceStateIndexPair[];
  closedFaceLoops?: VoxelFaceStateIndexArray[];
  noneFaces?: VoxelFaceStateIndexArray;
};

export enum VoxelFaceStateHandlingException {
  NONE, // as expected output
  STATE_NOT_FOUND, // given state is not present in the given VoxelFaceStateIndexArray
  ONLY_OF_STATE, // all faces in the VoxelFaceStateIndexArray are of the same state
  INVALID_BUFFER, // it wasn't possibel to construct a buffer of the given length
}
