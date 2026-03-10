/*
  Warnings:

  - You are about to drop the column `receiver` on the `user_addresses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Made the column `variant_id` on table `cart_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `items_total` to the `master_orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `variant_id` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variant_name` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variant_name` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `districtId` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wardCode` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district_id` to the `user_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `user_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_id` to the `user_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ward_code` to the `user_addresses` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- Drop unique constraint first
ALTER TABLE [dbo].[cart_items] DROP CONSTRAINT [cart_items_cart_id_variant_id_key];

-- AlterTable
ALTER TABLE [dbo].[cart_items] ALTER COLUMN [variant_id] NVARCHAR(1000) NOT NULL;

-- Recreate unique constraint
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_cart_id_variant_id_key] UNIQUE NONCLUSTERED ([cart_id], [variant_id]);

-- AlterTable
ALTER TABLE [dbo].[master_orders] ADD [items_total] DECIMAL(12,2) NOT NULL,
[shipping_total] DECIMAL(12,2) NOT NULL CONSTRAINT [master_orders_shipping_total_df] DEFAULT 0;

-- AlterTable
ALTER TABLE [dbo].[order_items] ALTER COLUMN [variant_id] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[order_items] ALTER COLUMN [variant_name] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_payment_method_df] DEFAULT 'COD' FOR [payment_method];

-- AlterTable
ALTER TABLE [dbo].[product_variants] ALTER COLUMN [variant_name] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[product_variants] ALTER COLUMN [weight] FLOAT(53) NOT NULL;
ALTER TABLE [dbo].[product_variants] ADD [delete_at] DATETIME2,
[reserved_stock] INT NOT NULL CONSTRAINT [product_variants_reserved_stock_df] DEFAULT 0;

-- AlterTable
ALTER TABLE [dbo].[shops] ADD [districtId] INT NOT NULL,
[provinceId] INT NOT NULL,
[wardCode] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[user_addresses] DROP COLUMN [receiver];
ALTER TABLE [dbo].[user_addresses] ADD [district_id] INT NOT NULL,
[name] NVARCHAR(1000) NOT NULL,
[province_id] INT NOT NULL,
[ward_code] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[vouchers] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL,
    [shop_id] NVARCHAR(1000),
    [discount_type] NVARCHAR(1000) NOT NULL,
    [discount_value] DECIMAL(12,2) NOT NULL,
    [min_order_value] DECIMAL(12,2),
    [max_discount_amount] DECIMAL(12,2),
    [usage_limit] INT NOT NULL,
    [usage_count] INT NOT NULL CONSTRAINT [vouchers_usage_count_df] DEFAULT 0,
    [per_user_limit] INT NOT NULL CONSTRAINT [vouchers_per_user_limit_df] DEFAULT 1,
    [start_date] DATETIME2 NOT NULL,
    [end_date] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [vouchers_status_df] DEFAULT 'ACTIVE',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [vouchers_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [vouchers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [vouchers_code_shop_id_key] UNIQUE NONCLUSTERED ([code],[shop_id])
);

-- CreateTable
CREATE TABLE [dbo].[voucher_usages] (
    [id] NVARCHAR(1000) NOT NULL,
    [voucher_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [used_at] DATETIME2 NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [voucher_usages_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [voucher_usages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[system_settings] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [system_settings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [system_settings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [system_settings_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateIndex
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_transaction_id_key] UNIQUE NONCLUSTERED ([transaction_id]);

-- AddForeignKey
ALTER TABLE [dbo].[vouchers] ADD CONSTRAINT [vouchers_shop_id_fkey] FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[voucher_usages] ADD CONSTRAINT [voucher_usages_voucher_id_fkey] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[vouchers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
