import {
  MiddlewareConsumer, Module, NestModule, RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as joi from 'joi';
import { UserModule } from '@app/user/user.module';
import { UserEntity } from '@app/user/entities/user.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtMiddleware } from '@app/jwt/middlewares/jwt.middleware';
import { JwtModule } from '@app/jwt/jwt.module';
import { EmailEntity } from '@app/email/entities/email.entity';
import { EmailModule } from '@app/email/email.module';

const { NODE_ENV } = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: NODE_ENV === 'dev' ? '.dev.env' : '.test.env',
      ignoreEnvFile: NODE_ENV === 'prod',
      validationSchema: joi.object({
        NODE_ENV: joi.string().valid('dev', 'prod', 'test'),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_DATABASE: joi.string().required(),
        JWT_SECRET: joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: NODE_ENV !== 'prod',
      logging: true,
      entities: [UserEntity, EmailEntity],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: (ctx) => ({ user: ctx.req.user }),
    }),
    JwtModule.forRoot({
      jwtSecret: process.env.JWT_SECRET,
    }),
    UserModule,
    EmailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
