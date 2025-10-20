export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;  // email or username
  role: string;
  exp: number;
}
