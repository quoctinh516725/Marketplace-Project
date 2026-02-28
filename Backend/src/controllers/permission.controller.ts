import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import permissionService from "../services/permission/permission.service";
import { sendSuccess } from "../utils/response";
import {
  createPermissionRequestDto,
  updatePermissionRequestDto,
  validatePermissionRequestDto,
} from "../dtos";

class PermissionController {
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dataValidated = createPermissionRequestDto(req.body);
    const result = await permissionService.create(dataValidated);
    sendSuccess(res, result, "Tạo quyền thành công!");
  });
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.pagination!;

    const result = await permissionService.getAll({
      page,
      limit,
      status: req.query.status as string,
      search: req.query.search as string,
    });

    sendSuccess(res, result, "Lấy danh sách quyền thành công!");
  });
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const permissionId = req.params.id as string;
    const result = await permissionService.delete(permissionId);
    sendSuccess(res, result, "Xóa quyền thành công!");
  });
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const permissionId = req.params.id as string;
    const dataValidated = updatePermissionRequestDto(req.body);
    const result = await permissionService.update(permissionId, dataValidated);
    sendSuccess(res, result, "Cập nhật quyền thành công!");
  });

  assignPermissionToRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.roleId as string;
      const { permissions } = req.body;
      const dataValidated = validatePermissionRequestDto(permissions);
      const result = await permissionService.assignPermissionToRole(
        roleId,
        dataValidated,
      );
      sendSuccess(res, result, "Gán quyền cho chức năng thành công!");
    },
  );
  removePermissionFromRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.roleId as string;
      const { permissions } = req.body;
      const dataValidated = validatePermissionRequestDto(permissions);

      const result = await permissionService.removePermissionFromRole(
        roleId,
        dataValidated,
      );
      sendSuccess(res, result, "Xóa quyền của chức năng thành công!");
    },
  );
  assignPermissionToUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { permissions } = req.body;
      const dataValidated = validatePermissionRequestDto(permissions);

      const result = await permissionService.assignPermissionToUser(
        userId,
        dataValidated,
      );
      sendSuccess(res, result, "Gán quyền cho người dùng thành công!");
    },
  );
  removePermissionFromUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { permissions } = req.body;
      const dataValidated = validatePermissionRequestDto(permissions);

      const result = await permissionService.removePermissionFromUser(
        userId,
        dataValidated,
      );
      sendSuccess(res, result, "Xóa quyền của người dùng thành công!");
    },
  );
}

export default new PermissionController();
