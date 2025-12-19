const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager'); // <--- IMPORT PENTING
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  async function getAccessTokenHelper(userId = 'user-123') {
    return container.getInstance(AuthenticationTokenManager.name).createAccessToken({ id: userId });
  }

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await getAccessTokenHelper('user-123');

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: { content: 'sebuah balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when payload property is missing', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await getAccessTokenHelper('user-123');
      
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {}, 
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await getAccessTokenHelper('user-123');
      
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-999/replies', 
        payload: { content: 'reply' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and return success status', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await getAccessTokenHelper('user-123');

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when delete reply owned by other user', async () => {
      // Arrange
      const server = await createServer(container);
      
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'owner' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'intruder' });
      const accessTokenUserB = await getAccessTokenHelper('user-456');

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${accessTokenUserB}` },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 404 when reply not found', async () => {
       // Arrange
       const server = await createServer(container);
       const accessToken = await getAccessTokenHelper('user-123');
       
       await UsersTableTestHelper.addUser({ id: 'user-123' });
       await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
       await CommentsTableTestHelper.addComment({ id: 'comment-123' });

       // Action
       const response = await server.inject({
         method: 'DELETE',
         url: '/threads/thread-123/comments/comment-123/replies/reply-999',
         headers: { Authorization: `Bearer ${accessToken}` },
       });
 
       // Assert
       expect(response.statusCode).toEqual(404);
    });
  });
});