import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityController } from './interfaces/http/identity.controller';
import { ListUsersByRoleUseCase } from './application/use-cases/list-users-by-role.use-case';
import { UsersDirectoryPort } from './domain/interfaces/users-directory.port';
import { KeycloakAdminClient } from './infrastructure/keycloak/keycloak-admin.client';
import { KeycloakUsersDirectoryAdapter } from './infrastructure/keycloak/keycloak-users-directory.adapter';

@Module({
  imports: [HttpModule],
  controllers: [IdentityController],
  providers: [
    ListUsersByRoleUseCase,
    KeycloakAdminClient,
    { provide: UsersDirectoryPort, useClass: KeycloakUsersDirectoryAdapter },
  ],
  exports: [UsersDirectoryPort],
})
export class IdentityModule {}
