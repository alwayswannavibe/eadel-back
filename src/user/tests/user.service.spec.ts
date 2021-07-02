import { UserService } from '@app/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { JwtService } from '@app/jwt/jwt.service';
import { EmailService } from '@app/email/email.service';
import { MockRepository } from '@app/common/types/mockRepository.type';
import { UserRole } from '@app/user/types/userRole.type';
import * as bcrypt from 'bcrypt';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'Test token'),
  verify: jest.fn(),
};

const mockEmailService = {
  verifyEmail: jest.fn(),
  createEmail: jest.fn(),
  updateEmail: jest.fn(),
  sendCode: jest.fn(),
};

let compareResult = true;

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => 'Hashed password'),
  compare: jest.fn(() => compareResult),
}));

describe('UserService', () => {
  let userService: UserService;
  let emailService: EmailService;
  let jwtService: JwtService;
  let userRepository: MockRepository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createAccount', () => {
    it('should return an error if email already taken', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
        role: UserRole.Client,
      });

      const result = await userService.createAccount({
        email: '',
        password: '',
        role: UserRole.Client,
      });

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        isSuccess: false,
        error: 'This email is already taken',
      });
    });

    it('should create a new account', async () => {
      const accountData = {
        email: 'test@gmail.com',
        password: '123',
        role: UserRole.Client,
      };

      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockResolvedValue(accountData);

      const result = await userService.createAccount(accountData);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(accountData);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(accountData);
      expect(emailService.createEmail).toHaveBeenCalledTimes(1);
      expect(emailService.createEmail).toHaveBeenCalledWith(accountData);
      expect(result).toMatchObject({ isSuccess: true });
    });
  });

  describe('login', () => {
    const accountData = {
      email: 'test@gmail.com',
      password: '123',
    };

    const user = {
      id: 1,
      email: accountData.email,
      password: 'hashedPassword',
      role: UserRole.Client,
    };

    it("should return an error if user doesn't exist", async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.login(accountData);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        isSuccess: false,
        error: 'Email or password are wrong',
      });
    });

    it('should return an error if password is wrong', async () => {
      userService.checkPassword = jest.fn().mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.login(accountData);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userService.checkPassword).toHaveBeenCalledTimes(1);
      expect(userService.checkPassword).toHaveBeenCalledWith(
        accountData.password,
        user,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: 'Email or password are wrong',
      });
    });

    it('should return a token if password is right', async () => {
      userService.checkPassword = jest.fn().mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.login(accountData);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userService.checkPassword).toHaveBeenCalledTimes(1);
      expect(userService.checkPassword).toHaveBeenCalledWith(
        accountData.password,
        user,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
      expect(result).toMatchObject({
        isSuccess: true,
        token: 'Test token',
      });
    });
  });

  describe('getUserById', () => {
    const id = 1;

    const user = {
      id: 1,
      email: 'test@gmail.com',
      password: 'hashedPassword',
      role: UserRole.Client,
    };

    it('should return an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.getUserById(id);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual({ isSuccess: false, error: 'User not found' });
    });

    it('should return an user data if user exist', async () => {
      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.getUserById(1);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual({ isSuccess: true, user });
    });
  });

  describe('updateProfile', () => {
    const user = {
      id: 1,
      email: 'test@gmail.com',
      password: 'hashedPassword',
      role: UserRole.Client,
    };

    it('should update password if password edited', async () => {
      const editedData = {
        password: 'Cow',
      };

      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.updateProfile(user.id, editedData);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        editedData.password,
        expect.any(Number),
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        password: 'Hashed password',
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });

    it('should update email if email edited', async () => {
      const editedData = {
        email: 'new@gmail.com',
      };

      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.updateProfile(user.id, editedData);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(emailService.updateEmail).toHaveBeenCalledTimes(1);
      expect(emailService.updateEmail).toHaveBeenCalledWith({
        ...user,
        ...editedData,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        ...editedData,
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('checkPassword', () => {
    const password = 'password';
    const userWithHashedPassword = { password: 'hashed password' };

    it('should return true if password right', async () => {
      const result = await userService.checkPassword(
        password,
        userWithHashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        userWithHashedPassword.password,
      );
      expect(result).toEqual(true);
    });

    it('should return false if password wrong', async () => {
      compareResult = false;

      const result = await userService.checkPassword(
        password,
        userWithHashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        userWithHashedPassword.password,
      );
      expect(result).toEqual(false);
    });
  });
});
