import { createStore } from './store';

interface IDimensions {
  height: number;
  width: number;
}

interface IColors {
  alive: string;
  dead: string;
}

interface IConfig {
  dimensions?: IDimensions;
  colors?: IColors;
  cellSize?: number;
  useCache?: boolean;
}

interface IStats {
  generation?: number;
  fps?: number;
}

export default (() => {
  let config = createStore<IConfig>();
  let stats = createStore<IStats>();

  return {
    config,
    stats,
  };
})();
