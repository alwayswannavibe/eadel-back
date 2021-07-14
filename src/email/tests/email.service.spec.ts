import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '@app/email/email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailEntity } from '@app/email/entities/email.entity';
import { NodeMailerService } from '@app/nodeMailer/nodeMailer.service';
import { MockRepository } from '@app/common/types/mockRepository.type';
import { UserRole } from '@app/user/types/userRole.type';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockNodeMailerService = {
  sendCode: jest.fn(),
};

describe('EmailService', () => {
  let emailService: EmailService;
  let nodeMailerService: NodeMailerService;
  let emailRepository: MockRepository<EmailEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getRepositoryToken(EmailEntity),
          useValue: mockRepository,
        },
        {
          provide: NodeMailerService,
          useValue: mockNodeMailerService,
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    nodeMailerService = module.get<NodeMailerService>(NodeMailerService);
    emailRepository = module.get(getRepositoryToken(EmailEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  const user = {
    id: 1,
    email: 'test@gmail.com',
    password: '123',
    role: UserRole.Client,
    createdAt: new Date(),
    updatedAt: new Date(),
    restaurants: [],
  };

  describe('verifyEmail', () => {
    const id = 1;

    it('should return error if email already verified', async () => {
      const data = {
        isVerified: true,
        code: '123',
      };

      const { code } = data;

      emailRepository.findOne.mockResolvedValue(data);

      const result = await emailService.verifyEmail(id, code);

      expect(emailRepository.findOne).toHaveBeenCalledTimes(1);
      expect(emailRepository.findOne).toHaveBeenCalledWith({ user: { id } });
      expect(result).toMatchObject({
        isSuccess: false,
        error: 'Email already verified',
      });
    });

    it('should retutn error if code is wrong', async () => {
      const data = {
        isVerified: false,
        code: '123',
      };

      const code = 'wrong code';

      emailRepository.findOne.mockResolvedValue(data);

      const result = await emailService.verifyEmail(id, code);

      expect(emailRepository.findOne).toHaveBeenCalledTimes(1);
      expect(emailRepository.findOne).toHaveBeenCalledWith({ user: { id } });
      expect(result).toMatchObject({
        isSuccess: false,
        error: 'Wrong confirmation code',
      });
    });

    it('should update isVerified flag if code is right', async () => {
      const data = {
        isVerified: false,
        code: '123',
      };

      const { code } = data;

      emailRepository.findOne.mockResolvedValue(data);

      const result = await emailService.verifyEmail(id, code);

      expect(emailRepository.findOne).toHaveBeenCalledTimes(1);
      expect(emailRepository.findOne).toHaveBeenCalledWith({ user: { id } });
      expect(emailRepository.save).toHaveBeenCalledTimes(1);
      expect(emailRepository.save).toHaveBeenCalledWith({
        isVerified: true,
        code: data.code,
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('updateEmail', () => {
    const email = {
      user,
      isVerified: false,
      code: '123',
    };

    it('shoud update email entity', async () => {
      emailRepository.create.mockResolvedValue(email);

      await emailService.updateEmail(user);

      expect(emailRepository.delete).toHaveBeenCalledTimes(1);
      expect(emailRepository.delete).toHaveBeenCalledWith({
        user: { id: user.id },
      });
      expect(emailRepository.create).toHaveBeenCalledTimes(1);
      expect(emailRepository.create).toHaveBeenCalledWith({
        user,
      });
      expect(emailRepository.save).toHaveBeenCalledTimes(1);
      expect(emailRepository.save).toHaveBeenCalledWith(email);
    });
  });

  describe('createEmail', () => {
    const email = {
      user,
      isVerified: false,
      code: '123',
    };

    it('shoud create email entity', async () => {
      emailRepository.create.mockResolvedValue(email);

      await emailService.updateEmail(user);

      expect(emailRepository.create).toHaveBeenCalledTimes(1);
      expect(emailRepository.create).toHaveBeenCalledWith({
        user,
      });
      expect(emailRepository.save).toHaveBeenCalledTimes(1);
      expect(emailRepository.save).toHaveBeenCalledWith(email);
    });
  });

  describe('sendCode', () => {
    const email = {
      code: '123',
    };

    it('should send code', async () => {
      emailRepository.findOne.mockResolvedValue(email);

      const result = await emailService.sendCode(user);

      expect(emailRepository.findOne).toHaveBeenCalledTimes(1);
      expect(emailRepository.findOne).toHaveBeenCalledWith({ user });
      expect(nodeMailerService.sendCode).toHaveBeenCalledTimes(1);
      expect(nodeMailerService.sendCode).toHaveBeenCalledWith(
        user.email,
        email.code,
      );
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });
});
