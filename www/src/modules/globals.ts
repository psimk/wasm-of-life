import { createStore } from './store';

interface IStats {
  generation?: number;
  fps?: number;
}

export default (() => {
  let stats = createStore<IStats>();

  return {
    stats,
  };
})();
