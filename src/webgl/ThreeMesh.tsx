import React, { useEffect, useRef, useState } from 'react'
import { Version0Type } from '../modelDefinition/types/version0.generatedType'
import { getMesh, isDoubleSide, isWireframe } from './geometry/factory'
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js'
import { BufferAttribute, BufferGeometry, InstancedMesh, Mesh, MeshNormalMaterial, Object3D } from 'three'
import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { getVertexDataForMesh } from './geometry/mesh/vertexData'
import { getVertexInstancedMeshForMesh } from './geometry/baseMeshes/helperRenders'
import { useData } from '../state/state'
import { getBumpMesh } from './geometry/mesh/bumping'

const getGeometrySettings = (data: Version0Type) =>
  JSON.stringify([
    data[AttributeNames.LampShades],
    data[AttributeNames.Pattern],
    data[AttributeNames.GlobalGeometry],
    data[AttributeNames.VerticalProfile],
    data[AttributeNames.Visualization].Normals,
    data[AttributeNames.Visualization].Vertices,
  ])

const getMaterialSettings = (data: Version0Type) =>
  JSON.stringify([data[AttributeNames.Material], data[AttributeNames.Visualization]])

export const ThreeMesh = () => {
  const meshRef = useRef<Mesh | null>(null)
  const vertexInstancedMesh = useRef<InstancedMesh | null>(null)
  const [geometrySettings, setGeometrySettings] = useState('')
  const [materialSettings, setMaterialSettings] = useState('')
  const data = useData((s) => s.data) as any as Version0Type

  useEffect(() => {
    if (meshRef.current) {
      // first checking the geometry settings
      const currentGeometrySettings = getGeometrySettings(data)
      if (currentGeometrySettings !== geometrySettings) {
        const rawMesh = getMesh(data)

        const bumpedMesh = getBumpMesh(rawMesh, data)
        if (data[AttributeNames.Visualization].Vertices.value) {
          meshRef.current.geometry.dispose()
          vertexInstancedMesh.current = getVertexInstancedMeshForMesh(bumpedMesh)
        } else {
          if (vertexInstancedMesh.current) vertexInstancedMesh.current.dispose()
          const vertexData = getVertexDataForMesh(bumpedMesh)
          meshRef.current.material = new MeshNormalMaterial({
            side: 2,
            wireframe: isWireframe(data),
          })

          // meshRef.current.material = new MeshPhongMaterial({ color, side: isDoubleSide(data) ? 2 : 0, wireframe: isWireframe(data) });
          const bufferGeometry = new BufferGeometry()
          bufferGeometry.setIndex(vertexData.indices)
          bufferGeometry.attributes['position'] = new BufferAttribute(vertexData.positions, 3)

          meshRef.current.geometry = bufferGeometry
          setGeometrySettings(currentGeometrySettings)

          if (meshRef.current.parent) {
            const existingNormalsVisualizerObject = meshRef.current.parent.children.find(
              (c) => c.name === 'normalHelper'
            )
            if (existingNormalsVisualizerObject) meshRef.current.parent.remove(existingNormalsVisualizerObject)
          }

          if (data.Visualization.Normals.value) {
            if (!meshRef.current.parent) return
            const rawVertexData = getVertexDataForMesh(rawMesh)
            const rawBufferGeometry = new BufferGeometry()
            rawBufferGeometry.attributes['position'] = new BufferAttribute(rawVertexData.positions, 3)
            rawBufferGeometry.attributes['normal'] = new BufferAttribute(rawVertexData.normals, 3)
            const rawThreeMesh = new Mesh(rawBufferGeometry)
            const normalRenderers = new VertexNormalsHelper(
              rawThreeMesh,
              data['Global Geometry'].expression.value,
              0x000000,
              1
            ) as Object3D
            normalRenderers.name = 'normalHelper'
            meshRef.current.parent.add(normalRenderers)
          }

          bufferGeometry.computeVertexNormals()
          bufferGeometry.attributes['normal'] = new BufferAttribute(
            bufferGeometry.attributes['normal'].array.map((v) => -v),
            3
          )
        }
      }

      // next checking the material settings
      const currentMaterialSettings = getMaterialSettings(data)
      if (currentMaterialSettings !== materialSettings) {
        meshRef.current.material = new MeshNormalMaterial({
          side: isDoubleSide(data) ? 2 : 0,
          wireframe: isWireframe(data),
        })

        setMaterialSettings(currentMaterialSettings)
      }

      // removing previous normal objects
      const previousObjects = meshRef.current.parent?.children.filter((v) => v.name === 'normals')
      previousObjects?.forEach((previousObject) => meshRef.current?.parent?.remove(previousObject))
    }
  }, [data])

  return <mesh ref={meshRef} />
}
