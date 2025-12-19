class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, content, is_delete, replies } = payload;
    this.id = id;
    this.username = username;
    this.date = date instanceof Date ? date.toISOString() : date;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.replies = replies || [];
  }

  _verifyPayload({ id, username, date, content }) {
    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const isDateValid = typeof date === 'string' || date instanceof Date;

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      !isDateValid ||
      typeof content !== 'string'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
