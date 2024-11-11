import { LoftOption } from './loftOptions';
import { V3 } from './v3';

export interface SimpleMesh {
  vertices: V3[];
  faces: number[][];
}

export class SimpleMesh {
  public static makeLoft = (loftOption: LoftOption, ...vss: V3[][]): SimpleMesh => {
    if (vss.length < 2) throw new Error('Cannot loft with less than two paths.');
    const baseIndexes = [...Array(loftOption === LoftOption.Open || loftOption === LoftOption.Vloop ? vss[0].length - 1 : vss[0].length).keys()].map((i) => [
      i,
      (i + 1) % vss[0].length,
    ]);

    const faces = [...Array(loftOption === LoftOption.Open || loftOption === LoftOption.Uloop ? vss.length - 1 : vss.length).keys()]
      .map((j) => {
        const jBis = (j + 1) % vss.length;
        return baseIndexes.map(([v0, v1]) => [v0 + j * vss[0].length, v1 + j * vss[0].length, v1 + jBis * vss[0].length, v0 + jBis * vss[0].length]);
      })
      .flat();

    return {
      vertices: vss.flat(),
      faces,
    };
  };
  public static makeFromPolygon = (vertices: V3[], inverse: boolean = false): SimpleMesh => ({
    vertices,
    faces: [inverse ? vertices.map((_, i) => i).reverse() : vertices.map((_, i) => i)],
  });
  public static joinMeshes = (meshes: SimpleMesh[]): SimpleMesh => {
    const vertices: V3[] = [];
    const vertexMap: Map<string, number> = new Map();

    const faces: number[][] = [];

    meshes.forEach((mesh) => {
      const localHashes: string[] = [];
      mesh.vertices.forEach((v) => {
        const hash = V3.getHash(v);
        if (!vertexMap.has(hash)) {
          vertices.push(v);
          vertexMap.set(hash, vertices.length - 1);
        }
        localHashes.push(hash);
      });

      mesh.faces.forEach((face) => faces.push(face.map((i) => vertexMap.get(localHashes[i]) as number)));
    });

    return { vertices, faces };
  };

  private static getTriangularVertexIndexesForFace = (face: number[]): [number, number, number][] => {
    switch (face.length) {
      case 0:
      case 1:
      case 2:
        console.log('invalid face, not triangulated');
        return [];
      case 3:
        return [[face[2], face[1], face[0]]];
      default:
        const first = face[0];
        return face.slice(1, face.length - 1).map((idx, i) => [face[(i + 2) % face.length], idx, first]);
    }
  };

  // public static getVertexDataForMesh = (mesh: Mesh): VertexData => {
  //   const vertexData = new VertexData();

  //   // const normalsForVertices = HalfEdgeMeshRenderer.getNormalsForVertices(mesh);
  //   vertexData.positions = mesh.vertices.map((v) => [v.x, v.z, -v.y]).flat(); // translation from cad to world space
  //   vertexData.indices = mesh.faces.map((face) => Mesh.getTriangularVertexIndexesForFace(face)).flat(2);

  //   const normals: number[] = [];

  //   VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);

  //   vertexData.normals = normals;

  //   return vertexData;
  // };
}
