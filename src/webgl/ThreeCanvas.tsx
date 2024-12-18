import { Canvas } from '@react-three/fiber'
import React, { LegacyRef } from 'react'
import { Version0Type } from '../modelDefinition/types/version0.generatedType'
import { ThreeMesh } from './ThreeMesh'
import { ThreeCameraControls } from './ThreeCameraControls'

export const ThreeCanvas: React.FC<{
  canvasRef: LegacyRef<HTMLCanvasElement>
}> = ({ canvasRef }) => {
  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true }}
      key="threejs-canvas"
      ref={canvasRef}
      style={{ width: '100svw', height: '100svh' }}
    >
      <ThreeCameraControls />
      <ambientLight intensity={Math.PI / 4} />
      <pointLight position={[0, 50, 0]} intensity={Math.PI * 1000} />
      {/* <spotLight position={[800, 800, 800]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} /> */}
      <ThreeMesh />
    </Canvas>
  )
}
