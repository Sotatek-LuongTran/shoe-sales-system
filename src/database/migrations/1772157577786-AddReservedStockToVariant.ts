import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservedStockToVariant1772157577786 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product_variants"
ADD COLUMN "reserved_stock" INTEGER NOT NULL DEFAULT 0;
          `);
    await queryRunner.query(`
            ALTER TABLE "product_variants"
ADD CONSTRAINT "ck_reserved_stock_non_negative"
CHECK (reserved_stock >= 0);
          `);
          await queryRunner.query(`
            ALTER TABLE "product_variants"
ADD CONSTRAINT "ck_reserved_not_exceed_stock"
CHECK (reserved_stock <= stock);
          `);
  }
  

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product_variants"
DROP COLUMN "reserved_stock"
      `);
  }
}
