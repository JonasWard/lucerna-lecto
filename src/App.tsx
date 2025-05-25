import React, { useEffect, useRef } from 'react'
import './App.css'
import { parserObjects } from './modelDefinition/model'
import { ParametricInput } from './Components/parametrics/ParametricInput'
import { useData } from './state/state'
import { ThreeCanvas } from './webgl/ThreeCanvas'
import { useParams } from 'react-router-dom'
import { Button, message } from 'antd'
import { LiaFileDownloadSolid } from 'react-icons/lia'
import { Version0Type } from './modelDefinition/types/version0.generatedType'
import { version0EnumSemantics } from './modelDefinition/types/version0.enumsemantics'
import { exportSTL } from './webgl/geometry/exportstl'
import { exportOBJ } from './webgl/geometry/exportobj'
import { getMesh } from './webgl/geometry/factory'
import { GiLaserBlast } from 'react-icons/gi'
import { SiCncf } from 'react-icons/si'
import { getBumpMesh } from './webgl/geometry/mesh/bumping'
import { AttributeNames } from './modelDefinition/enums/attributeNames'

const defaultState = 'B80M3xVxWEarzQ-DhCcar6TXUKETJkCs0ZojDxP6AAIAAA-enEE4gqO6M3ykb3f_uuKA'

export const App: React.FC = () => {
  const { stateString } = useParams()
  const data = useData((s) => s.data)
  const activeName = useData((s) => s.activeName)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/lucerna-lecto/#${parserObjects.stringify(data)}`)
  }, [data])

  useEffect(() => {
    if (stateString) {
      try {
        useData.getState().setData(parserObjects.parser(stateString))
      } catch (e) {
        try {
          useData.getState().setData(parserObjects.parser(defaultState))
          message.warning('the state string you tried to use was not valid, using the default state instead')
        } catch (e) {
          useData.getState().setData(parserObjects.parser())
          message.error('the default!! state string was not valid, using the default object state instead')
        }
      }
    } else {
      try {
        useData.getState().setData(parserObjects.parser(defaultState))
      } catch (e) {
        useData.getState().setData(parserObjects.parser())
        message.error('the default!! state string was not valid, using the default object state instead')
      }
    }
  }, [])

  const downloadPNG = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `lucerna-lecto.${parserObjects.stringify(data)}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const downloadSTL = () =>
    exportSTL(
      getBumpMesh(getMesh(data as any as Version0Type), data as any as Version0Type),
      `lucerna-lecto.${parserObjects.stringify(data)}`
    )
  const downloadOBJ = () =>
    exportOBJ(
      getBumpMesh(getMesh(data as any as Version0Type), data as any as Version0Type),
      `lucerna-lecto.${parserObjects.stringify(data)}`
    )

  return (
    <>
      <div>
        <ParametricInput versionEnumSemantics={version0EnumSemantics} />
        <div className={`three-scene ${activeName ? 'active' : ''}`}>
          <ThreeCanvas
            canvasRef={canvasRef}
            shaderViz={(data as unknown as Version0Type)[AttributeNames.GlobalGeometry]['shader-based'].value}
            meshViz={(data as unknown as Version0Type)[AttributeNames.GlobalGeometry]['mesh-based'].value}
          />
        </div>
      </div>
      <Button style={{ position: 'fixed', top: '15px', right: '15px' }} onClick={downloadPNG}>
        <LiaFileDownloadSolid style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
      </Button>
      {localStorage.getItem('iAmJonas') === 'true' ? (
        <>
          <Button style={{ position: 'fixed', top: '50px', right: '15px' }} onClick={downloadSTL}>
            <GiLaserBlast style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
          </Button>
          <Button style={{ position: 'fixed', top: '85px', right: '15px' }} onClick={downloadOBJ}>
            <SiCncf style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
          </Button>
        </>
      ) : null}
    </>
  )
}
