export type Initiator = {
  id: string; // keycloak user id
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export abstract class InitiatorsDirectoryPort {
  abstract listInitiators(): Promise<Initiator[]>;
  abstract getUserById(id: string): Promise<Initiator | null>;
}
