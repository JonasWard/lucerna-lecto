import React, { useEffect, useRef } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry } from 'url-safe-bitpacking';
import { useData } from './state';
import { ThreeCanvas } from './webgl/ThreeCanvas';
import { useParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { LiaFileDownloadSolid } from 'react-icons/lia';
import { useDebounce } from 'use-debounce';
import { Version0Type } from './modelDefinition/types/version0.generatedType';
import { version0EnumSemantics } from './modelDefinition/types/version0.enumsemantics';
import { exportSTL } from './webgl/geometry/exportstl';
import { exportOBJ } from './webgl/geometry/exportObj';
import { getVertexData } from './webgl/geometry/factory';
import { GiLaserBlast } from 'react-icons/gi';
import { SiCncf } from 'react-icons/si';

const defaultState = 'BOIJxBOIJxBOIJxBwhOIGNxRTpHUAMADfCAAHLaGDCKY';

const isIOS = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

export const App: React.FC = () => {
  const { stateString } = useParams();
  const [renderData] = useDebounce(useData.getState().data, isIOS() ? 50 : 0);
  const data = useData((s) => s.data);
  const updateEntry = useData((s) => s.updateDataEntry);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/lucerna-lecto/#${parserObjects.stringify(renderData)}`);
  }, [renderData]);

  useEffect(() => {
    useData.setState({
      updateDataEntry: (update: DataEntry | DataEntry[]): void => useData.getState().setData(parserObjects.updater(useData.getState().data, update)),
    });

    if (stateString) {
      try {
        useData.getState().setData(parserObjects.parser(stateString));
      } catch (e) {
        try {
          useData.getState().setData(parserObjects.parser(defaultState));
          message.warning('the state string you tried to use was not valid, using the default state instead');
        } catch (e) {
          useData.getState().setData(parserObjects.parser());
          message.error('the default!! state string was not valid, using the default object state instead');
        }
      }
    } else {
      try {
        useData.getState().setData(parserObjects.parser(defaultState));
      } catch (e) {
        useData.getState().setData(parserObjects.parser());
        message.error('the default!! state string was not valid, using the default object state instead');
      }
    }
  }, []);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `lucerna-lecto.${parserObjects.stringify(data)}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const downloadSTL = () => exportSTL(getVertexData(renderData as any as Version0Type), `lucerna-lecto.${parserObjects.stringify(data)}`);
  const downloadOBJ = () => exportOBJ(getVertexData(renderData as any as Version0Type), `lucerna-lecto.${parserObjects.stringify(data)}`);

  return (
    <>
      <ThreeCanvas renderData={renderData as any as Version0Type} canvasRef={canvasRef} />
      <ParametricInput data={data} updateEntry={updateEntry} versionEnumSemantics={version0EnumSemantics} />
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
  );
};
