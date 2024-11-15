import { Scene, MeshBuilder, Vector3, Material, Mesh as BabylonMesh, TransformNode } from '@babylonjs/core';
import { GeometryBaseData } from '../baseGeometry';
import { V3, Mesh } from '../v3';
import { VoxelComplex, Voxel } from './types/voxelComplex';
import { getCenterOfVoxelFace, getCenterOfVoxel, getHalfEdgeMeshForVoxel } from './voxelComplex';
import { MaterialFactory } from '../materialFactory';
import { HalfEdgeMeshRenderer } from '../halfEdge/halfedge.artists';
import { VoxelMesh } from './voxelComplex.mesh';

const vSize = 0.02;
const vHSize = vSize * 0.2;
const edgeResolution = 5;
const colorScale = 200;

const getColorForVertex = (v: V3): string => {
  const r = Math.ceil((((v.x * colorScale) % 255) + 255) % 255).toString(16);
  const g = Math.ceil((((v.y * colorScale) % 255) + 255) % 255).toString(16);
  const b = Math.ceil((((v.z * colorScale) % 255) + 255) % 255).toString(16);
  return `${r.length < 2 ? '0' + r : r}${g.length < 2 ? '0' + g : g}${b.length < 2 ? '0' + b : b}`;
};

// creates a cube mesh representation for a vertex
export const getMeshForVertex = (c: V3, scene: Scene, color: string, rootNode?: TransformNode, scale: number = 1) => {
  const vHash = V3.getHash(c);
  const babylonMesh = MeshBuilder.CreateSphere(vHash, { segments: 2, diameter: vSize * scale }, scene);

  if (rootNode) babylonMesh.parent = rootNode;

  babylonMesh.material = MaterialFactory.getMaterialForUuid(scene, color, 'color-');
  babylonMesh.position.set(c.x, c.z, -c.y);
};

export const getMeshForEdge = (v0: V3, v1: V3, scene: Scene, id: string, color?: string, rootNode?: TransformNode, scale: number = 1) => {
  const babylonMesh = MeshBuilder.CreateTube(id, {
    path: [new Vector3(v0.x, v0.z, -v0.y), new Vector3(v1.x, v1.z, -v1.y)],
    tessellation: edgeResolution,
    radius: vHSize * scale,
    cap: 0, // no cap
  });

  babylonMesh.material = MaterialFactory.getMaterialForUuid(scene, color ?? id, 'color-');
  if (rootNode) babylonMesh.parent = rootNode;
};

const getRepresentativeLocationForVoxelFace = (voxel: Voxel, vX: VoxelComplex, index: number): V3 => {
  const fC = getCenterOfVoxelFace(voxel, vX, index);
  const cC = getCenterOfVoxel(voxel, vX);

  return V3.add(cC, V3.mul(V3.sub(fC, cC), 0.5));
};

const getVertexPairForFaceInVoxel = (voxel: Voxel, vX: VoxelComplex, index: number): [V3, V3] | undefined => {
  if (voxel.neighbourMap[index] === null) return undefined;

  const v0 = getRepresentativeLocationForVoxelFace(voxel, vX, index);
  const v1 = getRepresentativeLocationForVoxelFace(vX.voxels[voxel.neighbourMap[index]![0]], vX, voxel.neighbourMap[index]![1]);

  return [v0, V3.add(v0, V3.mul(V3.sub(v1, v0), 0.5))];
};

// getting the center of a face in a voxelcomplex
const getRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, index: number, scene: Scene, rootNode?: TransformNode, scale: number = 1) => {
  // getting the center of the face
  const v = getRepresentativeLocationForVoxelFace(voxel, vX, index);

  getMeshForVertex(v, scene, voxel.id, rootNode, scale);
};

const getAllRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, scene: Scene, rootNode?: TransformNode, scale: number = 1) => {
  for (let i = 0; i < voxel.n + 2; i++) {
    getRepresentativeMeshForVoxelFace(voxel, vX, i, scene, rootNode, scale);
    const pair = getVertexPairForFaceInVoxel(voxel, vX, i);
    if (pair) getMeshForEdge(pair[0], pair[1], scene, `${voxel.id}-${i}`, undefined, rootNode, scale);
  }
};

const voxelToMesh = (voxel: Voxel, vX: VoxelComplex, insetPercentage: number) => getHalfEdgeMeshForVoxel(voxel, vX, 1 - insetPercentage);

export const getMeshRepresentationOfVoxelComplexGraph = (vX: VoxelComplex, scene: Scene, rootNode?: TransformNode, scale: number = 1) => {
  Object.values(vX.vertices).map((v) => getMeshForVertex(v, scene, getColorForVertex(v), rootNode, scale));

  // render the face verticess
  Object.values(vX.voxels).forEach((voxel) => getAllRepresentativeMeshForVoxelFace(voxel, vX, scene, rootNode, scale));
};

// artist that renderers a voxel complex using a mesh representation
export class VoxelComplexMeshArtist {
  public static defaultMaterial = (scene: Scene) => MaterialFactory.getLampMaterial(scene);

  public static stateRenderInset = 0.9;

  public static render = (vX: VoxelComplex, scene: Scene, gBD: GeometryBaseData, material?: Material, name = 'lampGeometry') => {
    const mesh = VoxelMesh.getMeshForVoxelComplex(vX, gBD);

    const vertexData = Mesh.getVertexDataForMesh(mesh);
    const babylonMesh = new BabylonMesh(name, scene);
    vertexData.applyToMesh(babylonMesh);
    babylonMesh.material = material ?? VoxelComplexMeshArtist.defaultMaterial(scene);

    return babylonMesh;
  };

  public static stateRender = (vX: VoxelComplex, rootNode: TransformNode, scene: Scene) => {
    Object.values(vX.voxels).forEach((v, i) => {
      const heMesh = getHalfEdgeMeshForVoxel(v, vX, VoxelComplexMeshArtist.stateRenderInset);
      const material = MaterialFactory.getVoxelStateMaterial(scene, v.state);
      HalfEdgeMeshRenderer.render(heMesh, scene, material, `stateRender-${i}`).parent = rootNode;
    });
  };
}
