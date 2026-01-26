import { Prisma, PrismaClient } from "../../generated/prisma/client";

export type PrismaType = PrismaClient | Prisma.TransactionClient;
