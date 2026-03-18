/*
  Warnings:

  - You are about to drop the column `type` on the `conversations` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[conversations] DROP COLUMN [type];

-- CreateTable
CREATE TABLE [dbo].[product_reviews] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [order_item_id] NVARCHAR(1000) NOT NULL,
    [rating] INT NOT NULL,
    [comment] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [product_reviews_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [product_reviews_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_reviews_order_item_id_key] UNIQUE NONCLUSTERED ([order_item_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[product_reviews] ADD CONSTRAINT [product_reviews_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_reviews] ADD CONSTRAINT [product_reviews_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_reviews] ADD CONSTRAINT [product_reviews_order_item_id_fkey] FOREIGN KEY ([order_item_id]) REFERENCES [dbo].[order_items]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
