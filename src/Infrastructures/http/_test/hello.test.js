const createServer = require('../../..//Infrastructures/http/createServer');
const container = require('../../../Infrastructures/container');

describe('GET /hello endpoint', () => {
  it('should respond with 200 and "Hello, stranger" when no name is provided', async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.message).toEqual('Hello, stranger');
  });
  
  it('should respond with 200 and "Hello, ${name}" when name is provided', async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: 'GET',
      url: '/hello?name=zXenon',
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.message).toEqual('Hello, zXenon');
  });
});