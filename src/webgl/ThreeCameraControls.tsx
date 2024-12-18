import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import React, { useEffect, useRef } from 'react'
import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { FloatDataEntry } from 'url-safe-bitpacking/dist/types'
import { useData } from '../state/state'

const setCameraData = (camera: any, orbitControls: any) => {
  const updateEntry = useData.getState().updateDataEntry
  const data = useData.getState().data as any as Version0Type

  // finding the viewport data that is relevant
  updateEntry([
    { ...(data.Viewport[AttributeNames.CameraPosition].X as FloatDataEntry), value: camera.position.x },
    { ...(data.Viewport[AttributeNames.CameraPosition].Y as FloatDataEntry), value: camera.position.y },
    { ...(data.Viewport[AttributeNames.CameraPosition].Z as FloatDataEntry), value: camera.position.z },
    { ...(data.Viewport[AttributeNames.OrbitControlTarget].X as FloatDataEntry), value: orbitControls.target.x },
    { ...(data.Viewport[AttributeNames.OrbitControlTarget].Y as FloatDataEntry), value: orbitControls.target.y },
    { ...(data.Viewport[AttributeNames.OrbitControlTarget].Z as FloatDataEntry), value: orbitControls.target.z },
    {
      ...(data.Viewport[AttributeNames.OrbitControlTarget].W as FloatDataEntry),
      value: camera.quaternion.w,
    },
    { ...(data.Viewport.Radius as FloatDataEntry), value: (camera as any).zoom },
  ])
}

const getViewportData = (data: Version0Type) => JSON.stringify([data[AttributeNames.Viewport]])

export const ThreeCameraControls: React.FC<{}> = () => {
  const renderData = useData((s) => s.data) as any as Version0Type

  const viewportData = useRef<string | null>('')
  const { camera } = useThree()
  const controlRef = useRef(null)

  useEffect(() => {
    const newViewPortData = getViewportData(renderData)
    if (newViewPortData !== viewportData.current && viewportData.current !== null) {
      // have to disable the orbit controls to properly load in the quaternion
      // ;(controlRef.current as any).setAzimuthalAngle(renderData.Viewport[AttributeNames.OrbitControlTarget].X.value)
      // ;(controlRef.current as any).setPolarAngle(renderData.Viewport[AttributeNames.OrbitControlTarget].Y.value)
      // ;(controlRef.current as any).setDistance(renderData.Viewport[AttributeNames.OrbitControlTarget].Z.value)
      ;(controlRef.current as any).target.set(
        renderData.Viewport[AttributeNames.OrbitControlTarget].X.value,
        renderData.Viewport[AttributeNames.OrbitControlTarget].Y.value,
        renderData.Viewport[AttributeNames.OrbitControlTarget].Z.value
      )
      camera.position.set(
        renderData.Viewport[AttributeNames.CameraPosition].X.value,
        renderData.Viewport[AttributeNames.CameraPosition].Y.value,
        renderData.Viewport[AttributeNames.CameraPosition].Z.value
      )

      // getting the direction vector facing away from the object

      viewportData.current = newViewPortData
    }
  }, [renderData])

  useEffect(
    () =>
      (controlRef.current as any).addEventListener('change', () => {
        setCameraData(camera, controlRef.current)
        if (viewportData.current !== null) {
          viewportData.current = null
        }
      }),
    [controlRef]
  )

  return <OrbitControls ref={controlRef} />
}
