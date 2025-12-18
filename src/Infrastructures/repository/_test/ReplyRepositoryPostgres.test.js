const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      const newReply = new NewReply({
        content: "sebuah balasan",
        commentId: "comment-123",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply({
        ...newReply,
        commentId: "comment-123",
        owner: "user-123",
      });

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: "sebuah balasan",
          owner: "user-123",
        })
      );
    });
  });

  describe("verifyReplyOwnership function", () => {
    it("should throw NotFoundError when reply does not exist", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwnership("reply-999", "user-123")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when user is not the owner", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwnership("reply-123", "user-999")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw AuthorizationError when user is the owner", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwnership("reply-123", "user-123")
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe("deleteReply function", () => {
    it("should soft delete the reply from database", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: "reply-123" });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply("reply-123");
      const deletedReply = await RepliesTableTestHelper.findReplyById(
        "reply-123"
      );

      // Assert
      expect(deletedReply[0].is_delete).toStrictEqual(true);
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies for a given comment ID correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      const user1 = { id: "user-123", username: "dicoding" };
      const user2 = { id: "user-456", username: "johndoe" };

      const date1 = new Date('2025-01-01T10:00:00.000Z');
      const date2 = new Date('2025-01-01T10:00:01.000Z');

      const reply1 = {
        id: "reply-123",
        content: "balasan pertama",
        owner: user1.id,
        commentId,
        date: date1.toISOString(),
      };
      const reply2 = {
        id: "reply-456",
        content: "balasan kedua",
        owner: user2.id,
        commentId,
        date: date2.toISOString(),
      };

      await UsersTableTestHelper.addUser(user2);
      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);
      await RepliesTableTestHelper.deleteReply(reply1.id);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        commentId
      );

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toStrictEqual(reply1.id);
      expect(replies[0].content).toStrictEqual(reply1.content);
      expect(replies[0].username).toStrictEqual(user1.username);
      expect(replies[0].is_delete).toStrictEqual(true);
      expect(new Date(replies[0].date).toISOString()).toStrictEqual(date1.toISOString()); 

      expect(replies[1].id).toStrictEqual(reply2.id);
      expect(replies[1].content).toStrictEqual(reply2.content);
      expect(replies[1].username).toStrictEqual(user2.username);
      expect(replies[1].is_delete).toStrictEqual(false);
      expect(new Date(replies[1].date).toISOString()).toStrictEqual(date2.toISOString()); 
    });
  });
});
