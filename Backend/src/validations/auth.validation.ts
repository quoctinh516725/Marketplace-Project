import { ValidationError } from "../error/AppError";
import { LoginData, RegisterData } from "../services/auth/auth.service";

const AuthValidation = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  isValidUsername: (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username),

  isValidPassword: (password: string) => password.length >= 6,
  loginValidation(data: LoginData): LoginData {
    const { emailOrUsername, password } = data;
    const errors: string[] = [];
    if (!emailOrUsername) {
      errors.push("Vui lòng nhập email hoặc username!");
    }
    if (!password || !this.isValidPassword(password)) {
      errors.push("Password bị thiếu hoặc ít hơn 6 ký tự!");
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
    return {
      emailOrUsername,
      password,
    };
  },
  registerValidation(data: RegisterData): RegisterData {
    const { email, username, password } = data;
    const errors: string[] = [];
    if (!email || !this.isValidEmail(email)) {
      errors.push("Email bị thiếu hoặc không hợp lệ!");
    }
    if (!password || !this.isValidPassword(password)) {
      errors.push("Password bị thiếu hoặc ít hơn 6 ký tự!");
    }
    if (!username || !this.isValidUsername(username)) {
      errors.push("Username bị thiếu hoặc không hợp lệ!");
    }
    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
    return {
      email,
      password,
      username,
    };
  },
};

export default AuthValidation;
