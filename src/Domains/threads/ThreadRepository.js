class ThreadRepository {
  async addThread(newThread) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyThreadAvailability(threadId) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getThreadDetailById(threadId) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = ThreadRepository;
