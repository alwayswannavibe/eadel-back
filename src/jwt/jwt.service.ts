import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from '@app/jwt/constants/jwt.constatnts';
import { JwtOptions } from '@app/jwt/interfaces/jwtOptions.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtOptions) {}

  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.options.jwtSecret);
  }

  verify(token: string): Record<string, unknown> | string {
    const payload = jwt.verify(token, this.options.jwtSecret);
    return payload;
  }
}
