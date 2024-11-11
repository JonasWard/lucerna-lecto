import React from 'react';
import { Version0Type } from '../modelDefinition/types/version0.generatedType';
import { getMaterialColor, getVertexData } from './geometry/factory';

export const ThreeMesh: React.FC<{ data: Version0Type }> = ({ data }) => {
  const vertexData = getVertexData(data);

  console.log(vertexData);

  const color = getMaterialColor(data);
  console.log(color);

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={vertexData.positions.length / 3} array={vertexData.positions} itemSize={3} />
        {/* <bufferAttribute attach='attributes-uv' count={vertexData.uvs.length / 2} array={vertexData.uvs} itemSize={2} /> */}
        {/* <bufferAttribute attach='indices' count={vertexData.indices.length / 3} array={vertexData.indices} itemSize={3} /> */}
      </bufferGeometry>
      {/* <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={boilerPlateData.positions.length / 3} array={boilerPlateData.positions} itemSize={3} />
        <bufferAttribute attach='attributes-uv' count={boilerPlateData.uvs.length / 3} array={boilerPlateData.uvs} itemSize={2} />
        <bufferAttribute attach='indices' count={boilerPlateData.indices.length / 3} array={vertexData.indices} itemSize={3} />
      </bufferGeometry> */}
      <meshStandardMaterial color={color} side={2} />
    </mesh>
  );
};
