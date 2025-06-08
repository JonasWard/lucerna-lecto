import React, { useEffect, useRef, useState } from 'react'
import { Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { getMesh } from './geometry/factory'
import { getVertexDataForMesh } from './geometry/mesh/vertexData'
import { useData } from 'src/state/state'
import { Mesh, BufferGeometry, NormalBufferAttributes, ShaderMaterial, Object3DEventMap, BufferAttribute } from 'three'
import { getFragmentShader, getVertexShader } from './geometry/sdMathematics/glsl/shaderComposer'
import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'

export const LucernaLectoMesh: React.FC = () => {
  const meshRef = useRef<Mesh<BufferGeometry<NormalBufferAttributes>, ShaderMaterial, Object3DEventMap>>(null)
  const data = useData((s) => s.data) as any as Version0Type
  const [globalGeometryString, setGlobalGeometryString] = useState(
    JSON.stringify([data[AttributeNames.GlobalGeometry]])
  )
  const [mainMethodsString, setMainMethodsString] = useState(JSON.stringify([data[AttributeNames.Pattern]]))

  useEffect(() => {
    const newGlobalGeometryString = JSON.stringify([
      data[AttributeNames.GlobalGeometry],
      data[AttributeNames.Pattern]['expression'],
      data[AttributeNames.Pattern]['max-distance'],
      data[AttributeNames.GlobalGeometry],
    ])
    if (newGlobalGeometryString !== globalGeometryString) setGlobalGeometryString(newGlobalGeometryString)
    const newMainMethodsString = JSON.stringify([data[AttributeNames.Pattern]])
    if (newMainMethodsString !== mainMethodsString) setMainMethodsString(newMainMethodsString)
  }, [data])

  useEffect(() => {
    if (meshRef.current) {
      const freshMesh = getMesh(data)
      const meshVertexData = getVertexDataForMesh(freshMesh)

      const rawBufferGeometry = new BufferGeometry()

      rawBufferGeometry.setIndex(meshVertexData.indices)
      rawBufferGeometry.attributes['position'] = new BufferAttribute(meshVertexData.positions, 3)
      rawBufferGeometry.attributes['normal'] = new BufferAttribute(meshVertexData.normals, 3)
      rawBufferGeometry.attributes['uv'] = new BufferAttribute(meshVertexData.uvs, 2)
      rawBufferGeometry.attributes['maxDistance'] = new BufferAttribute(new Float32Array(freshMesh.maxDistances!), 1)
      meshRef.current.geometry.dispose()
      meshRef.current.geometry = rawBufferGeometry
    }
  }, [globalGeometryString])

  useEffect(() => {
    if (meshRef.current) {
      const vertexShader = getVertexShader(data)
      const fragmentShader = getFragmentShader(data)

      meshRef.current.material.dispose()
      meshRef.current.material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: 2,
      })
    }
  })

  return (
    <mesh ref={meshRef}>
      <bufferGeometry attach="geometry" />
      <shaderMaterial />
    </mesh>
  )
}
