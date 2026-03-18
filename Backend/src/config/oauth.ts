import { OAuth2Client } from "google-auth-library";
import { env } from "./env";
import { ValidationError } from "../error/AppError";

const client = new OAuth2Client(env.OAUTH_CLIENT_ID);

export const verifyGoogleToken = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new ValidationError(
        "Không thể lấy thông tin người dùng từ token Google",
      );
    }

    if (!payload.email) {
      throw new ValidationError("Email không tồn tại trong Google");
    }

    if (!payload.email_verified) {
      throw new ValidationError("Email chưa được xác thực bởi Google");
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
    };
  } catch (error) {
    throw new ValidationError("Lỗi xác thực token Google: " + error);
  }
};
