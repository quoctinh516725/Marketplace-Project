import { SystemResult } from "../../types";
import { SystemSettingResponseDto } from "./system.response.dto";

export const toSystemSettingResponse = (
  setting: SystemResult,
): SystemSettingResponseDto => {
  return {
    id: setting.id,
    key: setting.key,
    value: setting.value,
    description: setting.description,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
  };
};
