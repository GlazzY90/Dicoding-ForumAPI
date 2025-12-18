const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class ReplyRepositoryPostgres {
  constructor(pool, idGenerator) {
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies (id, content, comment_id, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, commentId, owner, date],
    };
    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyOwnership(replyId, owner) {
    const query = {
      text: "SELECT owner FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    const reply = result.rows[0];
    if (reply.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak menghapus balasan ini");
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: "UPDATE replies SET is_delete = true WHERE id = $1",
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, u.username, r.date, r.content, r.is_delete
             FROM replies r
             INNER JOIN users u ON r.owner = u.id
             WHERE r.comment_id = $1
             ORDER BY r.date ASC`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
