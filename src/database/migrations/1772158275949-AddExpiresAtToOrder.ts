import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpiresAtToOrder1772158275949 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "orders"
ADD COLUMN "expires_at" TIMESTAMPTZ
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_variants"
    DROP COLUMN "expires_at"
          `);
    }

}
