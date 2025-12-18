const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
        verifyThreadAvailability: jest.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
        verifyCommentAvailability: jest.fn().mockResolvedValue(),
        verifyCommentOwnership: jest.fn().mockResolvedValue(),
        deleteComment: jest.fn().mockResolvedValue(),
    };

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwnership).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.commentId);
  });
});