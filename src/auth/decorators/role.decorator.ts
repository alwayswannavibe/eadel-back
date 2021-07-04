import { SetMetadata } from '@nestjs/common';
import { AllowedRoles } from '@app/auth/types/allowedRoles.type';

/* Gets the roles we want to allow access to, separated by commas,
 and sets their array to a metadata */
export const Role = (...roles: AllowedRoles[]) => SetMetadata('roles', roles);
