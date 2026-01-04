import { Injectable } from '@nestjs/common';
import { InitiatorsDirectoryPort } from '../../domain/interfaces/initiators-directory.port';

@Injectable()
export class ListInitiatorsUseCase {
  constructor(private readonly dir: InitiatorsDirectoryPort) {}

  execute() {
    return this.dir.listInitiators();
  }
}
