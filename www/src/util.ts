export const readPattern = (pattern: string, setCell: (x: number, y: number) => void) => {
  let [ coordinateString, realPattern ] = pattern.split('\n');

  let offsetCoords = { x: 0, y: 0 };

  if (coordinateString.startsWith('D')) {
    const [ coordinateX, coordinateY ] = coordinateString
      .substring(2, coordinateString.length)
      .split(', ');

    offsetCoords = {
      x: Number(coordinateX.substring(4, coordinateX.length)),
      y: Number(coordinateY.substring(4, coordinateY.length)),
    };
  } else realPattern = pattern;

  let x = 0;
  let y = 0;
  let parameterArgument = 0;

  for (const char of realPattern) {
    let param = parameterArgument === 0 ? 1 : parameterArgument;

    if (char === 'b') {
      x += param;
      parameterArgument = 0;
      continue;
    }

    if (char === '$') {
      y += param;
      x = 0;
      parameterArgument = 0;
      continue;
    }

    if (char === 'o') {
      while (param-- > 0) {
        x += 1;
        setCell(x + offsetCoords.x, y + offsetCoords.y);
      }
      parameterArgument = 0;
      continue;
    }

    const num = Number(char);

    if (0 <= num && num <= 9) {
      parameterArgument = 10 * parameterArgument + num;
      continue;
    }

    if (char === '!') break;

    throw `Illegal character ${char}`;
  }
};

export const parseFilename = (fileName: string, fileEnding: string): string => {
  const rawFilename = fileName.substring(2, fileName.indexOf(`.${fileEnding}`));

  return rawFilename
    .split('_')
    .map(value => value.replace(value.charAt(0), value.charAt(0).toUpperCase()))
    .join(' ');
};

export const hashCode = (value: string) => {
  if (value.length === 0) return 0;

  let hash = 0;
  for (const char of value) {
    hash = (hash << 5) - hash + Number(char);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const power = (() => {
  const MAX_SIZE = 1024;
  const POWER_OF = 2;

  const powers: Float64Array = new Float64Array(MAX_SIZE);
  powers[0] = 1;

  for (let i = 1; i < MAX_SIZE; i++) {
    powers[i] = powers[i - 1] * POWER_OF;
  }

  return (x: number) => {
    if (x >= MAX_SIZE) return Infinity;

    return powers[x];
  };
})();
