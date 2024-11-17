import { V3 } from '../helpers/v3';

export type Mesh = {
  vertices: V3[];
  faces: number[][];
  normals: V3[];
};
