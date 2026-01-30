BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[permissions] ADD [status] NVARCHAR(1000) NOT NULL CONSTRAINT [permissions_status_df] DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE [dbo].[user_permissions] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [permission_id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_permissions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [user_permissions_pkey] PRIMARY KEY CLUSTERED ([user_id],[permission_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[user_permissions] ADD CONSTRAINT [user_permissions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[user_permissions] ADD CONSTRAINT [user_permissions_permission_id_fkey] FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
