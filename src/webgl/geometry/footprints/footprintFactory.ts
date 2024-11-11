import * as cylinder from './cylinder';
import * as square from './square';
import * as polygonGridSimple from './polygonGridSimple';
import * as malcolmiusOne from './malcolmiusOne';
import { SimpleMesh } from '../helpers/simpleMesh';
import { FootprintCategory } from '../../../modelDefinition/types/footprint';
import {
  FootprintCylinderType,
  FootprintGridType,
  FootprintMalculmiusOne,
  FootprintSquare,
  Version0Type,
} from '../../../modelDefinition/types/version0.generatedType';
import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { HalfEdgeMesh } from '../halfEdgeMesh/types/halfEdgeMesh';

export class FootprintFactory {
  public static createFootprintMesh(footprint: Version0Type[AttributeNames.Footprint]): SimpleMesh {
    switch (footprint.s.value) {
      case FootprintCategory.Square:
        return square.createFootprintMesh(footprint.v as FootprintSquare);
      case FootprintCategory.HexGrid:
      case FootprintCategory.TriangleGrid:
      case FootprintCategory.SquareGrid:
        return polygonGridSimple.createFootprintSimpleMesh(footprint.v as FootprintGridType, footprint.s.value);
      case FootprintCategory.Cylinder:
        return cylinder.createFootprintMesh(footprint.v as FootprintCylinderType);
      case FootprintCategory.MalculmiusOne:
      default:
        return malcolmiusOne.createFootprintMesh(footprint.v as FootprintMalculmiusOne);
    }
  }

  public static createFootprintHalfedgeMesh(footprint: Version0Type[AttributeNames.Footprint]): HalfEdgeMesh {
    switch (footprint.s.value) {
      case FootprintCategory.Square:
        return square.createFootprintHalfedgeMesh(footprint.v as FootprintSquare);
      case FootprintCategory.HexGrid:
      case FootprintCategory.TriangleGrid:
      case FootprintCategory.SquareGrid:
        return polygonGridSimple.createFootprintHalfedgeMesh(footprint.v as FootprintGridType, footprint.s.value);
      case FootprintCategory.Cylinder:
        return cylinder.createFootprintHalfedgeMesh(footprint.v as FootprintCylinderType);
      case FootprintCategory.MalculmiusOne:
      default:
        return malcolmiusOne.createFootprintHalfedgeMesh(footprint.v as FootprintMalculmiusOne);
    }
  }
}
