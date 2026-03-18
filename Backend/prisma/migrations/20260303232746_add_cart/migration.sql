BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[cart] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [cart_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_user_id_key] UNIQUE NONCLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[cart_items] (
    [id] NVARCHAR(1000) NOT NULL,
    [cart_id] NVARCHAR(1000) NOT NULL,
    [product_id] NVARCHAR(1000) NOT NULL,
    [variant_id] NVARCHAR(1000),
    [quantity] INT NOT NULL,
    CONSTRAINT [cart_items_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_items_cart_id_variant_id_key] UNIQUE NONCLUSTERED ([cart_id],[variant_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[cart] ADD CONSTRAINT [cart_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_variant_id_fkey] FOREIGN KEY ([variant_id]) REFERENCES [dbo].[product_variants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_cart_id_fkey] FOREIGN KEY ([cart_id]) REFERENCES [dbo].[cart]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
