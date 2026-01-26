import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import roleService from "../services/role/role.service";
import { sendSuccess } from "../utils/response";

class RoleController {
  asignRoleToUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;
      const { roleCodes } = req.body;
      const result = await roleService.asignRoleToUser(userId, roleCodes);
      sendSuccess(res, result, "Cập nhật chức năng người dùng thành công!");
    },
  );
}

export default new RoleController();
