const CommentDetail = require('../CommentDetail');

describe('CommentDetail', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123, // Salah tipe data (number)
      username: 'dicoding',
      content: 'sebuah komentar',
      date: '2021-08-08T07:22:33.555Z',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const now = new Date()
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'sebuah komentar',
      date: now,
      is_delete: false, // karena hanya ada 1 comment, pastikan is_delete false
    };

    // Action
    const { id, username, content, date } = new CommentDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(now.toISOString());
  });

  it('should create deleted commentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'sebuah komentar',
      date: '2021-08-08T07:22:33.555Z',
      is_delete: true, // Deleted status
    };

    // Action
    const { content } = new CommentDetail(payload);

    // Assert
    expect(content).toEqual('**komentar telah dihapus**');
  });
});