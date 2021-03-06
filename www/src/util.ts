export const readPattern = (pattern: string, setCell: (x: number, y: number) => void) => {
  let x = 0;
  let y = 0;
  let parameterArgument = 0;

  let integerPattern = [];

  for (let i = 0; i < pattern.length; i += 1) {
    integerPattern.push(pattern.charCodeAt(i));
  }

  for (const char of integerPattern) {
    let param = parameterArgument === 0 ? 1 : parameterArgument;

    if (char === NaN) throw `Illegal character ${char}`;

    if (char === 10) continue;

    if (char === 98) {
      x += param;
      parameterArgument = 0;
      continue;
    }

    if (char === 36) {
      y += param;
      x = 0;
      parameterArgument = 0;
      continue;
    }

    if (char === 111) {
      while (param-- > 0) {
        x += 1;
        setCell(x, y);
      }
      parameterArgument = 0;
      continue;
    }

    if (char === 33) break;

    const num = Number(String.fromCharCode(char));

    if (0 <= num && num <= 9) {
      parameterArgument = 10 * parameterArgument + num;
      continue;
    }
  }
};

export const parseFilename = (fileName: string, fileEnding: string): string => {
  const rawFilename = fileName.substring(2, fileName.indexOf(`.${fileEnding}`));

  return rawFilename
    .split('_')
    .map(value => value.replace(value.charAt(0), value.charAt(0).toUpperCase()))
    .join(' ');
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

export const rgbToInt32 = (r: number, g: number, b: number) =>
  r > 255 ? 255 : r | (g > 255 ? 255 : g << 8) | (b > 255 ? 255 : b << 16) | (0xff << 24);
