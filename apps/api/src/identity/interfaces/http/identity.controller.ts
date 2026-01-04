import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListInitiatorsUseCase } from '../../application/use-cases/list-initiators.use-case';

@Controller('identity')
@UseGuards(AuthGuard('jwt'))
export class IdentityController {
  constructor(private readonly listInitiators: ListInitiatorsUseCase) {}

  @Get('initiators')
  async initiators() {
    return this.listInitiators.execute();
  }
}
