interface ICoordinates {
  x: number;
  y: number;
}

interface IListeners {
  onScroll?: (isDown: boolean, x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
}

export default (() => {
  let previousCoords: ICoordinates = { x: 0, y: 0 };
  let isMouseDown: boolean = false;

  let listeners: IListeners = {};

  const onDown = ({ clientX: x, clientY: y }: MouseEvent) => {
    previousCoords = { x, y };
    isMouseDown = true;
  };

  const onUp = () => {
    previousCoords = { x: 0, y: 0 };
    isMouseDown = false;
  };

  const onMove = ({ clientX, clientY }: MouseEvent) => {
    if (!isMouseDown) return;

    const { x, y } = previousCoords;

    const deltaX = Math.round(clientX - x);
    const deltaY = Math.round(clientY - y);

    if (listeners.onMove) listeners.onMove(deltaX, deltaY);

    previousCoords = { x: x + deltaX, y: y + deltaY };
  };

  // @ts-ignore
  const onScroll = ({ wheelDelta, detail, clientX: x, clientY: y }: WheelEvent) => {
    const isDown = (wheelDelta || -detail) < 0;
    if (listeners.onScroll) listeners.onScroll(isDown, x, y);
  };

  window.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mousemove', onMove);
  // @ts-ignore
  window.addEventListener('mousewheel', onScroll);

  const dispose = () => {
    window.removeEventListener('mousedown', onDown);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('mousemove', onMove);
    // @ts-ignore
    window.removeEventListener('mousewheel', onScroll);
  };

  const set = (config: IListeners) => {
    Object.keys(config).forEach(key => {
      // @ts-ignore
      listeners[key] = config[key];
    });
  };

  return {
    set,
    dispose,
  };
})();
