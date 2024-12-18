import { DataEntry, StateDataType } from 'url-safe-bitpacking'
import { create } from 'zustand'
import { parserObjects } from '../modelDefinition/model'

const isIOS = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

const debounce = (callback: () => void, wait: number) => {
  let timeoutId: number | undefined = undefined
  window.clearTimeout(timeoutId)
  timeoutId = window.setTimeout(callback, wait)
}

type DataStore = {
  data: StateDataType
  setData: (s: StateDataType) => void
  updateDataEntry: (data: DataEntry | DataEntry[]) => void
  updateDataEntryNonThrottled: (data: DataEntry | DataEntry[]) => void
  undo: () => void
  redo: () => void
  undoStack: string[]
  redoStack: string[]
}

export const useData = create<DataStore>((set) => ({
  data: parserObjects.parser(),
  setData: (data) => set((state) => ({ ...state, data })),
  updateDataEntry: (data: DataEntry | DataEntry[]) =>
    debounce(() => useData.getState().updateDataEntryNonThrottled(data), isIOS() ? 50 : 10),
  updateDataEntryNonThrottled: (update: DataEntry | DataEntry[]) =>
    useData.getState().setData(parserObjects.updater(useData.getState().data, update)),
  undo: () => {},
  redo: () => {},
  undoStack: [],
  redoStack: [],
}))
