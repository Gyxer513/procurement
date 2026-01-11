import { Injectable } from '@nestjs/common';
import { UsersDirectoryPort } from '../../domain/interfaces/users-directory.port';

@Injectable()
export class ListUsersByRoleUseCase {
  constructor(private readonly dir: UsersDirectoryPort) {}

  execute(roleName: string) {
    return this.dir.listUsersByClientRole(roleName);
  }
}
