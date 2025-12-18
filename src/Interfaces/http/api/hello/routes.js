const routes = [
  {
    method: 'GET',
    path: '/hello',
    handler: (request, h) => {
      const { name } = request.query;
      return {
        status: 'success',
        message: `Hello, ${name || 'stranger'}`
      };
    },
  },
];

module.exports = routes;