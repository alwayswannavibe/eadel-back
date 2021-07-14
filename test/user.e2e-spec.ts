import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import { getConnection, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as request from 'supertest';
import { EmailEntity } from '@app/email/entities/email.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { GRAPHQL_ENDPOINT } from '@app/common/constants/graphqlEndpoint';
import { UserRole } from '@app/user/types/userRole.type';
import { Errors } from '@app/common/constants/errors';
import { User } from '@app/auth/decorators/user.decorator';

const mockMailerService = () => ({
  sendMail: jest.fn(),
});

describe('User (e2e)', () => {
  let app: INestApplication;
  let mailerService: MailerService;
  let emailRepository: Repository<EmailEntity>;
  let userRepository: Repository<UserEntity>;
  let token = '';

  const coreRequest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicRequest = (query: string) => coreRequest().send({ query });
  const privateRequest = (query: string) => {
    return coreRequest().set('X-JWT', token).send({ query });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: MailerService,
          useValue: mockMailerService(),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    mailerService = moduleFixture.get<MailerService>(MailerService);
    emailRepository = moduleFixture.get<Repository<EmailEntity>>(
      getRepositoryToken(EmailEntity),
    );
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  beforeEach(() => {
    mailerService.sendMail = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = {
    email: 'test@gmail.com',
    password: '123',
  };

  describe('createAccount', () => {
    it('should create the account', async () => {
      const response = await publicRequest(
        `mutation {
            createAccount(
              input: { 
                email: "${user.email}",
                password: "${user.password}",
                role: Client
              }
            ) {
              isSuccess
              error
            }
          }`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.createAccount.isSuccess).toEqual(true);
      expect(response.body.data.createAccount.error).toEqual(null);
    });

    it('should return an error if the account already exist', async () => {
      const response = await publicRequest(
        `mutation {
            createAccount(
              input: { 
                email: "${user.email}"
                password: "${user.password}"
                role: Client
              }
            ) {
              isSuccess
              error
            }
          }`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.createAccount.isSuccess).toEqual(false);
      expect(response.body.data.createAccount.error).toEqual(
        Errors.EMAIL_TAKEN,
      );
    });
  });

  describe('login', () => {
    it('should login', async () => {
      const response = await publicRequest(
        `mutation {
            login(
              input: {
                email: "${user.email}"
                password: "${user.password}"
              }
            ) {
              isSuccess
              error
              token
            }
          }`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.login.isSuccess).toEqual(true);
      expect(response.body.data.login.error).toEqual(null);
      expect(response.body.data.login.token).toEqual(expect.any(String));
      token = response.body.data.login.token;
    });

    it('should return an error if the email is wrong', async () => {
      const response = await publicRequest(
        `mutation {
            login(
              input: {
                email: "wrong@gmail.com"
                password: "${user.password}"
              }
            ) {
              isSuccess
              error
              token
            }
          }`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.login.isSuccess).toEqual(false);
      expect(response.body.data.login.error).toBe(
        Errors.EMAIL_OR_PASSWORD_WRONG,
      );
    });

    it('should return an error if the password is wrong', async () => {
      const response = await publicRequest(
        `mutation {
            login(
              input: {
                email: "${user.email}"
                password: "wrong"
              }
            ) {
              isSuccess
              error
              token
            }
          }`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.login.isSuccess).toEqual(false);
      expect(response.body.data.login.error).toBe(
        Errors.EMAIL_OR_PASSWORD_WRONG,
      );
    });
  });

  describe('self', () => {
    it('shoud return the account if token correct', async () => {
      const response = await privateRequest(`
        {
          self {
            email
            id
            role
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.self.email).toEqual(user.email);
      expect(response.body.data.self.id).toEqual(1);
      expect(response.body.data.self.role).toEqual("Client");
    });

    it('shoud return ab error if the token wrong or empty', async () => {
      const response = await publicRequest(`
        {
          self {
            email
            id
            role
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.errors[0].message).toEqual(
        Errors.FORBIDDEN_RESOURCE,
      );
    });
  });

  describe('userProfile', () => {
    it('should return the user profile info', async () => {
      const response = await privateRequest(`
        {
          userProfile(id: 1) {
            user {
              email
              role
            }
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.userProfile.isSuccess).toEqual(true);
      expect(response.body.data.userProfile.error).toEqual(null);
      expect(response.body.data.userProfile.user.email).toEqual(user.email);
      expect(response.body.data.userProfile.user.role).toEqual("Client");
    });

    it("should return an error if the user doesn't exist", async () => {
      const response = await privateRequest(`
        {
          userProfile(id: 1000) {
            user {
              email
              role
            }
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.userProfile.isSuccess).toEqual(false);
      expect(response.body.data.userProfile.error).toEqual(Errors.NOT_FOUND);
      expect(response.body.data.userProfile.user).toEqual(null);
    });

    it('should return an error if the token is wrong or empty', async () => {
      const response = await publicRequest(`
        {
          userProfile(id: 1) {
            user {
              email
              role
            }
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.errors[0].message).toEqual(
        Errors.FORBIDDEN_RESOURCE,
      );
    });
  });

  describe('sendCode', () => {
    it('should send the code', async () => {
      const response = await privateRequest(`mutation {
          sendCode {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.sendCode.error).toEqual(null);
      expect(response.body.data.sendCode.isSuccess).toEqual(true);
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should return an error if the token is wrong or empty', async () => {
      const response = await publicRequest(`mutation {
          sendCode {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.errors[0].message).toEqual(
        Errors.FORBIDDEN_RESOURCE,
      );
      expect(mailerService.sendMail).toHaveBeenCalledTimes(0);
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [email] = await emailRepository.find();
      verificationCode = email.code;
    });

    it('should verify the email', async () => {
      const response = await privateRequest(`mutation {
          verifyEmail (
            input: { code: "${verificationCode}" }
          ) {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      const [email] = await emailRepository.find();
      expect(response.body.data.verifyEmail.error).toEqual(null);
      expect(response.body.data.verifyEmail.isSuccess).toEqual(true);
      expect(email.isVerified).toEqual(true);
    });

    it('should return an error if the token is wrong or empty', async () => {
      const response = await publicRequest(`mutation {
          verifyEmail (
            input: { code: "${verificationCode}" }
          ) {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.errors[0].message).toEqual(
        Errors.FORBIDDEN_RESOURCE,
      );
      expect(mailerService.sendMail).toHaveBeenCalledTimes(0);
    });
  });

  describe('updateAccount', () => {
    const newUser = {
      email: 'new@gmail.com',
      password: 'new',
    };

    it('should update the email', async () => {
      const response = await privateRequest(`mutation {
          updateProfile (
            input: { email: "${newUser.email}" }
          ) {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      const [updatedUser] = await userRepository.find();
      const [email] = await emailRepository.find();
      expect(response.body.data.updateProfile.error).toEqual(null);
      expect(response.body.data.updateProfile.isSuccess).toEqual(true);
      expect(updatedUser.email).toEqual(newUser.email);
      expect(email.isVerified).toEqual(false);
    });

    it('should update the password', async () => {
      const response = await privateRequest(`mutation {
          updateProfile (
            input: { password: "${newUser.password}" }
          ) {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data.updateProfile.error).toEqual(null);
      expect(response.body.data.updateProfile.isSuccess).toEqual(true);
    });

    it('should return an error if the token is wrong or empty', async () => {
      const response = await publicRequest(`mutation {
          updateProfile (
            input: { password: "${newUser.password}" }
          ) {
            isSuccess
            error
          }
        }
      `);

      expect(response.statusCode).toEqual(200);
      expect(response.body.errors[0].message).toEqual(
        Errors.FORBIDDEN_RESOURCE,
      );
    });
  });
});
