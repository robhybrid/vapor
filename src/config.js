const apiRoot = new URL(window.location);
apiRoot.port = 3001;


const config = {
  apiRoot: apiRoot.origin + '/'
};

export default config;