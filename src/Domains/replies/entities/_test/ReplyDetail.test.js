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
    const now = new Date();
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: now,
      content: 'sebuah balasan',
      is_delete: false,
    };

    // Action
    const { id, username, date, content } = new ReplyDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(now.toISOString());
    expect(content).toEqual(payload.content);
  });

  it('should create deleted ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'sebuah balasan',
      is_delete: true, // Deleted status
    };

    // Action
    const { content } = new ReplyDetail(payload);

    // Assert
    expect(content).toEqual('**balasan telah dihapus**');
  });
});