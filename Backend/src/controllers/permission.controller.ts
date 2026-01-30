import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import permissionService from "../services/permission/permission.service";
import { sendSuccess } from "../utils/response";

class PermissionController {
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, description } = req.body;
    const result = await permissionService.create({ code, description });
    sendSuccess(res, result, "Tạo quyền thành công!");
  });
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const status = (req.query.status as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await permissionService.getAll({
      page,
      limit,
      status,
      search,
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
    const { code, status, description } = req.body;
    const result = await permissionService.update(permissionId, {
      code,
      status,
      description,
    });
    sendSuccess(res, result, "Xóa quyền thành công!");
  });

  assignPermissionToRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.roleId as string;
      const { permissions } = req.body;
      const result = await permissionService.assignPermissionToRole(
        roleId,
        permissions,
      );
      sendSuccess(res, result, "Gán quyền cho chức năng thành công!");
    },
  );
  removePermissionFromRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roleId = req.params.roleId as string;
      const { permissions } = req.body;
      const result = await permissionService.removePermissionFromRole(
        roleId,
        permissions,
      );
      sendSuccess(res, result, "Xóa quyền của chức năng thành công!");
    },
  );
  assignPermissionToUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { permissions } = req.body;
      const result = await permissionService.assignPermissionToUser(
        userId,
        permissions,
      );
      sendSuccess(res, result, "Gán quyền cho người dùng thành công!");
    },
  );
  removePermissionFromUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.userId as string;
      const { permissions } = req.body;
      const result = await permissionService.removePermissionFromUser(
        userId,
        permissions,
      );
      sendSuccess(res, result, "Xóa quyền của người dùng thành công!");
    },
  );
}

export default new PermissionController();
