import React, { ReactNode } from 'react';
import { CiLineHeight } from 'react-icons/ci';
import { FaRegSquare, FaSquareFull, FaKey, FaArchway, FaCog, FaRegCircle, FaVectorSquare } from 'react-icons/fa';
import { FaRegSquareFull } from 'react-icons/fa6';
import { PiCubeFocusFill, PiCylinderThin, PiPackage, PiRainbowLight, PiStackPlusFill, PiWaveSine } from 'react-icons/pi';
import { GiArabicDoor, GiBridge, GiFootprint, GiPoolTriangle, GiWireframeGlobe } from 'react-icons/gi';
import { MdOutlineLayers, MdGrid4X4, MdOutlineFitScreen } from 'react-icons/md';
import { FiLayers } from 'react-icons/fi';
import { DataType } from 'url-safe-bitpacking';
import { AttributeNames } from 'src/modelDefinition/enums/attributeNames';
import { VersionNames } from 'src/modelDefinition/enums/versionNames';
import { MethodNames } from 'src/modelDefinition/types/methodSemantics';
import { AiOutlineBgColors } from 'react-icons/ai';
import { HiOutlineColorSwatch } from 'react-icons/hi';
import { BsFillGrid3X3GapFill, BsLamp } from 'react-icons/bs';
import { TbArrowCurveLeft, TbCylinder, TbHexagonalPrism, TbHexagons, TbSum } from 'react-icons/tb';
import { GrPaint } from 'react-icons/gr';
import { VscDatabase } from 'react-icons/vsc';

import imagegyroid from 'src/assets/icons/gyroid.png';
import imagemandelbrot from 'src/assets/icons/mandelbrot.png';
import imageneovius from 'src/assets/icons/neovius.png';
import imageperlin from 'src/assets/icons/perlin.png';
import imageschwarzD from 'src/assets/icons/schwarzD.png';
import imageschwarzP from 'src/assets/icons/schwarzP.png';
import imageSine from 'src/assets/icons/sine.png';
import imageCosine from 'src/assets/icons/cosine.png';
import imageNone from 'src/assets/icons/none.png';
import imageAlternateTiling from 'src/assets/icons/modAlternateTiling.png';
import imageeComplexTiling from 'src/assets/icons/modeComplexTiling.png';
import imageTiling from 'src/assets/icons/modTiling.png';
import { IoCubeOutline } from 'react-icons/io5';

export interface IconRendererProps {
  name: string;
  type?: DataType;
  noName?: boolean;
  size?: number;
}

export const getIconForKey = (
  name: string,
  type?: DataType,
  size?: number
): {
  mainIcon: ReactNode;
  subscript?: string;
  superscript?: string;
} => {
  if (type !== undefined)
    switch (name) {
      default:
        switch (type) {
          case DataType.INT:
            return { mainIcon: 'i', subscript: name };
          case DataType.FLOAT:
            return { mainIcon: 'f', subscript: name };
          case DataType.BOOLEAN:
            return { mainIcon: 'b', subscript: name };
          case DataType.VERSION:
            return { mainIcon: 'v', subscript: name };
        }
    }
  switch (name) {
    case AttributeNames.Viewport:
      return { mainIcon: <MdOutlineFitScreen size={size} /> };
    case AttributeNames.CanvasFullScreen:
      return { mainIcon: <GiFootprint size={size} /> };
    case AttributeNames.CanvasWidth:
      return { mainIcon: <CiLineHeight size={size} /> };
    case AttributeNames.CanvasHeight:
      return { mainIcon: <FaRegSquareFull size={size} /> };
    case AttributeNames.Version:
    case AttributeNames.Viewport:
    case AttributeNames.Canvas:
    case AttributeNames.CanvasFullScreen:
    case AttributeNames.CanvasWidth:
    case AttributeNames.CanvasHeight:
    case AttributeNames.Rotation:
    case AttributeNames.ZoomLevel:
    case AttributeNames.MousePosition:
    case AttributeNames.PositionX:
    case AttributeNames.PositionY:
    case AttributeNames.Methods:
    case AttributeNames.PreProcessingMethods:
      return { mainIcon: <MdGrid4X4 size={size} /> };
    case AttributeNames.PostProcessingMethods:
      return { mainIcon: <PiPackage size={size} /> };
    case AttributeNames.MainMethods:
      return { mainIcon: <FaKey size={size} /> };
    case AttributeNames.MethodEnumMain:
    case AttributeNames.MethodScale:
    case AttributeNames.Shmuck:
      return { mainIcon: <AiOutlineBgColors size={size} /> };
    case AttributeNames.ColorCount:
      return { mainIcon: <HiOutlineColorSwatch size={size} /> };
    case 'shapePreProcessing':
    case 'shapePostProcessing':
      return { mainIcon: <PiCubeFocusFill size={size} /> };
    case 'Massive':
      return { mainIcon: <FaSquareFull size={size} /> };
    case '1 Layer':
      return { mainIcon: <FaRegSquare size={size} /> };
    case '2 Layers':
      return { mainIcon: <MdOutlineLayers size={size} /> };
    case '3 Layers':
      return { mainIcon: <FiLayers size={size} /> };
    case VersionNames.Alpha:
      return { mainIcon: 'α' };
    case 'beta':
      return { mainIcon: 'β' };
    case 'gamma':
      return { mainIcon: 'γ' };
    case 'delta':
      return { mainIcon: 'δ' };
    case MethodNames.Gyroid:
      return { mainIcon: <img src={imagegyroid} width={size} /> };
    case MethodNames.SchwarzD:
      return { mainIcon: <img src={imageschwarzD} width={size} /> };
    case MethodNames.SchwarzP:
      return { mainIcon: <img src={imageschwarzP} width={size} /> };
    case MethodNames.Perlin:
      return { mainIcon: <img src={imageperlin} width={size} /> };
    case MethodNames.Neovius:
      return { mainIcon: <img src={imageneovius} width={size} /> };
    case MethodNames.Mandelbrot:
      return { mainIcon: <img src={imagemandelbrot} width={size} /> };
    case MethodNames.Complex:
      return { mainIcon: <img src={imageeComplexTiling} width={size} /> };
    case MethodNames.Modulus:
      return { mainIcon: <img src={imageTiling} width={size} /> };
    case MethodNames.AlternatingMoldus:
      return { mainIcon: <img src={imageAlternateTiling} width={size} /> };
    case MethodNames.Sin:
      return { mainIcon: <img src={imageSine} width={size} /> };
    case MethodNames.Cos:
      return { mainIcon: <img src={imageCosine} width={size} /> };
    case MethodNames.None:
      return { mainIcon: <img src={imageNone} width={size} /> };
    case AttributeNames.Extrusion:
      return { mainIcon: <FaArchway size={size} /> };
    case AttributeNames.Footprint:
      return { mainIcon: <GiFootprint size={size} /> };
    case AttributeNames.Heights:
      return { mainIcon: <CiLineHeight size={size} /> };
    case 'Square Extrusion':
      return { mainIcon: <FaRegSquareFull size={size} /> };
    case 'Arc Extrusion':
      return { mainIcon: <PiRainbowLight size={size} /> };
    case 'Ellipse Extrusion':
      return { mainIcon: <FaRegCircle size={size} /> };
    case 'Gothic Arc Extrusion':
      return { mainIcon: <GiBridge size={size} /> };
    case 'Nested Arc Extrusion':
      return { mainIcon: <GiArabicDoor size={size} /> };
    case 'Square Footprint':
      return { mainIcon: <FaVectorSquare size={size} /> };
    case 'Square Grid Footprint':
      return { mainIcon: <BsFillGrid3X3GapFill size={size} /> };
    case 'Triangle Grid Footprint':
      return { mainIcon: <GiPoolTriangle size={size} /> };
    case 'Hex Grid Footprint':
      return { mainIcon: <TbHexagons size={size} /> };
    case 'Cylinder Footprint':
      return { mainIcon: <TbCylinder size={size} /> };
    case 'Malculmius One Footprint':
      return { mainIcon: <TbHexagonalPrism size={size} /> };
    case 'Incremental Method':
      return { mainIcon: <TbSum size={size} /> };
    case 'Sin Method':
      return { mainIcon: <PiWaveSine size={size} /> };
    case 'None Method':
      return { mainIcon: <PiStackPlusFill size={size} /> };
    case 'heightProcessingMethod':
      return { mainIcon: <PiStackPlusFill size={size} /> };
    case 'alpha':
      return { mainIcon: 'α' };
    case 'beta':
      return { mainIcon: 'β' };
    case 'gamma':
      return { mainIcon: 'γ' };
    case 'delta':
      return { mainIcon: 'δ' };
    case 'Cube':
      return { mainIcon: <IoCubeOutline size={size} /> };
    case 'Cylinder':
      return { mainIcon: <PiCylinderThin size={size} /> };
    case 'Hanging':
      return { mainIcon: <FaRegCircle size={size} /> };
    case AttributeNames.Settings:
      return { mainIcon: <FaCog size={size} /> };
    case AttributeNames.Material:
      return { mainIcon: <GrPaint size={size} /> };
    case AttributeNames.Base:
      return { mainIcon: <VscDatabase size={size} /> };
    case AttributeNames.Wireframe:
      return { mainIcon: <GiWireframeGlobe size={size} /> };
    case AttributeNames.LampShades:
      return { mainIcon: <BsLamp size={size} /> };
    case AttributeNames.VerticalProfile:
      return { mainIcon: <TbArrowCurveLeft size={size} /> };
    default:
      return { mainIcon: name };
  }
};

export const IconRenderer: React.FC<IconRendererProps> = ({ name, type, noName = false, size = 20 }) => {
  const { mainIcon, subscript, superscript } = getIconForKey(name, type, size);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: size * 1.3 }}>
      <div style={{ fontSize: size, alignItems: 'center' }}>{mainIcon}</div>
      {superscript || subscript ? (
        <div style={{ fontSize: size * 0.5, display: 'flex', flexDirection: 'column' }}>
          {superscript ? <div key='superscript'>{superscript}</div> : <div style={{ height: '50%' }} />}
          {subscript ? <div key='subscript'>{subscript}</div> : <div style={{ height: '50%' }} />}
        </div>
      ) : noName ? null : (
        <span style={{ marginLeft: 10 }}>{name}</span>
      )}
    </div>
  );
};
