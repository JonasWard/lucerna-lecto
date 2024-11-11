import { Color } from 'three';

export interface MaterialOptions {
  name: string;
  backFaceCulling?: boolean;
  wireframe?: boolean;
  emissiveColor?: Color;
  diffuseColor?: Color;
  alpha?: number;
}
