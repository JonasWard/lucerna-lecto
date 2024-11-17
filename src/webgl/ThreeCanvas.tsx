import { Canvas } from '@react-three/fiber';
import React, { LegacyRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Version0Type } from '../modelDefinition/types/version0.generatedType';
import { ThreeMesh } from './ThreeMesh';

export const ThreeCanvas: React.FC<{
  canvasRef: LegacyRef<HTMLCanvasElement>;
  renderData: Version0Type;
}> = ({ canvasRef, renderData }) => {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} key='threejs-canvas' ref={canvasRef} style={{ width: '100svw', height: '100svh' }}>
      <OrbitControls />
      <ambientLight intensity={Math.PI / 4} />
      <pointLight position={[0, 50, 0]} intensity={Math.PI * 1000} />
      {/* <spotLight position={[800, 800, 800]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} /> */}
      <ThreeMesh data={renderData} />
    </Canvas>
  );
};
