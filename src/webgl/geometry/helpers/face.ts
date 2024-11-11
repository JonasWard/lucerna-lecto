import { V3 } from './v3';

/**
 * Interface that defines a quadrilateral face
 * @v00 - the origin of the face
 * @v01 - the base u-direction of the face
 * @v10 - the base v-direction of the face
 * @v11 - the opposite corner of the face
 */
export interface QuadFace {
  v00: V3;
  v01: V3;
  v10: V3;
  v11: V3;
}
