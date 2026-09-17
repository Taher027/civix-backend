/*
  Warnings:

  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DonateStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_donarId_fkey";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "donates" (
    "id" TEXT NOT NULL,
    "status" "DonateStatus" NOT NULL DEFAULT 'UNPAID',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "paymentGateway" TEXT NOT NULL DEFAULT 'bkash',
    "merchantInvoiceNumber" TEXT NOT NULL,
    "bkashPaymentId" TEXT,
    "bkashTrxId" TEXT,
    "payerReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "gatewayResponse" JSONB,
    "donarId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donates_merchantInvoiceNumber_key" ON "donates"("merchantInvoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "donates_bkashPaymentId_key" ON "donates"("bkashPaymentId");

-- AddForeignKey
ALTER TABLE "donates" ADD CONSTRAINT "donates_donarId_fkey" FOREIGN KEY ("donarId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
