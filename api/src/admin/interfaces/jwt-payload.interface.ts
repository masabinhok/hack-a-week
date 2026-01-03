export interface JwtPayload {
  sub: string; // user id
  username: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
