import { DynamicModule, Global, Injectable, Module } from '@nestjs/common';
import { JwtOptions } from '@app/jwt/interfaces/jwtOptions.interface';
import { JwtService } from '@app/jwt/jwt.service';
import { JWT_OPTIONS } from '@app/jwt/constants/jwt.constatnts';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [
        JwtService,
        {
          provide: JWT_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
