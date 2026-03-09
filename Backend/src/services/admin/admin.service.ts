import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import cacheTag from "../../cache/cache.tag";
import {
  CreateSystemSettingRequestDto,
  SystemSettingResponseDto,
  toSystemSettingResponse,
  UpdateSystemSettingRequestDto,
} from "../../dtos";
import { ConflictError, NotFoundError } from "../../error/AppError";
import systemSettingRepository from "../../repositories/systemSetting.repository";
import { cacheAsync } from "../../utils/cache";

class AdminService {
  getSetting = async (key: string, defaultValue: string): Promise<string> => {
    return cacheAsync(
      CacheKey.system(key),
      CacheTTL.system,
      [`system:${key}`],
      async () => {
        const setting = await systemSettingRepository.getByKey(key);
        const data = setting?.value ?? defaultValue;
        return { data };
      },
    );
  };

  getSystemSettings = async (): Promise<SystemSettingResponseDto[]> => {
    return cacheAsync(
      CacheKey.system("list"),
      CacheTTL.system,
      ["system:list"],
      async () => {
        const settings = await systemSettingRepository.getAll();
        return { data: settings.map(toSystemSettingResponse) };
      },
    );
  };

  createSystemSetting = async (
    _adminId: string,
    data: CreateSystemSettingRequestDto,
  ): Promise<SystemSettingResponseDto> => {
    const existed = await systemSettingRepository.getByKey(data.key);
    if (existed) {
      throw new ConflictError("System setting already exists");
    }

    const setting = await systemSettingRepository.create(data);
    await Promise.all([
      cacheTag.invalidateTag(`system:${data.key}`),
      cacheTag.invalidateTag("system:list"),
    ]);
    return toSystemSettingResponse(setting);
  };

  updateSystemSetting = async (
    _adminId: string,
    key: string,
    data: UpdateSystemSettingRequestDto,
  ): Promise<SystemSettingResponseDto> => {
    const existed = await systemSettingRepository.getByKey(key);
    if (!existed) {
      throw new NotFoundError("System setting not found");
    }

    const setting = await systemSettingRepository.updateByKey(key, data);
    await Promise.all([
      cacheTag.invalidateTag(`system:${key}`),
      cacheTag.invalidateTag("system:list"),
    ]);

    return toSystemSettingResponse(setting);
  };

  deleteSystemSetting = async (
    _adminId: string,
    key: string,
  ): Promise<SystemSettingResponseDto> => {
    const setting = await systemSettingRepository.getByKey(key);
    if (!setting) {
      throw new NotFoundError("System setting not found");
    }

    await systemSettingRepository.deleteByKey(key);
    await Promise.all([
      cacheTag.invalidateTag(`system:${key}`),
      cacheTag.invalidateTag("system:list"),
    ]);

    return toSystemSettingResponse(setting);
  };
}

export default new AdminService();
