import api from "./api";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MeResponse,
  ChangePasswordRequest,
} from "../types/auth";

export const register = (data: RegisterRequest) => api.post<RegisterResponse>("/api/v1/auth/register", data);
export const login = (data: LoginRequest) => api.post<LoginResponse>("/api/v1/auth/login", data);
export const verifyEmail = (code: string) => api.get(`/api/v1/auth/verify-email/${code}`);
export const resendVerification = (data: ResendVerificationRequest) => api.post("/api/v1/auth/resend-verification", data);
export const forgotPassword = (data: ForgotPasswordRequest) => api.post("/api/v1/auth/forgot-password", data);
export const resetPassword = (data: ResetPasswordRequest) => api.post("/api/v1/auth/reset-password", data);
export const getMe = () => api.post<MeResponse>("/api/v1/auth/me");
export const changePassword = (data: ChangePasswordRequest) => api.post("/api/v1/auth/change-password", data);
