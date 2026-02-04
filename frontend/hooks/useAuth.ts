import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  verifyEmail,
  uploadProfilePicture,
  loginUser,
  RegisterData,
  VerifyEmailData,
  UploadProfileData,
  LoginData,
} from "@/lib/api/auth";

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useUploadProfile() {
  return useMutation({
    mutationFn: uploadProfilePicture,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
  });
}
