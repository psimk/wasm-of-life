export const createStore = <T>() => {
  // @ts-ignore
  const store: T = {};

  const set = (config: T) => {
    Object.keys(config).forEach(key => {
      // @ts-ignore
      store[key] = config[key];
    });
  };

  const get = () => store;

  return {
    set,
    get,
  };
};
