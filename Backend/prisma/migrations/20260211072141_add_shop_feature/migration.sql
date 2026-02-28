BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Shop] (
    [id] NVARCHAR(1000) NOT NULL,
    [seller_id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [logo_url] NVARCHAR(1000),
    [background_url] NVARCHAR(1000),
    [total_products] INT NOT NULL CONSTRAINT [Shop_total_products_df] DEFAULT 0,
    [total_orders] INT NOT NULL CONSTRAINT [Shop_total_orders_df] DEFAULT 0,
    [total_reviews] INT NOT NULL CONSTRAINT [Shop_total_reviews_df] DEFAULT 0,
    [commission_rate] DECIMAL(5,4),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Shop_status_df] DEFAULT 'PENDING_APPROVE',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Shop_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [Shop_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Shop_seller_id_key] UNIQUE NONCLUSTERED ([seller_id]),
    CONSTRAINT [Shop_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- AddForeignKey
ALTER TABLE [dbo].[Shop] ADD CONSTRAINT [Shop_seller_id_fkey] FOREIGN KEY ([seller_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
