const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    };
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    }));
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment({
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    }));
  });
});