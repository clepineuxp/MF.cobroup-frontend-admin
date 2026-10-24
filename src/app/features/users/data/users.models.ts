export type ManagedUserRole = 'Supervisor' | 'Collector';
export interface OrganizationUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly phoneNumber: string | null;
  readonly role: 'Admin' | ManagedUserRole;
  readonly isActive: boolean;
  readonly isOwner: boolean;
  readonly joinedAtUtc: string;
}
export interface CreateUserRequest {
  readonly username: string;
  readonly displayName: string;
  readonly phoneNumber: string;
  readonly password: string;
  readonly role: ManagedUserRole;
}
