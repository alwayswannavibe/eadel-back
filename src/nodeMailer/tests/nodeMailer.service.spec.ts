import { Test, TestingModule } from '@nestjs/testing';
import { NodeMailerService } from '@app/nodeMailer/nodeMailer.service';
import { MailerService } from '@nestjs-modules/mailer';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('nodeMailerService', () => {
  let mailerService: MailerService;
  let nodeMailerService: NodeMailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeMailerService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
    nodeMailerService = module.get<NodeMailerService>(NodeMailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(nodeMailerService).toBeDefined();
  });

  describe('sendCode', () => {
    it('should calls send code in email service', async () => {
      await nodeMailerService.sendCode('test@gmail.com', '123');

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
