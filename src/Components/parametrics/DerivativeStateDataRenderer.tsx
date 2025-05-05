import { DataEntry } from 'url-safe-bitpacking';
import { EnumSemantics, StateDataType } from 'url-safe-bitpacking';
import { DisplayType, getDisplayType, StateDataRenderer } from './StateDataRenderer';
import { ViewWrapper } from './ViewWrapper';
import React from 'react';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { ArrayDerivativeStateDataRenderer } from './ArrayDerivativeStateDataRenderer';
import { IntDataEntry } from 'url-safe-bitpacking/dist/types';

type IDerivativeStateDataRenderer = {
  s: DataEntry
  v: StateDataType | StateDataType[]
  name: string
  versionEnumSemantics?: EnumSemantics
  displayTypeMap?: { [key: string]: DisplayType }
  displayType?: DisplayType
  asSlider?: boolean
  disabled?: string[]
}

export const DerivativeStateDataRenderer: React.FC<IDerivativeStateDataRenderer> = ({
  s,
  v,
  name,
  versionEnumSemantics,
  displayTypeMap,
  asSlider,
  disabled = [],
}) => (
  <ViewWrapper key={name} displayType={getDisplayType(s.name!, displayTypeMap)} name={s.name!} disabled={disabled}>
    {Array.isArray(v) ? (
      <ArrayDerivativeStateDataRenderer
        s={s as IntDataEntry}
        v={v}
        versionEnumSemantics={versionEnumSemantics}
        displayTypeMap={displayTypeMap}
        disabled={disabled}
        asSlider={asSlider}
      />
    ) : (
      <>
        <DataEntryRenderer asSlider={asSlider} key={name} dataEntry={s} versionEnumSemantics={versionEnumSemantics} />
        <StateDataRenderer
          asSlider={asSlider}
          key={`${name}-subdata`}
          name={''}
          data={v}
          versionEnumSemantics={versionEnumSemantics}
          displayType={getDisplayType(name, displayTypeMap)}
          displayTypeMap={displayTypeMap}
          disabled={disabled}
        />
      </>
    )}
  </ViewWrapper>
)
