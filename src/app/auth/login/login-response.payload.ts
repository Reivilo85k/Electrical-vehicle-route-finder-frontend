export interface LoginResponse {
  authenticationToken: string;
  refreshToken: string;
  expiresAt: Date;
  username: string;
  userId: number;
  userIsAdmin: boolean
}
