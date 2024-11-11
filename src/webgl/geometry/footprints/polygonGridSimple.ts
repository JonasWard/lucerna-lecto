import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { FootprintCategory } from '../../../modelDefinition/types/footprint';
import { FootprintGridType } from '../../../modelDefinition/types/version0.generatedType';
import { HalfEdgeMeshFactory } from '../halfEdgeMesh/halfedge.factory';
import { SimpleMesh } from '../helpers/simpleMesh';
import { V3 } from '../helpers/v3';

const getCenterPoint = (polygonGrid: FootprintGridType): V3 =>
  V3.add(
    V3.mul(V3.XAxis, polygonGrid[AttributeNames.Size].value * polygonGrid[AttributeNames.XCount].value * -0.5),
    V3.mul(V3.YAxis, polygonGrid[AttributeNames.Size].value * polygonGrid[AttributeNames.YCount].value * -0.5)
  );

export const createFootprintSimpleMesh = (polygonGrid: FootprintGridType, t: FootprintCategory): SimpleMesh => {
  console.log(polygonGrid);
  if (polygonGrid[AttributeNames.XCount].value < 1 || polygonGrid[AttributeNames.YCount].value < 1) throw new Error('need at least 1 cell in each direction');

  const xAxis = V3.XAxis;
  const yAxis = V3.YAxis;

  // creating the base SimpleMesh
  let baseSimpleMesh: [SimpleMesh] | [SimpleMesh, SimpleMesh];

  let vectorSpacingX: V3;
  let vectorSpacingY: V3;

  // centering grid
  const origin = getCenterPoint(polygonGrid);

  const scaledX = V3.mul(V3.XAxis, polygonGrid[AttributeNames.Size].value);

  // defining the base shapes
  switch (t) {
    case FootprintCategory.TriangleGrid:
      const halfX = V3.mul(xAxis, polygonGrid[AttributeNames.Size].value * 0.5);
      const oneAndAHalfX = V3.mul(xAxis, polygonGrid[AttributeNames.Size].value * 1.5);
      const triScaledY = V3.mul(yAxis, polygonGrid[AttributeNames.Size].value * 3 ** 0.5 * 0.5);

      baseSimpleMesh = [
        {
          vertices: [origin, V3.add(origin, scaledX), V3.add(origin, V3.add(halfX, triScaledY)), V3.add(origin, V3.add(oneAndAHalfX, triScaledY))],
          faces: [
            [1, 2, 0],
            [3, 2, 1],
          ],
        },
        {
          vertices: [V3.add(origin, halfX), V3.add(origin, oneAndAHalfX), V3.add(origin, triScaledY), V3.add(origin, V3.add(scaledX, triScaledY))],
          faces: [
            [3, 2, 0],
            [1, 3, 0],
          ],
        },
      ];

      vectorSpacingX = scaledX;
      vectorSpacingY = triScaledY;

      break;

    case FootprintCategory.SquareGrid:
      const quadScaledY = V3.mul(yAxis, polygonGrid[AttributeNames.Size].value);

      baseSimpleMesh = [
        {
          vertices: [origin, V3.add(origin, scaledX), V3.add(origin, quadScaledY), V3.add(origin, V3.add(scaledX, quadScaledY))],
          faces: [[1, 3, 2, 0]],
        },
      ];

      vectorSpacingX = scaledX;
      vectorSpacingY = quadScaledY;

      break;

    case FootprintCategory.HexGrid:
      const yScaleHalf = V3.mul(yAxis, polygonGrid[AttributeNames.Size].value * 0.5);
      const yScaleOneAndAHalf = V3.mul(yAxis, polygonGrid[AttributeNames.Size].value * 1.5);
      const yScaleDouble = V3.mul(yAxis, polygonGrid[AttributeNames.Size].value * 2.0);
      const xScaleOne = V3.mul(xAxis, polygonGrid[AttributeNames.Size].value * 3 ** 0.5 * 0.5);
      const xScaleTwo = V3.mul(xAxis, polygonGrid[AttributeNames.Size].value * 3 ** 0.5);

      const verticesHex = [
        V3.add(origin, yScaleHalf),
        V3.add(origin, yScaleOneAndAHalf),
        V3.add(origin, V3.add(xScaleOne, yScaleDouble)),
        V3.add(origin, V3.add(xScaleTwo, yScaleOneAndAHalf)),
        V3.add(origin, V3.add(xScaleTwo, yScaleHalf)),
        V3.add(origin, xScaleOne),
      ];

      baseSimpleMesh = [
        {
          vertices: verticesHex,
          faces: [[5, 4, 3, 2, 1, 0]],
        },
        {
          vertices: verticesHex.map((v) => V3.add(v, xScaleOne)),
          faces: [[5, 4, 3, 2, 1, 0]],
        },
      ];

      vectorSpacingX = xScaleTwo;
      vectorSpacingY = yScaleOneAndAHalf;

      break;
  }

  // populating the SimpleMeshes

  const SimpleMeshes: SimpleMesh[] = [];

  const xVectors = [...Array(polygonGrid[AttributeNames.XCount].value).keys()].map((i) => V3.mul(vectorSpacingX, i));
  const yVectors = [...Array(polygonGrid[AttributeNames.YCount].value).keys()].map((j) => V3.mul(vectorSpacingY, j));

  yVectors.forEach((y, i) => {
    const localSimpleMesh = baseSimpleMesh[i % baseSimpleMesh.length];
    xVectors.forEach((x) => {
      const xy = V3.add(x, y);

      SimpleMeshes.push({
        vertices: localSimpleMesh.vertices.map((v) => V3.add(v, xy)),
        faces: localSimpleMesh.faces.map((l) => l.map((i) => i)),
      });
    });
  });

  return SimpleMesh.joinMeshes(SimpleMeshes);
};

export const createFootprintHalfedgeMesh = (polygonGrid: FootprintGridType, t: FootprintCategory) =>
  HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintSimpleMesh(polygonGrid, t));
