-- CreateTable
CREATE TABLE "_ProductCoupons" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductCoupons_AB_unique" ON "_ProductCoupons"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductCoupons_B_index" ON "_ProductCoupons"("B");

-- AddForeignKey
ALTER TABLE "_ProductCoupons" ADD CONSTRAINT "_ProductCoupons_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCoupons" ADD CONSTRAINT "_ProductCoupons_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
