-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "stock" DROP NOT NULL,
ALTER TABLE "ProductVariant" ALTER COLUMN "stock" DROP DEFAULT;
