import { useMutation, useQuery } from "@tanstack/react-query";
import {
  registerUser,
  verifyEmail,
  resendVerification,
  uploadProfilePicture,
  loginUser,
  getCurrentUser,
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

export function useResendVerification() {
  return useMutation({
    mutationFn: resendVerification,
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

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });
}
