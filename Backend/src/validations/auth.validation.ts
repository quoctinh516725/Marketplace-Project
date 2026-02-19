import { ValidationError } from "../error/AppError";
import { LoginRequestDto, RegisterRequestDto } from "../dtos";

const AuthValidation = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  isValidUsername: (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username),

  isValidPassword: (password: string) => password.length >= 6,
};

export default AuthValidation;
