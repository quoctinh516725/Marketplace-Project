import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import roleService from "../services/role/role.service";
import { sendSuccess } from "../utils/response";
import { prisma } from "../config/prisma";
import {
  createRoleRequestDto,
  updateRoleRequestDto,
  validateRoleToUserRequestDto,
} from "../dtos";
import { ValidationError } from "../error/AppError";

class RoleController {
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dataValidated = createRoleRequestDto(req.body);

    const result = await roleService.create(dataValidated);
    sendSuccess(res, result, "Tạo chức năng người dùng thành công!");
  });

  getAllRoles = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await roleService.getAllRoles();
      sendSuccess(res, result, "Lấy chức năng người dùng thành công!");
    },
  );

  getRoleById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.id as string;
      const result = await roleService.getRoleById(roleId);
      sendSuccess(res, result, "Lấy chức năng thành công!");
    },
  );

  updateRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.id as string;
      const dataValidated = updateRoleRequestDto(req.body);

      const result = await roleService.updateRole(roleId, dataValidated);
      sendSuccess(res, result, "Cập nhật thông tin chức năng thành công!");
    },
  );

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const roleId = req.params.id as string;
    const result = await roleService.delete(roleId);
    sendSuccess(res, result, "Xóa chức năng thành công!");
  });

  assignRoleToUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { roleCodes } = req.body;
      const dataValidated = validateRoleToUserRequestDto(roleCodes);

      const result = await roleService.assignRoleToUser(
        prisma,
        userId,
        dataValidated,
      );
      sendSuccess(res, result, "Cập nhật chức năng người dùng thành công!");
    },
  );

  revokeRoleFromUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { roleCodes } = req.body;
      const dataValidated = validateRoleToUserRequestDto(roleCodes);

      const result = await roleService.revokeRoleFromUser(
        userId,
        dataValidated,
      );
      sendSuccess(res, result, "Cập nhật chức năng người dùng thành công!");
    },
  );
}

export default new RoleController();
