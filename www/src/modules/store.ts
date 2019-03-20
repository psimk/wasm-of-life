export const createStore = <T>() => {
  // @ts-ignore
  const store: T = {};

  const set = (newStore: T) => {
    Object.keys(newStore).forEach(key => {
      // @ts-ignore
      store[key] = newStore[key];
    });
  };

  const get = () => store;

  return {
    set,
    get,
  };
};
