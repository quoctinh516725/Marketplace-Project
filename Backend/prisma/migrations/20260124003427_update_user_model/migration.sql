/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[users] ALTER COLUMN [username] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[users] ALTER COLUMN [last_login_at] DATETIME2 NULL;

-- CreateIndex
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
