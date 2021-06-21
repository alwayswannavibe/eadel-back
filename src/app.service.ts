import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  static getHello(): string {
    return 'Hello World!';
  }
}
