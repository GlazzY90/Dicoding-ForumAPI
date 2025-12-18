const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: "sebuah body thread",
      owner: "user-123",
    };
    const mockAddedThread = new AddedThread({
      id: "thread-123",
      title: "sebuah thread",
      owner: "user-123",
    });

    // Action
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(
      useCasePayload,
      useCasePayload.owner
    ); 
    
    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: "thread-123",
        title: "sebuah thread",
        owner: "user-123",
      })
    );

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new NewThread({
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      }),
      "user-123"
    );
  });
});
