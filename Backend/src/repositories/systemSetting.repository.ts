import { prisma } from "../config/prisma";
import { selectSystemSetting, SystemResult } from "../types";

export interface CreateSystemSettingData {
  key: string;
  value: string;
  description?: string;
}

export interface UpdateSystemSettingData {
  value: string;
  description?: string | null;
}

class SystemSettingRepository {
  getAll = async (): Promise<SystemResult[]> => {
    return prisma.systemSetting.findMany({
      select: selectSystemSetting,
      orderBy: { key: "asc" },
    });
  };

  getByKey = async (key: string): Promise<SystemResult | null> => {
    return prisma.systemSetting.findUnique({
      where: { key },
      select: selectSystemSetting,
    });
  };

  create = async (data: CreateSystemSettingData): Promise<SystemResult> => {
    return prisma.systemSetting.create({
      data: {
        key: data.key,
        value: data.value,
        description: data.description,
      },
      select: selectSystemSetting,
    });
  };

  updateByKey = async (
    key: string,
    data: UpdateSystemSettingData,
  ): Promise<SystemResult> => {
    return prisma.systemSetting.update({
      where: { key },
      data: {
        value: data.value,
        description: data.description ?? null,
      },
      select: selectSystemSetting,
    });
  };

  deleteByKey = async (key: string): Promise<SystemResult> => {
    return prisma.systemSetting.delete({
      where: { key },
      select: selectSystemSetting,
    });
  };
}

export default new SystemSettingRepository();
