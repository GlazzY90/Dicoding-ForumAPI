const CommentDetail = require('../CommentDetail');

describe('CommentDetail', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'sebuah komentar',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'dicoding',
      date: true,
      content: {},
      replies: 'sebuah array',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrow('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'sebuah komentar',
      replies: [],
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
  });
});