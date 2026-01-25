import { ALLOWED_FIELDS } from "../constants";
import { ValidationError } from "../error/AppError";
import { UpdateUserData } from "../repositories/user.repository";

const UserValidation = {
  validateUserDataUpdate: (data: UpdateUserData) => {
    const allowedData: UpdateUserData = {};
    const checkData = Object.keys(data).filter(
      (key) => !ALLOWED_FIELDS.includes(key as any),
    );

    if (checkData.length > 0) {
      throw new ValidationError(
        `Không được phép chỉnh sửa ${checkData.join(", ")}`,
      );
    }

    if (data.fullName !== undefined) allowedData.fullName = data.fullName;
    if (data.phone !== undefined) allowedData.phone = data.phone;
    if (data.gender !== undefined) allowedData.gender = data.gender;
    if (data.dateOfBirth !== undefined)
      allowedData.dateOfBirth = new Date(data.dateOfBirth);

    return allowedData;
  },
};

export default UserValidation;
