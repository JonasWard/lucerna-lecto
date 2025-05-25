import { Canvas } from '@react-three/fiber'
import React, { LegacyRef } from 'react'
import { ThreeCameraControls } from './ThreeCameraControls'
import { LucernaLectoMesh } from './LucernaLectoMesh'
import { ThreeMesh } from './ThreeMesh'

export const ThreeCanvas: React.FC<{
  canvasRef: LegacyRef<HTMLCanvasElement>
  shaderViz: boolean
  meshViz: boolean
}> = ({ canvasRef, shaderViz, meshViz }) => {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} key="threejs-canvas" ref={canvasRef}>
      <ThreeCameraControls />
      <ambientLight intensity={Math.PI / 4} />
      <pointLight position={[0, 50, 0]} intensity={Math.PI * 1000} />
      {shaderViz ? <LucernaLectoMesh /> : null}
      {meshViz ? <ThreeMesh /> : null}
    </Canvas>
  )
}
