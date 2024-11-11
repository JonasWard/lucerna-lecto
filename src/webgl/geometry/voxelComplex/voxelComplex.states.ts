import { V3 } from '../v3';
import { getCenterOfVoxel } from './voxelComplex';
import { Voxel, VoxelComplex } from './types/voxelComplex';
import { VoxelInternalFaceState } from './types/voxelInternalFaceState';
import { VoxelState } from './types/voxelState';

const numberAsVoxelState = (n: number) => {
  if (n < 1) return VoxelState.NONE;
  if (n < 2) return VoxelState.OPEN;
  else return VoxelState.MASSIVE;
};

const getVoxelFaceStateFromVoxelStates = (thisVoxelState: VoxelState, otherVoxelState?: VoxelState): VoxelInternalFaceState => {
  switch (thisVoxelState) {
    case VoxelState.NONE:
      return VoxelInternalFaceState.NONE;
    case VoxelState.OPEN:
      switch (otherVoxelState) {
        case VoxelState.MASSIVE:
          return VoxelInternalFaceState.DEADEND;
        default:
          return VoxelInternalFaceState.OPEN;
      }
    case VoxelState.MASSIVE:
      return VoxelInternalFaceState.NONE;
    case VoxelState.NAKEDOPEN:
      switch (otherVoxelState) {
        case VoxelState.NONE:
        case undefined:
          return VoxelInternalFaceState.NAKED;
        case VoxelState.MASSIVE:
          return VoxelInternalFaceState.DEADEND;
        default:
          return VoxelInternalFaceState.OPEN;
      }
    case VoxelState.ONEDIRECTION:
      switch (otherVoxelState) {
        case VoxelState.ONEDIRECTION:
        case VoxelState.MASSIVE:
          return VoxelInternalFaceState.CLOSED;
        default:
          return VoxelInternalFaceState.OPEN;
      }
  }
};

export const getVoxelFaceStateString = (v: VoxelInternalFaceState) => {
  switch (v) {
    case VoxelInternalFaceState.NONE:
      return 'NONE';
    case VoxelInternalFaceState.NAKED:
      return 'NAKED';
    case VoxelInternalFaceState.OPEN:
      return 'OPEN';
    case VoxelInternalFaceState.CLOSED:
      return 'CLOSED';
    case VoxelInternalFaceState.DEADEND:
      return 'DEADEND';
  }
};

export const getVoxelFaceState = (v: Voxel, vX: VoxelComplex, fIdx: number) =>
  getVoxelFaceStateFromVoxelStates(v.state, v.neighbourMap[fIdx] ? vX.voxels[v.neighbourMap[fIdx][0]].state : undefined);

export const getNeighbourState = (v: Voxel, vX: VoxelComplex, idx: number): VoxelState =>
  v.neighbourMap[idx] !== null ? vX.voxels[v.neighbourMap[idx]![0]].state : VoxelState.NONE;

export const isFaceClosed = (vState: VoxelState, oVState: VoxelState): boolean => (vState !== VoxelState.NONE ? oVState === VoxelState.NONE : false);

// simple method that goes through a voxel complex and based on the position of its voxels activates / deactivates the voxel
export const setVoxelComplexState = (vX: VoxelComplex, sdfMethod: (v: V3) => number) =>
  Object.values(vX.voxels).forEach((v) => (v.state = numberAsVoxelState(sdfMethod(getCenterOfVoxel(v, vX)))));

const getStateIndexes = Object.values(VoxelState).slice(Object.values(VoxelState).length / 2) as number[];
export const maxStateSize = Math.max(...getStateIndexes);
