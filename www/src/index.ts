import dom, { IDS } from './dom';
import Universe, { cache } from './modules/Universe';
import { readPattern, parseFilename } from './util';
import Drawer from './modules/Drawer';
import globals from './modules/globals';

globals.config.set({
  dimensions: { height: 256, width: 256 },
  colors: { alive: '#FFFFFF', dead: '#000000' },
  cellSize: 2,
});

const LIFE = [ 'JavaScript', 'WASM' ];

const drawer = new Drawer();

// @ts-ignore
const patternContexts = require.context('./assets/patterns', false, /\.(txt)$/);

const patterns = patternContexts.keys().map((patternFile: string) => ({
  label: parseFilename(patternFile, 'txt'),
  value: patternContexts(patternFile),
}));

patterns.forEach(dom.addToPatternSelector);

LIFE.map((life, index) => ({ label: life, value: String(index) })).forEach(dom.addToLifeSelector);

(() => {
  dom.setupButton(IDS.RESET_BUTTON, () => {
    if (dom.frame.isRunning()) dom.frame.stop();
    else dom.frame.tick();
  });

  dom.setupButton(IDS.TOGGLE_BUTTON, () => {
    dom.frame.stop();
    const pattern = dom.getSelectorValue(IDS.PATTERN_SELECTOR);
    const lifeMode = dom.getSelectorValue(IDS.LIFE_SELECTOR);

    if (!pattern) throw `Select a pattern first`;
    if (!lifeMode) throw `Select a life mode first`;

    const universe = new Universe();

    readPattern(pattern, (x, y) => universe.setCell(x, y));

    drawer.cellGetter = (x: number, y: number) => universe.getCell(x, y);

    let rafFinishTime = 0;
    const tick = () => {
      globals.stats.set({
        fps: Math.round(1000 / (performance.now() - rafFinishTime)),
        generation: (globals.stats.get().generation || 0) + 1,
      });

      dom.setStats();

      drawer.drawCells();
      rafFinishTime = performance.now();

      universe.step();

      dom.frame.tick();
    };

    dom.frame.tick(tick);
  });
})();
