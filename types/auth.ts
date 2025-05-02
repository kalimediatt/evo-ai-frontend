// Tipos para Auth API

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  // Defina os campos conforme a resposta real da API
  id: string;
  email: string;
  name: string;
  // ... outros campos
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface MeResponse {
  email: string;
  id: string;
  client_id: string | null;
  is_active: boolean;
  email_verified: boolean;
  is_admin: boolean;
  created_at: string;
} 