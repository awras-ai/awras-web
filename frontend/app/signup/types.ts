export interface RegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export const initialRegistrationData: RegistrationData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};
