import React from 'react'
import { DisplayType, StateDataRenderer } from './StateDataRenderer'
import { AttributeNames } from '../../modelDefinition/enums/attributeNames'
import { DataEntry, EnumSemantics, StateDataType } from 'url-safe-bitpacking/dist/types'
import { useData } from '../../state/state'
import { Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { IconRenderer } from './IconRenderer'
import { GrClose } from 'react-icons/gr'
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer'

const displayTypeMap = {
  [AttributeNames.Viewport]: DisplayType.NESTED,
  [AttributeNames.LampShades]: DisplayType.NESTED,
  [AttributeNames.Pattern]: DisplayType.NESTED,
  [AttributeNames.Footprint]: DisplayType.NESTED,
  [AttributeNames.Heights]: DisplayType.NESTED,
  [AttributeNames.Base]: DisplayType.NESTED,
  [AttributeNames.Material]: DisplayType.NESTED,
  [AttributeNames.VerticalProfile]: DisplayType.NESTED,
  [AttributeNames.Visualization]: DisplayType.NESTED,
  [AttributeNames.GlobalGeometry]: DisplayType.NESTED,
}

const mainKeys: (keyof Version0Type)[] = [
  ...(import.meta.env.DEV ? ([AttributeNames.Version, AttributeNames.Viewport] as (keyof Version0Type)[]) : []),
  AttributeNames.LampShades,
  AttributeNames.Pattern,
  AttributeNames.Material,
  AttributeNames.VerticalProfile,
  AttributeNames.Visualization,
  AttributeNames.GlobalGeometry,
]

type IParametricInputProps = {
  versionEnumSemantics?: EnumSemantics
}

export const ParametricInput: React.FC<IParametricInputProps> = ({ versionEnumSemantics }) => {
  const data = useData((s) => s.data)
  const activeName = useData((s) => s.activeName)
  const setActiveName = useData((s) => s.setActiveName)
  const clearActiveName = useData((s) => s.clearActiveName)

  return (
    <div className={`parametric-input-top-level ${activeName ? 'active' : ''}`}>
      <div className="parametric-input-icons">
        {mainKeys.map((k) => (
          <div className={`icon-button ${k === activeName ? 'active' : ''}`} key={k} onClick={() => setActiveName(k)}>
            <IconRenderer name={k} noName />
          </div>
        ))}
      </div>
      <div className={`parametric-input-content ${activeName ? 'active' : ''}`}>
        {activeName ? (
          <span className="parametric-input-title">
            <IconRenderer name={activeName} />
            <GrClose onClick={clearActiveName} />
          </span>
        ) : (
          <span></span>
        )}
        <div className={`parametric-input-fields`}>
          {mainKeys.map((k) =>
            activeName === k ? (
              k === AttributeNames.Version ? (
                <DataEntryRenderer key={k} dataEntry={data[k] as DataEntry} />
              ) : (
                <StateDataRenderer
                  key={k}
                  asSlider
                  data={data[k] as StateDataType}
                  name={k}
                  versionEnumSemantics={versionEnumSemantics}
                  displayTypeMap={displayTypeMap}
                />
              )
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
