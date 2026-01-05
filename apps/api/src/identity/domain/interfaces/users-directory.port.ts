export type DirectoryUser = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export abstract class UsersDirectoryPort {
  abstract listUsersByClientRole(roleName: string): Promise<DirectoryUser[]>;
}
