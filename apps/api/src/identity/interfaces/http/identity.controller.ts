import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../../../auth/roles.guard';
import { Role } from 'shared';
import { ListUsersByRoleUseCase } from '../../application/use-cases/list-users-by-role.use-case';

type IdentityUserDto = {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
};

function buildFullName(u: {
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  id: string;
}) {
  const fio = `${u.lastName ?? ''} ${u.firstName ?? ''}`.trim();
  return fio || u.username || u.email || u.id;
}

@Controller('identity')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class IdentityController {
  constructor(private readonly listUsers: ListUsersByRoleUseCase) {}

  @Get('initiators')
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement)
  async initiators(): Promise<IdentityUserDto[]> {
    const users = await this.listUsers.execute(Role.Initiator);

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: buildFullName(u),
    }));
  }

  @Get('procurements')
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement)
  async procurements(): Promise<IdentityUserDto[]> {
    const users = await this.listUsers.execute(Role.Procurement);

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: buildFullName(u),
    }));
  }
}
