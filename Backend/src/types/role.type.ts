import { Prisma } from "../../generated/prisma/client";

export type RoleBasicResult = {
  id: string;
  code: string;
  name: string;
  status: string;
};

export type RoleDetailResult = Prisma.RoleGetPayload<{
  select: {
    id: true;
    code: true;
    name: true;
    status: true;
    description: true;
    rolePermissions: {
      select: {
        permission: {
          select: {
            code: true;
          };
        };
      };
    };
  };
}>;
