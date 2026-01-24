/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[roles] DROP CONSTRAINT [roles_status_df];
ALTER TABLE [dbo].[roles] ALTER COLUMN [status] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[roles] ADD CONSTRAINT [roles_status_df] DEFAULT 'ACTIVE' FOR [status];

-- CreateIndex
ALTER TABLE [dbo].[roles] ADD CONSTRAINT [roles_code_key] UNIQUE NONCLUSTERED ([code]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
