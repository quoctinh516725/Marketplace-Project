import { RoleStatus } from "../../constants/roleStatus";

export type RoleDetailResponseDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  permissions: string[];
};

export type RoleBasicResponseDto = {
  id: string;
  code: string;
  name: string;
  status: RoleStatus;
};
