import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import roleService from "../services/role/role.service";
import { sendSuccess } from "../utils/response";
import { UserRole } from "../constants";
import { prisma } from "../config/prisma";
import { CreateRole } from "../repositories/role.repository";
import { ValidationError } from "../error/AppError";

class RoleController {
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, name, description } = req.body;
    if (!code) throw new ValidationError("Vui lòng cung cấp mã chức năng!");
    if (!name) throw new ValidationError("Vui lòng cung cấp tên chức năng!");

    const result = await roleService.create({ code, name, description });
    sendSuccess(res, result, "Tạo chức năng người dùng thành công!");
  });

  getAllRoles = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await roleService.getAllRoles();
      sendSuccess(res, result, "Lấy chức năng người dùng thành công!");
    },
  );

  updateRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.id as string;
      const { name, description, status } = req.body;
      const result = await roleService.updateRole(roleId, {
        name,
        description,
        status,
      });
      sendSuccess(res, result, "Cập nhật thông tin chức năng thành công!");
    },
  );

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const roleId = req.params.id as string;
    const result = await roleService.delete(roleId);
    sendSuccess(res, result, "Xóa chức năng thành công!");
  });

  asignRoleToUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;
      const { roleCodes } = req.body;
      const result = await roleService.asignRoleToUser(
        prisma,
        userId,
        roleCodes,
      );
      sendSuccess(res, result, "Cập nhật chức năng người dùng thành công!");
    },
  );

  revokeRoleFromUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;
      const { roleCodes } = req.body;

      const result = await roleService.revokeRoleFromUser(userId, roleCodes);
      sendSuccess(res, result, "Cập nhật chức năng người dùng thành công!");
    },
  );
}

export default new RoleController();
