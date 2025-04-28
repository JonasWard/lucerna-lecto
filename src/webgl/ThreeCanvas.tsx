import { Canvas } from '@react-three/fiber'
import React, { LegacyRef } from 'react'
// import { ThreeMesh } from './ThreeMesh'
import { ThreeCameraControls } from './ThreeCameraControls'
import { LucernaLectoMesh } from './LucernaLectoMesh'
import { ThreeMesh } from './ThreeMesh'

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
      <LucernaLectoMesh />
      {/* <ThreeMesh /> */}
    </Canvas>
  )
}
