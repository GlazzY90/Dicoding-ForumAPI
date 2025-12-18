const Jwt = require('@hapi/jwt');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      const mockJwtToken = {
        verify: jest.fn().mockImplementation(() => {
          throw new Error('Verification failed'); 
        }),
        decode: jest.fn(),
        generate: jest.fn(),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);
      const invalidToken = 'this_is_an_invalid_token';

      await expect(jwtTokenManager.verifyRefreshToken(invalidToken))
        .rejects
        .toThrow(InvariantError);
        
      expect(mockJwtToken.verify).toHaveBeenCalled();
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      const mockJwtToken = {
        verify: jest.fn().mockResolvedValue({}),
        generate: jest.fn().mockResolvedValue('mock_token'),
        decode: jest.fn().mockResolvedValue({}),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);
      const validToken = 'this_is_a_valid_token';

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(validToken))
        .resolves
        .not.toThrow(InvariantError);
        
      expect(mockJwtToken.verify).toHaveBeenCalled();
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action
      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Action & Assert
      expect(expectedUsername).toEqual('dicoding');
    });
  });
});
