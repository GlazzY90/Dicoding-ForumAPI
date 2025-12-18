const routes = [
  {
    method: 'GET',
    path: '/info',
    handler: () => ({
      status: 'success',
      message: 'Forum API is running. Ready for deployment',
    }),
  },
];

module.exports = routes;