/*
  Warnings:

  - Made the column `payment_id` on table `refunds` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[order_items] ADD [image_url] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[refunds] ALTER COLUMN [payment_id] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[sub_orders] ADD [current_payment_id] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[user_addresses] ALTER COLUMN [is_default] BIT NULL;
ALTER TABLE [dbo].[user_addresses] ADD CONSTRAINT [user_addresses_is_default_df] DEFAULT 0 FOR [is_default];

-- CreateTable
CREATE TABLE [dbo].[conversations] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [conversations_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [conversations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[conversation_participants] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [conversation_id] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [conversation_participants_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [conversation_participants_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [conversation_id] NVARCHAR(1000) NOT NULL,
    [sender_id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [messages_type_df] DEFAULT 'TEXT',
    [is_read] BIT NOT NULL CONSTRAINT [messages_is_read_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [messages_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [is_read] BIT NOT NULL CONSTRAINT [notifications_is_read_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [notifications_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[refunds] ADD CONSTRAINT [refunds_payment_id_fkey] FOREIGN KEY ([payment_id]) REFERENCES [dbo].[payments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversation_participants] ADD CONSTRAINT [conversation_participants_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[conversation_participants] ADD CONSTRAINT [conversation_participants_conversation_id_fkey] FOREIGN KEY ([conversation_id]) REFERENCES [dbo].[conversations]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_conversation_id_fkey] FOREIGN KEY ([conversation_id]) REFERENCES [dbo].[conversations]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_sender_id_fkey] FOREIGN KEY ([sender_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[notifications] ADD CONSTRAINT [notifications_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
