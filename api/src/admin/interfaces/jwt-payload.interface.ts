export interface JwtPayload {
  sub: string; // user id
  username: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: TokenResponse;
  user: {
    id: string;
    username: string;
    role: string;
  };
}
