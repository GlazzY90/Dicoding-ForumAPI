const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository'); // Used as the base interface
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah komentar',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah komentar',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'sebuah balasan',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        is_delete: false,
      },
      {
        id: 'reply-456',
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    
    mockThreadRepository.getThreadDetailById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(threadDetail).toStrictEqual({
      ...mockThread,
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah komentar',
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: '2021-08-08T07:59:48.766Z',
              username: 'johndoe',
            },
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: '2021-08-08T07:59:48.766Z',
              username: 'johndoe',
            },
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            },
          ],
        },
      ],
    });
    expect(mockThreadRepository.getThreadDetailById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-456');
  });
});