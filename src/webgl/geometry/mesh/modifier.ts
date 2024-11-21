import { V3 } from '../helpers/v3';
import { Mesh } from './type';

export const catmullClark = (mesh: Mesh): Mesh => {
  // intermediate edges
  const vertices = [...mesh.vertices];
  const normals = [...mesh.normals];
  const faces: number[][] = [];

  const faceFaceCenterMap: { [faceIdx: number]: number } = {};
  const faceMidEdgeArray: string[][] = [];
  const edgeIdxVCollectiondMap: { [edgeId: string]: number[] } = {};
  const vertexFacesMap: { [vertexId: number]: number[] } = {};
  const vertexNeighbourMap: { [vertexId: number]: Set<number> } = {};

  // first loop through all the faces to construct the get the new face centers
  // add those to the vertices array
  // and do a whole bunch of pre-prep
  const faceCenterIdxs: number[] = mesh.faces.map((f, fIdx) => {
    // adding face center and normal
    const fCenterIdx = vertices.push(V3.mul(V3.add(...f.map((i) => vertices[i])), 1 / f.length)) - 1;
    faceFaceCenterMap[fIdx] = fCenterIdx;
    normals.push(V3.getUnit(V3.mul(V3.add(...f.map((i) => normals[i])), 1 / f.length)));

    faceMidEdgeArray.push(
      f.map((vIdx, i, arr) => {
        // handling of the individual edges
        const localName = vIdx < arr[(i + 1) % arr.length] ? `${vIdx}-${arr[(i + 1) % arr.length]}` : `${arr[(i + 1) % arr.length]}-${vIdx}`;
        if (edgeIdxVCollectiondMap[localName] === undefined) edgeIdxVCollectiondMap[localName] = [vIdx, arr[(i + 1) % arr.length], fCenterIdx];
        else edgeIdxVCollectiondMap[localName].push(fCenterIdx);

        // handling of the individual vertices
        if (vertexNeighbourMap[vIdx] === undefined) vertexNeighbourMap[vIdx] = new Set([arr[(i + 1) % arr.length], arr[(i + arr.length - 1) % arr.length]]);
        else {
          vertexNeighbourMap[vIdx].add(arr[(i + 1) % arr.length]);
          vertexNeighbourMap[vIdx].add(arr[(i + arr.length - 1) % arr.length]);
        }

        // adding the face index to each of its individual vertices
        if (vertexFacesMap[vIdx] === undefined) vertexFacesMap[vIdx] = [fIdx];
        else vertexFacesMap[vIdx].push(fIdx);

        return localName;
      })
    );

    return fCenterIdx;
  });

  // adding of the new weighted edge averages
  const edgeVId = Object.fromEntries(
    Object.entries(edgeIdxVCollectiondMap).map(([eID, vIdxs]) => {
      normals.push(V3.getUnit(V3.mul(V3.add(...vIdxs.map((i) => normals[i])), 1 / vIdxs.length)));
      return [eID, vertices.push(V3.mul(V3.add(...vIdxs.map((i) => vertices[i])), 1 / vIdxs.length)) - 1];
    })
  );

  // updating the centerpoint locations
  const verticesToReplace = Object.entries(vertexFacesMap).map(([vIdx, fIdxs]) => {
    const v = Number(vIdx);
    const edges = [...vertexNeighbourMap[v]];
    return [
      v,
      V3.add(
        V3.mul(V3.add(...fIdxs.map((i) => vertices[faceFaceCenterMap[i]])), 1 / (fIdxs.length * edges.length)),
        V3.add(...edges.map((i) => V3.mul(V3.add(vertices[i], vertices[v]), 1 / (edges.length * edges.length)))),
        V3.mul(vertices[v], 1 - 3 / edges.length)
      ),
    ];
  });

  verticesToReplace.forEach(([vIdx, v]) => (vertices[vIdx] = v));

  // updating the faces
  faceMidEdgeArray.forEach((heIdxs, i) => {
    const f = mesh.faces[i];
    f.forEach((vIdx, j) => faces.push([vIdx, edgeVId[heIdxs[j]], faceCenterIdxs[i], edgeVId[heIdxs[(j + heIdxs.length - 1) % heIdxs.length]]]));
  });

  return { vertices, normals, faces };
};

export const subdivide = (mesh: Mesh, smooth?: number): Mesh => {
  // intermediate edges
  const vertices = [...mesh.vertices];
  const normals = [...mesh.normals];
  const edgeVertices: { [name: string]: number } = {};
  const faces: number[][] = [];

  const allMidsPerVertex: { [vIdx: number]: number[] } = {};

  mesh.faces.forEach((f) => {
    const midEdges = f.map((vIdx, i, arr) => {
      const localName = vIdx < arr[(i + 1) % arr.length] ? `${vIdx}-${arr[(i + 1) % arr.length]}` : `${arr[(i + 1) % arr.length]}-${vIdx}`;
      if (edgeVertices[localName] === undefined) {
        edgeVertices[localName] = vertices.push(V3.mul(V3.add(vertices[vIdx], vertices[arr[(i + 1) % arr.length]]), 0.5)) - 1;
        normals.push(V3.mul(V3.add(normals[vIdx], normals[arr[(i + 1) % arr.length]]), 0.5));
      }
      if (allMidsPerVertex[vIdx]) allMidsPerVertex[vIdx].push(edgeVertices[localName]);
      else allMidsPerVertex[vIdx] = [edgeVertices[localName]];

      if (allMidsPerVertex[arr[(i + 1) % arr.length]]) allMidsPerVertex[arr[(i + 1) % arr.length]].push(edgeVertices[localName]);
      else allMidsPerVertex[arr[(i + 1) % arr.length]] = [edgeVertices[localName]];
      return edgeVertices[localName];
    });

    const fIdx = vertices.push(V3.mul(V3.add(...midEdges.map((i) => vertices[i])), 1 / midEdges.length)) - 1;
    normals.push(V3.mul(V3.add(...midEdges.map((i) => normals[i])), 1 / midEdges.length));

    f.forEach((vIdx, i) => faces.push([vIdx, midEdges[i], fIdx, midEdges[(i + midEdges.length - 1) % midEdges.length]]));
  });

  if (smooth) {
    console.log(smooth);
    Object.entries(allMidsPerVertex).forEach(([idx, otherIdxs]) => {
      const n = normals[idx as any as number];
      const v = vertices[idx as any as number];
      const averageCenter = V3.mul(V3.add(...otherIdxs.map((i) => vertices[i])), 1 / otherIdxs.length);
      const t0 = V3.dot(n, v);
      const t = V3.dot(n, averageCenter);
      const diff = t - t0;
      vertices[idx as any as number] = V3.add(v, V3.mul(n, diff * smooth));
    });
  }

  return {
    faces,
    normals,
    vertices,
  };
};
