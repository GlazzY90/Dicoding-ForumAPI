const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-123",
    content = "sebuah balasan",
    owner = "user-123",
    commentId = "comment-123",
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO replies(id, content, owner, comment_id, date) VALUES($1, $2, $3, $4, $5)",
      values: [id, content, owner, commentId, date],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies WHERE 1=1");
  },

  async deleteReply(id) {
    const query = {
      text: "UPDATE replies SET is_delete = TRUE WHERE id = $1 RETURNING id",
      values: [id],
    };
    await pool.query(query);
  },
};

module.exports = RepliesTableTestHelper;
