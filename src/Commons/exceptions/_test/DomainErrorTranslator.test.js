const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');
const AuthenticationError = require('../AuthenticationError');
const AuthorizationError = require('../AuthorizationError');
const NotFoundError = require('../NotFoundError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    // Users
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));

    // Login/auth
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('username dan password harus string'));
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('AUTHENTICATION.UNAUTHORIZED_USER')))
      .toStrictEqual(new AuthenticationError('kredensial yang Anda masukkan salah'));

    // Threads
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'));

    // Comments
    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat komentar baru karena tipe data tidak sesuai'));

    // Replies
    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat balasan baru karena tipe data tidak sesuai'));

    // Repo/business logic
    expect(DomainErrorTranslator.translate(new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')))
      .toStrictEqual(new InvariantError('method not implemented'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')))
      .toStrictEqual(new InvariantError('method not implemented'));
    expect(DomainErrorTranslator.translate(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')))
      .toStrictEqual(new InvariantError('method not implemented'));

    // Not found resources
    expect(DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND')))
      .toStrictEqual(new NotFoundError('thread tidak ditemukan'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.NOT_FOUND')))
      .toStrictEqual(new NotFoundError('komentar tidak ditemukan'));
    expect(DomainErrorTranslator.translate(new Error('REPLY.NOT_FOUND')))
      .toStrictEqual(new NotFoundError('balasan tidak ditemukan'));

    // Authorization
    expect(DomainErrorTranslator.translate(new Error('AUTHENTICATION.FORBIDDEN_USER')))
      .toStrictEqual(new AuthorizationError('Anda tidak berhak mengakses resource ini'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});