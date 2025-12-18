const routes = require('./routes');

module.exports = {
  name: 'info',
  register: async (server) => {
    server.route(routes);
  },
};