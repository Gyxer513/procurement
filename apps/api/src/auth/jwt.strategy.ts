import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const issuer = process.env.KEYCLOAK_ISSUER!;
    const jwksUri =
      process.env.KEYCLOAK_JWKS_URI ?? `${issuer}/protocol/openid-connect/certs`;

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
        jwksUri, // <-- вот это важно
      }),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
