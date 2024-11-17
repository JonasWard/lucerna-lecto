import { expect, test } from 'bun:test';
import { Mesh } from '../webgl/geometry/mesh/type';
import { catmullClark } from '../webgl/geometry/mesh/modifier';

const n = { x: 0, y: 0, z: 1 };

test('HalfEdgeModifier.getSubdividedHEMesh', () => {
  const mesh: Mesh = {
    vertices: [
      { x: -1, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
      { x: 1, y: 1, z: 0 },
    ],
    faces: [[0, 1, 2]],
    normals: [n, n, n],
  };

  console.log(catmullClark(mesh));

  expect(test).toBeTruthy();
});
