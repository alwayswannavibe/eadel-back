import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@app/jwt/jwt.service';
import { JWT_OPTIONS } from '@app/jwt/constants/jwt.constatnts';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'Test';
const TOKEN = 'Token';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => TOKEN),
  verify: jest.fn(() => ({ id: USER_ID })),
}));

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: JWT_OPTIONS,
          useValue: { jwtSecret: JWT_SECRET },
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('sign', () => {
    it('should return a token', () => {
      const result = jwtService.sign({ id: USER_ID });

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, JWT_SECRET);
      expect(result).toEqual(TOKEN);
    });
  });

  describe('verify', () => {
    it('should return payload', () => {
      const result = jwtService.verify(TOKEN);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, JWT_SECRET);
      expect(result).toMatchObject({ id: USER_ID });
    });
  });
});
