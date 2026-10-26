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
  readonly canReopenDay?: boolean;
}
export interface CreateUserRequest {
  readonly username: string;
  readonly displayName: string;
  readonly phoneNumber: string;
  readonly password: string;
  readonly role: ManagedUserRole;
  readonly canReopenDay?: boolean;
}
export interface UpdateUserRequest {
  readonly username: string;
  readonly displayName: string;
  readonly phoneNumber: string;
  readonly role: 'Admin' | ManagedUserRole;
  readonly isActive: boolean;
  readonly password?: string | null;
  readonly canReopenDay?: boolean;
}
