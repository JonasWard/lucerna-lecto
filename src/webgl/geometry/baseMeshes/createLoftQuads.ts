export const createLoftQuads = (startIndex: number, vertexCount: number, fs: number[][] = []): number[][] => {
  for (let i = 0; i < vertexCount; i++)
    fs.push([startIndex + i, startIndex + ((i + 1) % vertexCount), startIndex + ((i + 1) % vertexCount) + vertexCount, startIndex + i + vertexCount]);
  return fs;
};
