-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MEN', 'WOMEN', 'KIDS', 'UNISEX');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gender" "GenderType" NOT NULL DEFAULT 'UNISEX';

-- CreateIndex
CREATE INDEX "Product_gender_idx" ON "Product"("gender");
