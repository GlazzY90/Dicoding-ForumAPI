const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
  async addComment({
    id = "comment-123",
    content = "sebuah komentar",
    owner = "user-123",
    threadId = "thread-123",
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO comments(id, thread_id, owner, content, date) VALUES($1, $2, $3, $4, $5)",
      values: [id, threadId, owner, content, date],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async softDeleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1",
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;
