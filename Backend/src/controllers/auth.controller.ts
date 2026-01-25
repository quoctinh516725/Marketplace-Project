import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import authValidation from "../validations/auth.validation";
import authService from "../services/auth/auth.service";
import { sendSuccess } from "../utils/response";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
} from "../utils/cookie";
class AuthController {
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { emailOrUsername, password } = req.body;
    const dataValidated = authValidation.loginValidation({
      emailOrUsername,
      password,
    });
    const result = await authService.login(dataValidated);
    const { refreshToken, ...data } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, data, "Đăng nhập thành công!");
  });
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, username, password } = req.body;
      const dataValidated = authValidation.registerValidation({
        email,
        username,
        password,
      });
      const result = await authService.register(dataValidated);

      const { refreshToken, ...data } = result;
      setRefreshTokenCookie(res, refreshToken);
      sendSuccess(res, data, "Đăng ký thành công!");
    },
  );
  refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      const token = await authService.refreshToken(refreshToken);
      sendSuccess(res, token, "Refresh Token thành công!");
    },
  );
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const accessToken = req.token!;
    const userId = req.user?.userId!;
    await authService.logout(userId, accessToken, refreshToken);

    sendSuccess(res, null, "Đăng xuất thành công!");
  });
}

export default new AuthController();
