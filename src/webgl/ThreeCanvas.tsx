import { Canvas } from '@react-three/fiber';
import React, { LegacyRef, useEffect, useRef } from 'react';
import { ShaderMaterial } from 'three';
import { DataEntry } from 'url-safe-bitpacking';
import { Version0Type } from '../modelDefinition/types/version0.generatedType';

const size = 1000;

// prettier-ignore
const vertices = new Float32Array([
  -size, -size, 0,
  size, -size, 0,
  size, size, 0,
  size, size, 0,
  -size, size, 0, 
  -size, -size, 0
]);

// prettier-ignore
const uvs = new Float32Array([
  -size, -size,
  size, -size,
  size, size,
  size, size,
  -size, size, 
  -size, -size
]);

const Plane = (...props: any) => {
  const materialRef = useRef<ShaderMaterial>(null);

  useEffect(() => {
    if (materialRef.current) materialRef.current.needsUpdate = true;
  }, [props[0].data]);

  return (
    <mesh scale={props[0].scale} rotateZ={props[0].rotation} {...props}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={6} array={vertices} itemSize={3} />
        <bufferAttribute attach='attributes-uv' count={6} array={uvs} itemSize={2} />
      </bufferGeometry>
    </mesh>
  );
};

export const ThreeCanvas: React.FC<{
  canvasRef: LegacyRef<HTMLCanvasElement>;
  updateEntry: (update: DataEntry | DataEntry[]) => void;
  renderData: Version0Type;
}> = ({ canvasRef, updateEntry, renderData }) => {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} key='threejs-canvas' ref={canvasRef} style={{ width: '100svw', height: '100svh' }}>
      <Plane data={renderData} />
    </Canvas>
  );
};
