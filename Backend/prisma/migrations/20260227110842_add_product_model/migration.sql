/*
  Warnings:

  - You are about to drop the column `PENDING_APPROVE` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `product_tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `products` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[product_tags] DROP CONSTRAINT [product_tags_product_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[products] DROP CONSTRAINT [products_category_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[product_variants] DROP CONSTRAINT [product_variants_status_df];
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_status_df] DEFAULT 'PENDING_APPROVE' FOR [status];

-- AlterTable
ALTER TABLE [dbo].[products] ALTER COLUMN [brand_id] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[products] DROP COLUMN [PENDING_APPROVE],
[category_id];
ALTER TABLE [dbo].[products] ADD [code] NVARCHAR(1000) NOT NULL,
[delete_at] DATETIME2,
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [products_status_df] DEFAULT 'PENDING_APPROVE';

-- DropTable
DROP TABLE [dbo].[product_tags];

-- CreateTable
CREATE TABLE [dbo].[tags] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [tags_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ProductTag] (
    [id] NVARCHAR(1000) NOT NULL,
    [tag_id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ProductTag_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ProductCategory] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ProductCategory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_code_key] UNIQUE NONCLUSTERED ([code]);

-- AddForeignKey
ALTER TABLE [dbo].[ProductTag] ADD CONSTRAINT [ProductTag_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProductTag] ADD CONSTRAINT [ProductTag_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProductCategory] ADD CONSTRAINT [ProductCategory_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ProductCategory] ADD CONSTRAINT [ProductCategory_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
