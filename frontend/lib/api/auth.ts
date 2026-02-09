const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    identifier: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    profile_image_url: string | null;
    created_at: string;
  };
  requires_verification: boolean;
}

export interface VerifyEmailData {
  code: string;
  email: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    identifier: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    profile_image_url: string | null;
    created_at: string;
  };
  requires_verification: boolean;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

export interface UploadProfileData {
  file: File;
}

export interface UploadProfileResponse {
  success: boolean;
  message: string;
  profile_image_url: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    identifier: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    profile_image_url: string | null;
    created_at: string;
  };
}

export interface User {
  id: string;
  identifier: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  profile_image_url: string | null;
  created_at: string;
}

export async function registerUser(
  data: RegisterData,
): Promise<RegisterResponse> {
  const res = await fetch(`${BASE_URL}api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      identifier: data.username,
      first_name: data.firstName,
      last_name: data.lastName,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 422) {
      interface ValidationError {
        msg: string;
      }
      const messages =
        err.detail?.map((d: ValidationError) => d.msg).join(", ") ||
        "Validation error";
      throw new Error(messages);
    }
    throw new Error(err.message || "Registration failed. Please try again.");
  }

  return res.json();
}

export async function verifyEmail(
  data: VerifyEmailData,
): Promise<VerifyEmailResponse> {
  const res = await fetch(
    `${BASE_URL}api/v1/auth/verify-email?token=${data.code}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 422) {
      interface ValidationError {
        msg: string;
      }
      const messages =
        err.detail?.map((d: ValidationError) => d.msg).join(", ") ||
        "Invalid code";
      throw new Error(messages);
    }
    throw new Error(err.message || "Invalid verification code.");
  }

  return res.json();
}

export async function resendVerification(
  data: ResendVerificationData,
): Promise<ResendVerificationResponse> {
  const res = await fetch(`${BASE_URL}api/v1/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email }),
  });

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 422) {
      interface ValidationError {
        msg: string;
      }
      const messages =
        err.detail?.map((d: ValidationError) => d.msg).join(", ") ||
        "Validation error";
      throw new Error(messages);
    }
    throw new Error(err.message || "Failed to resend verification email.");
  }

  return res.json();
}

export async function uploadProfilePicture(
  data: UploadProfileData,
): Promise<UploadProfileResponse> {
  const formData = new FormData();
  formData.append("file", data.file);

  const res = await fetch(`${BASE_URL}api/v1/auth/profile-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 422) {
      interface ValidationError {
        msg: string;
      }
      const messages =
        err.detail?.map((d: ValidationError) => d.msg).join(", ") ||
        "Invalid file";
      throw new Error(messages);
    }
    throw new Error(err.message || "Failed to upload profile picture.");
  }

  return res.json();
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 422) {
      interface ValidationError {
        msg: string;
      }
      const messages =
        err.detail?.map((d: ValidationError) => d.msg).join(", ") ||
        "Validation error";
      throw new Error(messages);
    }
    if (res.status === 401) {
      throw new Error(err.message || "Invalid email or password.");
    }
    throw new Error(err.message || "Login failed. Please try again.");
  }

  return res.json();
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}api/v1/auth/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch user.");
  }

  return res.json();
}
