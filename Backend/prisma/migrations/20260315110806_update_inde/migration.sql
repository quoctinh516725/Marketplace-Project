/*
  Warnings:

  - You are about to drop the column `delete_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTag` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ProductCategory] DROP CONSTRAINT [ProductCategory_category_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ProductCategory] DROP CONSTRAINT [ProductCategory_product_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ProductTag] DROP CONSTRAINT [ProductTag_product_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ProductTag] DROP CONSTRAINT [ProductTag_tag_id_fkey];

-- DropIndex
DROP INDEX [refunds_sub_order_id_created_at_idx] ON [dbo].[refunds];

-- DropIndex
DROP INDEX [sub_orders_shop_id_created_at_idx] ON [dbo].[sub_orders];

-- AlterTable
ALTER TABLE [dbo].[products] DROP COLUMN [delete_at];
ALTER TABLE [dbo].[products] ADD [deleted_at] DATETIME2;

-- DropTable
DROP TABLE [dbo].[ProductCategory];

-- DropTable
DROP TABLE [dbo].[ProductTag];

-- CreateTable
CREATE TABLE [dbo].[product_tags] (
    [id] NVARCHAR(1000) NOT NULL,
    [tag_id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [product_tags_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_tags_tag_id_product_id_key] UNIQUE NONCLUSTERED ([tag_id],[product_id])
);

-- CreateTable
CREATE TABLE [dbo].[product_categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [product_categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_categories_category_id_product_id_key] UNIQUE NONCLUSTERED ([category_id],[product_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_categories_product_id_idx] ON [dbo].[product_categories]([product_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [attribute_values_attribute_id_idx] ON [dbo].[attribute_values]([attribute_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [cart_user_id_idx] ON [dbo].[cart]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [category_attribute_category_id_attribute_id_idx] ON [dbo].[category_attribute]([category_id], [attribute_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conversation_participants_user_id_idx] ON [dbo].[conversation_participants]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conversation_participants_conversation_id_idx] ON [dbo].[conversation_participants]([conversation_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [master_orders_user_id_status_created_at_idx] ON [dbo].[master_orders]([user_id], [status], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [messages_conversation_id_created_at_idx] ON [dbo].[messages]([conversation_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [messages_conversation_id_is_read_idx] ON [dbo].[messages]([conversation_id], [is_read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notifications_user_id_is_read_idx] ON [dbo].[notifications]([user_id], [is_read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [order_items_sub_order_id_idx] ON [dbo].[order_items]([sub_order_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [order_items_product_id_idx] ON [dbo].[order_items]([product_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [payments_master_order_id_idx] ON [dbo].[payments]([master_order_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_attributes_product_variant_id_idx] ON [dbo].[product_attributes]([product_variant_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_images_product_id_sort_order_idx] ON [dbo].[product_images]([product_id], [sort_order]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_reviews_product_id_created_at_idx] ON [dbo].[product_reviews]([product_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_variants_product_id_idx] ON [dbo].[product_variants]([product_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_shop_id_deleted_at_name_idx] ON [dbo].[products]([shop_id], [deleted_at], [name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_status_deleted_at_name_idx] ON [dbo].[products]([status], [deleted_at], [name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refresh_tokens_user_id_revoked_idx] ON [dbo].[refresh_tokens]([user_id], [revoked]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refunds_sub_order_id_idx] ON [dbo].[refunds]([sub_order_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refunds_payment_id_idx] ON [dbo].[refunds]([payment_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [role_permissions_permission_id_idx] ON [dbo].[role_permissions]([permission_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [shops_status_created_at_idx] ON [dbo].[shops]([status], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sub_orders_shop_id_status_created_at_idx] ON [dbo].[sub_orders]([shop_id], [status], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sub_orders_master_order_id_idx] ON [dbo].[sub_orders]([master_order_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_status_created_at_idx] ON [dbo].[users]([status], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [voucher_usages_user_id_voucher_id_idx] ON [dbo].[voucher_usages]([user_id], [voucher_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [vouchers_shop_id_created_at_idx] ON [dbo].[vouchers]([shop_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [vouchers_type_created_at_idx] ON [dbo].[vouchers]([type], [created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[product_tags] ADD CONSTRAINT [product_tags_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_tags] ADD CONSTRAINT [product_tags_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_categories] ADD CONSTRAINT [product_categories_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[product_categories] ADD CONSTRAINT [product_categories_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_variant_id_fkey] FOREIGN KEY ([variant_id]) REFERENCES [dbo].[product_variants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[voucher_usages] ADD CONSTRAINT [voucher_usages_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
