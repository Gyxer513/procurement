import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const issuer = process.env.KEYCLOAK_ISSUER!;
    const jwksUri =
      process.env.KEYCLOAK_JWKS_URI ??
      `${issuer}/protocol/openid-connect/certs`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer,

      // На старте лучше отключить audience, пока не настроишь mapper:
      // audience: process.env.KEYCLOAK_AUDIENCE,

      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri,
      }),
    });
  }

  validate(payload: any) {
    const realmRoles: string[] = payload?.realm_access?.roles ?? [];

    const apiClient = process.env.KEYCLOAK_API_CLIENT_ID ?? 'procurement-api';
    const webClient = process.env.KEYCLOAK_WEB_CLIENT_ID ?? 'procurement-web';

    const apiRoles: string[] =
      payload?.resource_access?.[apiClient]?.roles ?? [];
    const webRoles: string[] =
      payload?.resource_access?.[webClient]?.roles ?? [];

    return {
      ...payload, // если тебе где-то нужен raw payload как раньше
      sub: payload.sub,
      roles: [...new Set([...realmRoles, ...apiRoles, ...webRoles])], // <- главное
    };
  }
}
