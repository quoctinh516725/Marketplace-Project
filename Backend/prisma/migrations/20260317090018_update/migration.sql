BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[users] ALTER COLUMN [password] NVARCHAR(1000) NULL;

-- CreateTable
CREATE TABLE [dbo].[oauth_accounts] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [provider_user_id] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [oauth_accounts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [oauth_accounts_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [oauth_accounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [oauth_accounts_provider_provider_user_id_key] UNIQUE NONCLUSTERED ([provider],[provider_user_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [oauth_accounts_user_id_idx] ON [dbo].[oauth_accounts]([user_id]);

-- AddForeignKey
ALTER TABLE [dbo].[oauth_accounts] ADD CONSTRAINT [oauth_accounts_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
