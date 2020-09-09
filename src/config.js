const apiRoot = new URL(window.location);

const config = {
  apiRoot: apiRoot.origin + '/'
};

export default config;