import globals from './modules/globals';

export const enum IDS {
  TOGGLE_BUTTON = 'toggle',
  RESET_BUTTON = 'resetButton',
  PATTERN_SELECTOR = 'pattern-selector',
  LIFE_SELECTOR = 'life-selector',
  STATS = 'stats',
}

const setSpan = (id: IDS, value: any) =>
  ((document.getElementById(id) as HTMLSpanElement).innerText = String(value));

const setupButton = (id: IDS, setupMethod: () => void) => {
  const button = document.getElementById(id);
  if (!button) throw `Button with id ${id} is not defined in the dom`;

  button.addEventListener('click', setupMethod);
};

const addToSelector = (id: IDS, { label, value }: { label: string; value: string }) => {
  const selector = document.getElementById(id);
  if (!selector) throw `Selector with id ${id} is not defined in the dom`;
  const option = document.createElement('option') as HTMLOptionElement;

  option.value = value;
  option.innerText = label;

  selector.appendChild(option);
};

const addToPatternSelector = (option: { label: string; value: string }) =>
  addToSelector(IDS.PATTERN_SELECTOR, option);

const addToLifeSelector = (option: { label: string; value: string }) =>
  addToSelector(IDS.LIFE_SELECTOR, option);

const getSelectorValue = (id: IDS): string =>
  (document.getElementById(id) as HTMLSelectElement).value;

const setStats = () => setSpan(IDS.STATS, JSON.stringify(globals.stats.get(), null, 2));

const frame = (() => {
  let id: number | undefined;
  let startCallback: FrameRequestCallback;
  let isRunning: boolean = false;

  const tick = (callback?: FrameRequestCallback) => {
    if (callback) startCallback = callback;
    if (startCallback) id = requestAnimationFrame(startCallback);
    if (!isRunning) isRunning = true;
  };

  const stop = () => {
    if (id === undefined) return;
    cancelAnimationFrame(id);
    id = undefined;
    if (isRunning) isRunning = false;
  };

  return {
    tick,
    stop,
    isRunning: () => isRunning,
  };
})();

export default {
  setupButton,
  addToLifeSelector,
  addToPatternSelector,
  getSelectorValue,
  setStats,
  frame,
};
