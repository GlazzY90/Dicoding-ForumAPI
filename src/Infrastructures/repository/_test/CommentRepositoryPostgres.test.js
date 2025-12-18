const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment is not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-999'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when comment is available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwnership function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-999', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the actual owner of the comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwnership('comment-123', 'user-999'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner is the actual owner of the comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwnership('comment-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete the comment from database', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should throw NotFoundError when comment id is not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-999'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments from a thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const user1 = { id: 'user-123', username: 'dicoding' };
      const user2 = { id: 'user-456', username: 'johndoe' };
      const date1 = new Date('2025-01-01T10:00:00.000Z').toISOString();
      const date2 = new Date('2025-01-01T10:00:01.000Z').toISOString();
      const comment1 = { id: 'comment-123', content: 'sebuah komentar A', owner: user1.id, threadId, date: date1 };
      const comment2 = { id: 'comment-456', content: 'sebuah komentar B', owner: user2.id, threadId, date: date2 };

      await UsersTableTestHelper.addUser(user2);
      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);
      await CommentsTableTestHelper.softDeleteComment(comment1.id);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(comment1.id);
      expect(comments[0].content).toEqual(comment1.content);
      expect(comments[0].username).toEqual(user1.username);
      expect(comments[0].is_delete).toEqual(true);
      expect(comments[0]).toHaveProperty('date')
      expect(comments[0]).toHaveProperty('username')

      expect(comments[1].id).toEqual(comment2.id);
      expect(comments[1].content).toEqual(comment2.content);
      expect(comments[1].username).toEqual(user2.username);
      expect(comments[1].is_delete).toEqual(false);
      expect(comments[1]).toHaveProperty('date')
      expect(comments[0]).toHaveProperty('username')
    });
  });
});