import React, { useEffect, useRef } from 'react';
import { Version0Type } from '../modelDefinition/types/version0.generatedType';
import { getMaterialColor, getVertexData, isWireframe } from './geometry/factory';
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three';

export const ThreeMesh: React.FC<{ data: Version0Type }> = ({ data }) => {
  const meshRef = useRef<Mesh | null>(null);
  const color = getMaterialColor(data);

  useEffect(() => {
    if (meshRef.current) {
      const vertexData = getVertexData(data);
      meshRef.current.material = new MeshPhongMaterial({ color, side: 0, wireframe: isWireframe(data) });
      const bufferGeometry = new BufferGeometry();
      bufferGeometry.setIndex(vertexData.indices);
      bufferGeometry.attributes['position'] = new BufferAttribute(vertexData.positions, 3);
      bufferGeometry.computeVertexNormals();
      bufferGeometry.attributes['normal'] = new BufferAttribute(
        bufferGeometry.attributes['normal'].array.map((v) => -v),
        3
      );
      meshRef.current.geometry = bufferGeometry;
    }
  }, [data]);

  return <mesh ref={meshRef}></mesh>;
};
