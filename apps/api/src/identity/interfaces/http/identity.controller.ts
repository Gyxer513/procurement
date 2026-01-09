import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../../../auth/roles.guard';
import { Role } from 'shared';
import { ListUsersByRoleUseCase } from '../../application/use-cases/list-users-by-role.use-case';

@Controller('identity')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class IdentityController {
  constructor(private readonly listUsers: ListUsersByRoleUseCase) {}

  @Get('initiators')
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement)
  initiators() {
    return this.listUsers.execute(Role.Initiator);
  }

  @Get('procurements')
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement)
  procurements() {
    return this.listUsers.execute(Role.Procurement);
  }
}
