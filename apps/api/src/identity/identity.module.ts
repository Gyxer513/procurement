import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityController } from './interfaces/http/identity.controller';
import { ListInitiatorsUseCase } from './application/use-cases/list-initiators.use-case';
import { InitiatorsDirectoryPort } from './domain/interfaces/initiators-directory.port';
import { KeycloakAdminClient } from './infrastructure/keycloak/keycloak-admin.client';
import { KeycloakInitiatorsDirectoryAdapter } from './infrastructure/keycloak/keycloak-initiators-directory.adapter';

@Module({
  imports: [HttpModule],
  controllers: [IdentityController],
  providers: [
    ListInitiatorsUseCase,
    KeycloakAdminClient,
    {
      provide: InitiatorsDirectoryPort,
      useClass: KeycloakInitiatorsDirectoryAdapter,
    },
  ],
  exports: [InitiatorsDirectoryPort],
})
export class IdentityModule {}
