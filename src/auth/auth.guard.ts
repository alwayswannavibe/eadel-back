import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from '@app/auth/types/allowedRoles.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowerdRoles = this.reflector.get<AllowedRoles[]>(
      'roles',
      context.getHandler(),
    );

    if (!allowerdRoles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { user } = gqlContext;

    if (!user) {
      return false;
    }

    if (allowerdRoles.includes('Any')) {
      return true;
    }

    return allowerdRoles.includes(user.role);
  }
}
