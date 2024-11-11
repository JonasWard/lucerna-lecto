import { DataType } from 'url-safe-bitpacking';
import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { FootprintCategory } from '../../../modelDefinition/types/footprint';
import { FootprintSquare } from '../../../modelDefinition/types/version0.generatedType';
import { HalfEdgeMeshFactory } from '../halfEdgeMesh/halfedge.factory';
import { SimpleMesh } from '../helpers/simpleMesh';
import { createFootprintSimpleMesh } from './polygonGridSimple';

export const createFootprintMesh = (square: FootprintSquare): SimpleMesh =>
  createFootprintSimpleMesh(
    {
      ['Size']: { value: square[AttributeNames.Size].value, name: 'Size', type: DataType.FLOAT, min: 8, max: 120, precision: 0, significand: 7 },
      ['X Count']: { value: 1, name: 'X Count', type: DataType.INT, min: 1, max: 16, bits: 4 },
      ['Y Count']: { value: 1, name: 'Y Count', type: DataType.INT, min: 0, max: 8, bits: 4 },
      ['Shell Thickness']: { value: 0.1, name: 'Shell Thickness', type: DataType.ENUM, max: 3, bits: 2 },
      ['Inner Buffer']: { value: 0.1, name: 'Inner Buffer', type: DataType.FLOAT, min: 0, max: 10, precision: 1, significand: 7 },
      ['Outer Buffer']: { value: 0.1, name: 'Outer Buffer', type: DataType.FLOAT, min: 0, max: 10, precision: 1, significand: 7 },
    },
    FootprintCategory.SquareGrid
  );

export const createFootprintHalfedgeMesh = (square: FootprintSquare) => HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(square));
