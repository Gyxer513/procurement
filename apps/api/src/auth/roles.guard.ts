import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => (target: any, key?: any, desc?: any) =>
  Reflect.defineMetadata(ROLES_KEY, roles, desc?.value ?? target);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    const clientId = process.env.KEYCLOAK_CLIENT_ID!;
    const roles: string[] =
      user?.resource_access?.[clientId]?.roles ??
      user?.realm_access?.roles ??
      [];

    return required.some(r => roles.includes(r));
  }
}
