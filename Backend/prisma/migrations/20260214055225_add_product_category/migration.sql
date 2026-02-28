/*
  Warnings:

  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Shop] DROP CONSTRAINT [Shop_seller_id_fkey];

-- DropTable
DROP TABLE [dbo].[Shop];

-- CreateTable
CREATE TABLE [dbo].[shops] (
    [id] NVARCHAR(1000) NOT NULL,
    [seller_id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [logo_url] NVARCHAR(1000),
    [background_url] NVARCHAR(1000),
    [total_products] INT NOT NULL CONSTRAINT [shops_total_products_df] DEFAULT 0,
    [total_orders] INT NOT NULL CONSTRAINT [shops_total_orders_df] DEFAULT 0,
    [total_reviews] INT NOT NULL CONSTRAINT [shops_total_reviews_df] DEFAULT 0,
    [commission_rate] DECIMAL(5,4),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [shops_status_df] DEFAULT 'PENDING_APPROVE',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [shops_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [shops_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [shops_seller_id_key] UNIQUE NONCLUSTERED ([seller_id]),
    CONSTRAINT [shops_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [parent_id] NVARCHAR(1000),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [level] INT NOT NULL CONSTRAINT [categories_level_df] DEFAULT 0,
    [sort_order] INT NOT NULL CONSTRAINT [categories_sort_order_df] DEFAULT 0,
    [is_active] BIT NOT NULL CONSTRAINT [categories_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [categories_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [categories_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[brands] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [logo_url] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [brands_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [brands_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [brands_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[products] (
    [id] NVARCHAR(1000) NOT NULL,
    [shop_id] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    [brand_id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [thumbnail_url] NVARCHAR(1000) NOT NULL,
    [original_price] DECIMAL(32,16),
    [sold_count] INT NOT NULL CONSTRAINT [products_sold_count_df] DEFAULT 0,
    [rating] FLOAT(53) CONSTRAINT [products_rating_df] DEFAULT 0,
    [PENDING_APPROVE] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [products_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [products_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [products_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[product_images] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [image_url] NVARCHAR(1000) NOT NULL,
    [sort_order] INT NOT NULL CONSTRAINT [product_images_sort_order_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [product_images_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [product_images_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[product_variants] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [sku] NVARCHAR(1000) NOT NULL,
    [variant_name] NVARCHAR(1000),
    [image_url] NVARCHAR(1000),
    [price] DECIMAL(32,16) NOT NULL,
    [stock] INT NOT NULL,
    [weight] FLOAT(53),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [product_variants_status_df] DEFAULT 'ACTIVE',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [product_variants_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [product_variants_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_variants_sku_key] UNIQUE NONCLUSTERED ([sku])
);

-- CreateTable
CREATE TABLE [dbo].[attributes] (
    [id] NVARCHAR(1000) NOT NULL,
    [attribute_name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    CONSTRAINT [attributes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [attributes_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[attribute_values] (
    [id] NVARCHAR(1000) NOT NULL,
    [attribute_id] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [attribute_values_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CategoryAttribute] (
    [id] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    [attribute_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [CategoryAttribute_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[product_attributes] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_variant_id] NVARCHAR(1000) NOT NULL,
    [attribute_id] NVARCHAR(1000) NOT NULL,
    [attribute_value_id] NVARCHAR(1000),
    CONSTRAINT [product_attributes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[product_tags] (
    [id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [tag] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [product_tags_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[shops] ADD CONSTRAINT [shops_seller_id_fkey] FOREIGN KEY ([seller_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_shop_id_fkey] FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_brand_id_fkey] FOREIGN KEY ([brand_id]) REFERENCES [dbo].[brands]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[product_images] ADD CONSTRAINT [product_images_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[attribute_values] ADD CONSTRAINT [attribute_values_attribute_id_fkey] FOREIGN KEY ([attribute_id]) REFERENCES [dbo].[attributes]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CategoryAttribute] ADD CONSTRAINT [CategoryAttribute_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CategoryAttribute] ADD CONSTRAINT [CategoryAttribute_attribute_id_fkey] FOREIGN KEY ([attribute_id]) REFERENCES [dbo].[attributes]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[product_attributes] ADD CONSTRAINT [product_attributes_product_variant_id_fkey] FOREIGN KEY ([product_variant_id]) REFERENCES [dbo].[product_variants]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_attributes] ADD CONSTRAINT [product_attributes_attribute_id_fkey] FOREIGN KEY ([attribute_id]) REFERENCES [dbo].[attributes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_attributes] ADD CONSTRAINT [product_attributes_attribute_value_id_fkey] FOREIGN KEY ([attribute_value_id]) REFERENCES [dbo].[attribute_values]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_tags] ADD CONSTRAINT [product_tags_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
