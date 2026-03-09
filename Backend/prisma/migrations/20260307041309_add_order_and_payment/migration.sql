/*
  Warnings:

  - You are about to drop the column `create_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `user_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `user_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `CategoryAttribute` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[CategoryAttribute] DROP CONSTRAINT [CategoryAttribute_attribute_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[CategoryAttribute] DROP CONSTRAINT [CategoryAttribute_category_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[attribute_values] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [attribute_values_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [attribute_values_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[attributes] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [attributes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [attributes_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[brands] ADD CONSTRAINT [brands_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[cart] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [cart_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [cart_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[cart_items] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [cart_items_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [cart_items_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[permissions] ADD CONSTRAINT [permissions_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[product_attributes] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [product_attributes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [product_attributes_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[roles] DROP CONSTRAINT [roles_create_at_df];
ALTER TABLE [dbo].[roles] DROP CONSTRAINT [roles_update_at_df];

ALTER TABLE [dbo].[roles] DROP COLUMN [create_at];
ALTER TABLE [dbo].[roles] DROP COLUMN [update_at];

ALTER TABLE [dbo].[roles] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [roles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [roles_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[shops] ADD CONSTRAINT [shops_updated_at_df] DEFAULT CURRENT_TIMESTAMP FOR [updated_at];

-- AlterTable
ALTER TABLE [dbo].[user_addresses] DROP CONSTRAINT [user_addresses_create_at_df];
ALTER TABLE [dbo].[user_addresses] DROP CONSTRAINT [user_addresses_update_at_df];

ALTER TABLE [dbo].[user_addresses] DROP COLUMN [create_at];
ALTER TABLE [dbo].[user_addresses] DROP COLUMN [update_at];

ALTER TABLE [dbo].[user_addresses] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [user_addresses_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [user_addresses_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[user_roles] DROP CONSTRAINT [user_roles_create_at_df];
ALTER TABLE [dbo].[user_roles] DROP COLUMN [create_at];

ALTER TABLE [dbo].[user_roles] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [user_roles_created_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_create_at_df];
ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_update_at_df];

ALTER TABLE [dbo].[users] DROP COLUMN [create_at];
ALTER TABLE [dbo].[users] DROP COLUMN [update_at];

ALTER TABLE [dbo].[users] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [users_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE [dbo].[CategoryAttribute];

-- CreateTable
CREATE TABLE [dbo].[category_attribute] (
    [id] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    [attribute_id] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [category_attribute_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [category_attribute_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [category_attribute_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[master_orders] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [order_code] NVARCHAR(1000) NOT NULL,
    [original_total_amount] DECIMAL(12,2) NOT NULL,
    [platform_discount] DECIMAL(12,2) NOT NULL CONSTRAINT [master_orders_platform_discount_df] DEFAULT 0,
    [total_amount] DECIMAL(12,2) NOT NULL CONSTRAINT [master_orders_total_amount_df] DEFAULT 0,
    [receiver_name] NVARCHAR(1000) NOT NULL,
    [receiver_phone] NVARCHAR(1000) NOT NULL,
    [receiver_address] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [master_orders_status_df] DEFAULT 'PENDING_PAYMENT',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [master_orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [master_orders_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [master_orders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [master_orders_order_code_key] UNIQUE NONCLUSTERED ([order_code])
);

-- CreateTable
CREATE TABLE [dbo].[sub_orders] (
    [id] NVARCHAR(1000) NOT NULL,
    [master_order_id] NVARCHAR(1000) NOT NULL,
    [shop_id] NVARCHAR(1000) NOT NULL,
    [sub_order_code] NVARCHAR(1000) NOT NULL,
    [items_total] DECIMAL(12,2) NOT NULL,
    [shipping_fee] DECIMAL(12,2) NOT NULL CONSTRAINT [sub_orders_shipping_fee_df] DEFAULT 0,
    [discount_amount] DECIMAL(12,2) NOT NULL CONSTRAINT [sub_orders_discount_amount_df] DEFAULT 0,
    [commission_amount] DECIMAL(12,2) NOT NULL CONSTRAINT [sub_orders_commission_amount_df] DEFAULT 0,
    [real_amount] DECIMAL(12,2) NOT NULL CONSTRAINT [sub_orders_real_amount_df] DEFAULT 0,
    [total_amount] DECIMAL(12,2) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [sub_orders_status_df] DEFAULT 'PENDING_PAYMENT',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [sub_orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [sub_orders_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [sub_orders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [sub_orders_sub_order_code_key] UNIQUE NONCLUSTERED ([sub_order_code])
);

-- CreateTable
CREATE TABLE [dbo].[order_items] (
    [id] NVARCHAR(1000) NOT NULL,
    [sub_order_id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [variant_id] NVARCHAR(1000),
    [quantity] INT NOT NULL,
    [price] DECIMAL(12,2) NOT NULL,
    [product_name] NVARCHAR(1000) NOT NULL,
    [variant_name] NVARCHAR(1000),
    [total_price] DECIMAL(12,2) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [order_items_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [order_items_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[payments] (
    [id] NVARCHAR(1000) NOT NULL,
    [master_order_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [payment_method] NVARCHAR(1000) NOT NULL,
    [total_amount] DECIMAL(12,2) NOT NULL,
    [transaction_id] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [payments_status_df] DEFAULT 'PENDING',
    [paid_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [payments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [payments_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [payments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[payment_allocations] (
    [id] NVARCHAR(1000) NOT NULL,
    [payment_id] NVARCHAR(1000) NOT NULL,
    [sub_order_id] NVARCHAR(1000) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [refunded_amount] DECIMAL(12,2) NOT NULL CONSTRAINT [payment_allocations_refunded_amount_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [payment_allocations_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [payment_allocations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [payment_allocations_payment_id_sub_order_id_key] UNIQUE NONCLUSTERED ([payment_id],[sub_order_id])
);

-- CreateTable
CREATE TABLE [dbo].[refunds] (
    [id] NVARCHAR(1000) NOT NULL,
    [sub_order_id] NVARCHAR(1000) NOT NULL,
    [payment_id] NVARCHAR(1000),
    [amount] DECIMAL(12,2) NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [refunds_status_df] DEFAULT 'REQUESTED',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [refunds_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [refunds_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [refunds_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sub_orders_shop_id_created_at_idx] ON [dbo].[sub_orders]([shop_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [payments_paid_at_idx] ON [dbo].[payments]([paid_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refunds_sub_order_id_created_at_idx] ON [dbo].[refunds]([sub_order_id], [created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[category_attribute] ADD CONSTRAINT [category_attribute_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[category_attribute] ADD CONSTRAINT [category_attribute_attribute_id_fkey] FOREIGN KEY ([attribute_id]) REFERENCES [dbo].[attributes]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[master_orders] ADD CONSTRAINT [master_orders_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sub_orders] ADD CONSTRAINT [sub_orders_master_order_id_fkey] FOREIGN KEY ([master_order_id]) REFERENCES [dbo].[master_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sub_orders] ADD CONSTRAINT [sub_orders_shop_id_fkey] FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_sub_order_id_fkey] FOREIGN KEY ([sub_order_id]) REFERENCES [dbo].[sub_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_master_order_id_fkey] FOREIGN KEY ([master_order_id]) REFERENCES [dbo].[master_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payment_allocations] ADD CONSTRAINT [payment_allocations_payment_id_fkey] FOREIGN KEY ([payment_id]) REFERENCES [dbo].[payments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payment_allocations] ADD CONSTRAINT [payment_allocations_sub_order_id_fkey] FOREIGN KEY ([sub_order_id]) REFERENCES [dbo].[sub_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[refunds] ADD CONSTRAINT [refunds_sub_order_id_fkey] FOREIGN KEY ([sub_order_id]) REFERENCES [dbo].[sub_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
