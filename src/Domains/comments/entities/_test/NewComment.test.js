const NewComment = require('../NewComment');

describe('NewComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah komentar',
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrow('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 123, // owner should be a string, not a number
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrow('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});