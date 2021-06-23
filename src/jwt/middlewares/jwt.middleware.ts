import { Injectable, NestMiddleware } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@app/jwt/jwt.service';
import { UserService } from '@app/user/user.service';
import { RequestWithUser } from '@app/jwt/interfaces/requestWithUser.interface';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const payload = this.jwtService.verify(token.toString());
      // eslint-disable-next-line no-prototype-builtins
      if (typeof payload !== 'string' && payload.hasOwnProperty('id')) {
        const user = await this.userService.getUserById(+payload.id);
        req.user = user;
      }
    }
    next();
  }
}
