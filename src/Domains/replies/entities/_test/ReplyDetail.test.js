const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrow('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'dicoding',
      date: true,
      content: {},
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'sebuah balasan',
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
  });
});