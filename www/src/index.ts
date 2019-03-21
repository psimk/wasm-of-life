import dom, { IDS } from './dom';
import Universe from './modules/Universe';
import { cache } from './modules/Node';
import { readPattern, parseFilename, rgbToInt32 } from './util';
import Drawer from './modules/Drawer';
import globals from './modules/globals';

const drawer = new Drawer(
  { height: document.body.clientHeight, width: document.body.clientWidth },
  { alive: rgbToInt32(252, 207, 14), dead: rgbToInt32(40, 42, 43) },
  1,
);

// @ts-ignore
const patternContexts = require.context('./assets/patterns', false, /\.(txt)$/);

const patterns = patternContexts.keys().map((patternFile: string) => ({
  label: parseFilename(patternFile, 'txt'),
  value: patternContexts(patternFile),
}));

patterns.forEach(dom.addToPatternSelector);

dom.listenToInput(IDS.STEP_INPUT, ({ target }) => {
  if (!target) return;
  globals.stats.set({
    // @ts-ignore
    step: Number(target.value),
  });
  console.log(globals.stats.get());
});

(() => {
  dom.setupButton(IDS.RESET_BUTTON, () => {
    if (dom.frame.isRunning()) dom.frame.stop();
    else dom.frame.tick();
  });

  dom.setupButton(IDS.TOGGLE_BUTTON, () => {
    dom.frame.stop();

    const pattern = dom.getSelectorValue(IDS.PATTERN_SELECTOR);
    if (!pattern) throw `Select a pattern first`;

    const universe = new Universe();

    readPattern(pattern, (x, y) => universe.setCell(x, y));

    const tick = () => {
      universe.step();
      drawer.draw(universe.rootNode);

      globals.stats.set({
        generation: universe.generation,
        collisions: cache.data().collisionCount,
      });

      dom.setStats();

      dom.frame.tick();
    };

    dom.frame.tick(tick);
  });
})();
