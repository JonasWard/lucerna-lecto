import { V3 } from './helpers/v3';
import { VertexData } from './helpers/vertexData';

const STL_NUMBER_PRECISION = 4;
export const exportSTL = (vertexData: VertexData, fileName = 'chocolade-chaud') => {
  // get an index and face list fron the object, geometry is just fine, all faces are triangles

  const vertexStrings: string[] = [];

  for (let i = 0; i < vertexData.indices.length; i += 3) {
    const f = vertexData.indices.slice(i, i + 3);
    if (f.length === 3) {
      const v0 = V3.fromNumbers(vertexData.positions[f[0] * 3], vertexData.positions[f[0] * 3 + 1], vertexData.positions[f[0] * 3 + 2]);
      const v1 = V3.fromNumbers(vertexData.positions[f[1] * 3], vertexData.positions[f[1] * 3 + 1], vertexData.positions[f[1] * 3 + 2]);
      const v2 = V3.fromNumbers(vertexData.positions[f[2] * 3], vertexData.positions[f[2] * 3 + 1], vertexData.positions[f[2] * 3 + 2]);

      const normal = V3.getUnit(V3.cross(V3.sub(v1, v0), V3.sub(v2, v0)));

      const n = [normal.x, normal.y, normal.z].map((n) => (n < 0.0001 ? '0.000' : n.toPrecision(STL_NUMBER_PRECISION)));

      vertexStrings.push(
        `facet normal ${n[0]} ${n[1]} ${n[2]}
outer loop
vertex ${v0.x.toPrecision(STL_NUMBER_PRECISION)} ${v0.y.toPrecision(STL_NUMBER_PRECISION)} ${v0.z.toPrecision(STL_NUMBER_PRECISION)}
vertex ${v1.x.toPrecision(STL_NUMBER_PRECISION)} ${v1.y.toPrecision(STL_NUMBER_PRECISION)} ${v1.z.toPrecision(STL_NUMBER_PRECISION)}
vertex ${v2.x.toPrecision(STL_NUMBER_PRECISION)} ${v2.y.toPrecision(STL_NUMBER_PRECISION)} ${v2.z.toPrecision(STL_NUMBER_PRECISION)}
endloop
endfacet`
      );
    }
  }

  const element = document.createElement('a');

  const stlContent = `solid Exported by JonasWard with chocolate-chaud
${vertexStrings.join('\n')}
endsolid Exported by JonasWard with chocolate-chaud`;

  const file = new Blob([stlContent], {
    type: 'text/plain',
  });
  element.href = URL.createObjectURL(file);
  element.download = `${fileName}.stl`;
  document.body.appendChild(element);
  element.click();
};
