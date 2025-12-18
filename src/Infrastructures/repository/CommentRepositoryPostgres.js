const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments (id, content, thread_id, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, threadId, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async verifyCommentOwnership(commentId, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak menghapus komentar ini");
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar gagal dihapus. Id tidak ditemukan");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.date, c.content, c.is_delete
             FROM comments c
             INNER JOIN users u ON c.owner = u.id
             WHERE c.thread_id = $1
             ORDER BY c.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;