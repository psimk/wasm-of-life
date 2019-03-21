import { createStore } from './store';

interface IStats {
  generation?: number;
  collisions?: number;
  step?: number;
}

export default (() => {
  let stats = createStore<IStats>();

  return {
    stats,
  };
})();
