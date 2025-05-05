import React, { useEffect } from 'react'
import { DisplayType, StateDataRenderer } from './StateDataRenderer'
import { AttributeNames } from '../../modelDefinition/enums/attributeNames'
import { shouldUseDrawer } from '../utils/windowMethods'
import { EnumSemantics } from 'url-safe-bitpacking/dist/types'
import { useData } from '../../state/state'

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

type IParametricInputProps = {
  versionEnumSemantics?: EnumSemantics
}

export const ParametricInput: React.FC<IParametricInputProps> = ({ versionEnumSemantics }) => {
  const data = useData((s) => s.data)
  const updateEntry = useData((s) => s.updateDataEntry)
  const [activeName, setActiveName] = React.useState('')

  return (
    <div style={{ position: 'fixed', left: 10, top: 10, padding: 8 }}>
      <StateDataRenderer
        asSlider
        data={data}
        name={''} // name is not used in this context
        updateEntry={updateEntry}
        versionEnumSemantics={versionEnumSemantics}
        activeName={activeName}
        setActiveName={setActiveName}
        displayTypeMap={displayTypeMap}
      />
    </div>
  )
}
