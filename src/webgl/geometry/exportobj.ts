import { VertexData } from './helpers/vertexData';

const OBJ_PRECISION = 5;

export const exportOBJ = (vertexData: VertexData, fileName = 'lucerna-lecto') => {
  // get an index and face list fron the object, geometry is just fine, all faces are quad

  const positionStrings = [...Array(vertexData.positions.length / 3).keys()]
    .map(
      (i) =>
        `v ${vertexData.positions[i * 3].toFixed(OBJ_PRECISION)} ${vertexData.positions[i * 3 + 1].toFixed(OBJ_PRECISION)} ${vertexData.positions[
          i * 3 + 2
        ].toFixed(OBJ_PRECISION)}`
    )
    .join('\n');

  // const normalStrings = [...Array(mesh.normals.length / 3).keys()]
  //   .map((i) => `vn ${mesh.normals[i * 3]} ${mesh.normals[i * 3 + 1]} ${mesh.normals[i * 3 + 2]}`)
  //   .join('\n');
  const faceStrings = [...Array(vertexData.indices.length / 3).keys()]
    .map(
      (i) =>
        `f ${vertexData.indices[i * 3] + 1}/${vertexData.indices[i * 3] + 1} ${vertexData.indices[i * 3 + 1] + 1}/${vertexData.indices[i * 3 + 1] + 1} ${
          vertexData.indices[i * 3 + 2] + 1
        }/${vertexData.indices[i * 3 + 2] + 1}`
    )
    .join('\n');

  const objContent = [
    positionStrings,
    // textureStrings,
    // normalStrings,
    faceStrings,
  ].join('\n');

  const element = document.createElement('a');
  const file = new Blob([objContent], {
    type: 'text/plain',
  });
  element.href = URL.createObjectURL(file);
  element.download = `${fileName}.obj`;
  document.body.appendChild(element);
  element.click();
};
