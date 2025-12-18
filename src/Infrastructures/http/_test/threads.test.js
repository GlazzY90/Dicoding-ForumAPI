const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const PasswordHash = require('../../../Applications/security/PasswordHash');
const ThreadsHandler = require('../../../Interfaces/http/api/threads/handler');
const DeleteCommentUseCase = require('../../../Applications/use_case/DeleteCommentUseCase');
const GetThreadDetailUseCase = require('../../../Applications/use_case/GetThreadDetailUseCase');
const AddReplyUseCase = require('../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../Applications/use_case/DeleteReplyUseCase');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond with 201 and the added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const server = await createServer(container);

      const passwordHash = container.getInstance(PasswordHash.name);
      const hashedPassword = await passwordHash.hash('secret');
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: hashedPassword,
      });

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      expect(authResponse.statusCode).toEqual(201);
      const { accessToken } = JSON.parse(authResponse.payload).data;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should respond with 400 when payload is missing properties', async () => {
      // Arrange
      const server = await createServer(container);
      const passwordHash = container.getInstance(PasswordHash.name);
      const hashedPassword = await passwordHash.hash('secret');
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: hashedPassword,
      });

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { accessToken } = JSON.parse(authResponse.payload).data;
      
      const invalidPayload = {
        title: 'sebuah thread'
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond with 201 and the added comment', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { content: 'sebuah komentar' };

      const passwordHash = container.getInstance(PasswordHash.name);
      const hashedPassword = await passwordHash.hash('secret');
      await UsersTableTestHelper.addUser({ id: 'user-123', password: hashedPassword });

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse((await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: { username: 'dicoding', password: 'secret' },
          })).payload).data.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;
      const threadId = addedThread.id;

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { accessToken } = JSON.parse(authResponse.payload).data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond with 400 when payload is missing properties', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidPayload = {};

      const passwordHash = container.getInstance(PasswordHash.name);
      const hashedPassword = await passwordHash.hash('secret');
      await UsersTableTestHelper.addUser({ id: 'user-123', password: hashedPassword });

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse((await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: { username: 'dicoding', password: 'secret' },
          })).payload).data.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;
      const threadId = addedThread.id;
      
      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { accessToken } = JSON.parse(authResponse.payload).data;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('deleteCommentHandler', () => {
    it('should respond with 200 and a success status', async () => {
      // Arrange
      const mockDeleteCommentUseCase = new DeleteCommentUseCase({});
      mockDeleteCommentUseCase.execute = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockContainer = {
        getInstance: () => mockDeleteCommentUseCase,
      };

      const handler = new ThreadsHandler(mockContainer);
      const mockRequest = {
        params: {
          threadId: 'thread-123',
          commentId: 'comment-123',
        },
        auth: {
          credentials: {
            id: 'user-123',
          },
        },
      };

      const mockH = {
        response: jest.fn(() => ({
          code: jest.fn().mockReturnValue({}),
        })),
      };

      // Action
      const response = await handler.deleteCommentHandler(mockRequest, mockH);

      // Assert
      expect(mockDeleteCommentUseCase.execute).toHaveBeenCalledWith({
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      expect(response).toEqual({
        status: 'success',
      });
    });
  });

  describe('getThreadDetailHandler', () => {
    it('should respond with 200 and thread details', async () => {
      // Arrange
      const mockThreadDetails = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2022-01-01T00:00:00.000Z',
        username: 'dicoding',
        comments: [],
      };
      
      const mockGetThreadDetailUseCase = new GetThreadDetailUseCase({});
      
      mockGetThreadDetailUseCase.execute = jest.fn()
        .mockImplementation(() => Promise.resolve(mockThreadDetails));

      const mockContainer = {
        getInstance: () => mockGetThreadDetailUseCase,
      };

      const handler = new ThreadsHandler(mockContainer);
      
      const mockRequest = {
        params: {
          threadId: 'thread-123',
        },
      };
      
      const mockH = {};

      // Action
      const response = await handler.getThreadDetailHandler(mockRequest, mockH);

      // Assert
      expect(mockGetThreadDetailUseCase.execute).toHaveBeenCalledWith({
        threadId: 'thread-123',
      });
      expect(response).toEqual({
        status: 'success',
        data: {
          thread: mockThreadDetails,
        },
      });
    });
  });

  describe('postReplyHandler', () => {
    it('should respond with 201 and the added reply', async () => {
      // Arrange
      const requestPayload = { content: 'sebuah balasan' };
      const addedReply = {
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      };
      const mockAddReplyUseCase = new AddReplyUseCase({});
      mockAddReplyUseCase.execute = jest.fn()
        .mockImplementation(() => Promise.resolve(addedReply));

      const mockContainer = {
        getInstance: () => mockAddReplyUseCase,
      };

      const handler = new ThreadsHandler(mockContainer);

      const mockRequest = {
        payload: requestPayload,
        params: {
          threadId: 'thread-123',
          commentId: 'comment-123',
        },
        auth: {
          credentials: {
            id: 'user-123',
          },
        },
      };

      const mockResponse = {
        code: jest.fn(),
      };

      const mockH = {
        response: jest.fn(() => mockResponse),
      };

      // Action
      await handler.postReplyHandler(mockRequest, mockH);

      // Assert
      expect(mockAddReplyUseCase.execute).toHaveBeenCalledWith({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      });
      expect(mockH.response).toHaveBeenCalledWith({
        status: 'success',
        data: {
          addedReply,
        },
      });
      expect(mockResponse.code).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteReplyHandler', () => {
    it('should respond with 200 and a success status', async () => {
      // Arrange
      const mockDeleteReplyUseCase = new DeleteReplyUseCase({});
      mockDeleteReplyUseCase.execute = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockContainer = {
        getInstance: () => mockDeleteReplyUseCase,
      };

      const handler = new ThreadsHandler(mockContainer);
      const mockRequest = {
        params: {
          threadId: 'thread-123',
          commentId: 'comment-123',
          replyId: 'reply-123',
        },
        auth: {
          credentials: {
            id: 'user-123',
          },
        },
      };

      const mockH = {
        response: jest.fn(() => ({
          code: jest.fn().mockReturnValue({}),
        })),
      };

      // Action
      const response = await handler.deleteReplyHandler(mockRequest, mockH);

      // Assert
      expect(mockDeleteReplyUseCase.execute).toHaveBeenCalledWith({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'user-123',
      });
      expect(response).toEqual({
        status: 'success',
      });
    });
  });
});