import { Prisma } from "../../generated/prisma/client";

export const selectSystemSetting = {
  id: true,
  key: true,
  value: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SystemSettingSelect;

export type SystemResult = Prisma.SystemSettingGetPayload<{
  select: typeof selectSystemSetting;
}>;
