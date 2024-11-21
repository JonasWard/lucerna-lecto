import { Canvas } from '@react-three/fiber';
import React, { LegacyRef, useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Version0Type } from '../modelDefinition/types/version0.generatedType';
import { ThreeMesh } from './ThreeMesh';
import { AttributeNames } from '../modelDefinition/enums/attributeNames';
import { Euler, Vector3 } from 'three';

export const ThreeCanvas: React.FC<{
  canvasRef: LegacyRef<HTMLCanvasElement>;
  renderData: Version0Type;
}> = ({ canvasRef, renderData }) => {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} key='threejs-canvas' ref={canvasRef} style={{ width: '100svw', height: '100svh' }}>
      <OrbitControls
        position={[
          renderData[AttributeNames.Viewport]['Camera Origin']['X'].value,
          renderData[AttributeNames.Viewport]['Camera Origin']['Y'].value,
          renderData[AttributeNames.Viewport]['Camera Origin']['Z'].value,
        ]}
        target={
          new Vector3(
            renderData[AttributeNames.Viewport]['Camera Target']['X'].value,
            renderData[AttributeNames.Viewport]['Camera Target']['Y'].value,
            renderData[AttributeNames.Viewport]['Camera Target']['Z'].value
          )
        }
        rotation={
          new Euler(
            renderData[AttributeNames.Viewport]['Camera Angle'].value,
            renderData[AttributeNames.Viewport]['Camera Angle'].value,
            renderData[AttributeNames.Viewport]['Camera Angle'].value
          )
        }
        zoom0={renderData[AttributeNames.Viewport]['Radius'].value}
      />
      <ambientLight intensity={Math.PI / 4} />
      <pointLight position={[0, 50, 0]} intensity={Math.PI * 1000} />
      {/* <spotLight position={[800, 800, 800]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} /> */}
      <ThreeMesh data={renderData} />
    </Canvas>
  );
};
