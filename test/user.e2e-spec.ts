import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import { getConnection, Repository } from "typeorm";
import { MailerService } from '@nestjs-modules/mailer';
import * as request from 'supertest';
import { EmailEntity } from "@app/email/entities/email.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "@app/user/entities/user.entity";

const GRAPHQL_ENDPOINT = '/graphql';

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
    it('should create account', () => {
      return publicRequest(
        `mutation {
            createAccount(
              input: { email: "test@gmail.com", password: "123", role: Client }
            ) {
              isSuccess
              error
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.isSuccess).toEqual(true);
          expect(res.body.data.createAccount.error).toEqual(null);
        });
    });

    it('should return error if account already exist', () => {
      return publicRequest(
        `mutation {
            createAccount(
              input: { email: "${user.email}", password: "${user.password}", role: Client }
            ) {
              isSuccess
              error
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          const { createAccount } = res.body.data;
          expect(createAccount.isSuccess).toEqual(false);
          expect(createAccount.error).toEqual('This email is already taken');
        });
    });
  });

  describe('login', () => {
    it('should login', () => {
      return publicRequest(
        `mutation {
            login(
              input: { email: "${user.email}" , password: "${user.password}" }
            ) {
              isSuccess
              error
              token
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          const { login } = res.body.data;
          expect(login.isSuccess).toEqual(true);
          expect(login.error).toEqual(null);
          expect(login.token).toEqual(expect.any(String));
          token = login.token;
        });
    });

    it('should return error if email is wrong', () => {
      return publicRequest(
        `mutation {
            login(
              input: { email: "wrong@gmail.com", password: "${user.password}"}
            ) {
              isSuccess
              error
              token
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          const { login } = res.body.data;
          expect(login.isSuccess).toEqual(false);
          expect(login.error).toBe('Email or password are wrong');
        });
    });

    it('should return error if password is wrong', () => {
      publicRequest(
        `mutation {
            login(
              input: { email: "${user.email}", password: "wrong"}
            ) {
              isSuccess
              error
              token
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          const { login } = res.body.data;
          expect(login.isSuccess).toEqual(false);
          expect(login.error).toBe('Email or password are wrong');
        });
    });
  });

  describe('self', () => {
    it('shoud return self account if token correct', () => {
      return privateRequest(`
        {
          self {
            email
            id
            role
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { email, id, role } = res.body.data.self;
          expect(email).toEqual(user.email);
          expect(id).toEqual(1);
          expect(role).toEqual('Client');
        });
    });

    it('shoud return error if token wrong or empty', () => {
      return publicRequest(`
        {
          self {
            email
            id
            role
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toEqual('Forbidden resource');
        });
    });
  });

  describe('userProfile', () => {
    it('should return user profile info', () => {
      return privateRequest(`
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
      `)
        .expect(200)
        .expect((res) => {
          const { email, role } = res.body.data.userProfile.user;
          const { isSuccess, error } = res.body.data.userProfile;
          expect(isSuccess).toEqual(true);
          expect(error).toEqual(null);
          expect(email).toEqual(user.email);
          expect(role).toEqual('Client');
        });
    });

    it("should return error if user doesn't exist", () => {
      return privateRequest(`
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
      `)
        .expect(200)
        .expect((res) => {
          const userResponse = res.body.data.userProfile.user;
          const { isSuccess, error } = res.body.data.userProfile;
          expect(isSuccess).toEqual(false);
          expect(error).toEqual('User not found');
          expect(userResponse).toEqual(null);
        });
    });

    it('should return error if token is wrong or empty', () => {
      return publicRequest(`
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
      `)
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toEqual('Forbidden resource');
        });
    });
  });

  describe('sendCode', () => {
    it('should send code', () => {
      return privateRequest(`mutation {
          sendCode {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { isSuccess, error } = res.body.data.sendCode;
          expect(error).toEqual(null);
          expect(isSuccess).toEqual(true);
          expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
        });
    });

    it('should return error if token is wrong or empty', () => {
      return publicRequest(`mutation {
          sendCode {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toEqual('Forbidden resource');
          expect(mailerService.sendMail).toHaveBeenCalledTimes(0);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [email] = await emailRepository.find();
      verificationCode = email.code;
    });

    it('should verify email', () => {
      return privateRequest(`mutation {
          verifyEmail (
            input: { code: "${verificationCode}" }
          ) {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect(async (res) => {
          const { isSuccess, error } = res.body.data.verifyEmail;
          const [email] = await emailRepository.find();
          expect(error).toEqual(null);
          expect(isSuccess).toEqual(true);
          expect(email.isVerified).toEqual(true);
        });
    });

    it('should return error if token is wrong or empty', () => {
      return publicRequest(`mutation {
          verifyEmail (
            input: { code: "${verificationCode}" }
          ) {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toEqual('Forbidden resource');
          expect(mailerService.sendMail).toHaveBeenCalledTimes(0);
        });
    });
  });

  describe('updateAccount', () => {
    const newUser = {
      email: 'new@gmail.com',
      password: 'new',
    };

    it('should update email', () => {
      return privateRequest(`mutation {
          updateProfile (
            input: { email: "${newUser.email}" }
          ) {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect(async (res) => {
          const { isSuccess, error } = res.body.data.updateProfile;
          const [updatedUser] = await userRepository.find();
          const [email] = await emailRepository.find();
          expect(error).toEqual(null);
          expect(isSuccess).toEqual(true);
          expect(updatedUser.email).toEqual(newUser.email);
          expect(email.isVerified).toEqual(false);
        });
    });

    it('should update password', () => {
      return privateRequest(`mutation {
          updateProfile (
            input: { password: "${newUser.password}" }
          ) {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { isSuccess, error } = res.body.data.updateProfile;
          expect(error).toEqual(null);
          expect(isSuccess).toEqual(true);
        });
    });

    it('should return error if token is wrong or empty', () => {
      return publicRequest(`mutation {
          updateProfile (
            input: { password: "${newUser.password}" }
          ) {
            isSuccess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toEqual('Forbidden resource');
        });
    });
  });
});
