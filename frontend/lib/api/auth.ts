export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
}

export interface VerifyEmailData {
  code: string;
  email: string;
}

export interface VerifyEmailResponse {
  success: boolean;
}

export interface UploadProfileData {
  file: File;
  userId: string;
}

export interface UploadProfileResponse {
  success: boolean;
  url: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() > 0.1) {
    return { success: true, userId: "user_" + Date.now() };
  }
  throw new Error("Registration failed. Please try again.");
}

export async function verifyEmail(data: VerifyEmailData): Promise<VerifyEmailResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (data.code === "123456" || Math.random() > 0.1) {
    return { success: true };
  }
  throw new Error("Invalid verification code.");
}

export async function uploadProfilePicture(data: UploadProfileData): Promise<UploadProfileResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    url: URL.createObjectURL(data.file),
  };
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (Math.random() > 0.1) {
    return { success: true, token: "auth_token_" + Date.now() };
  }
  throw new Error("Invalid email or password.");
}
