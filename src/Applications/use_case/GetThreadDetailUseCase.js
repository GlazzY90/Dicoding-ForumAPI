const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadDetailById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // Iterasi setiap comment untuk mengambil replies-nya
    const commentsDetail = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
        
        // Mapping replies menjadi entity ReplyDetail
        const repliesDetail = replies.map((reply) => new ReplyDetail(reply));

        // Mapping comment menjadi entity CommentDetail
        return new CommentDetail({
          ...comment,
          replies: repliesDetail,
        });
      })
    );

    return new ThreadDetail({
      ...thread,
      comments: commentsDetail,
    });
  }
}

module.exports = GetThreadDetailUseCase;
