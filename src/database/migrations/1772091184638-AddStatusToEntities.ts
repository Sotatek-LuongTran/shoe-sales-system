import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToEntities1772091184638 implements MigrationInterface {
  name = 'AddStatusToEntities1772091184638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TYPE "brand_status_enum" AS ENUM ('active', 'inactive')
        `);
    await queryRunner.query(`
            ALTER TABLE "brands"
            ADD COLUMN "status" "brand_status_enum" NOT NULL DEFAULT 'active'
          `);

    await queryRunner.query(`
            CREATE TYPE "category_status_enum" AS ENUM ('active', 'inactive')
          `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD COLUMN "status" "category_status_enum" NOT NULL DEFAULT 'active'
          `);

    await queryRunner.query(`
            CREATE TYPE "product_status_enum" AS ENUM ('active', 'inactive')
          `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "status" "product_status_enum" NOT NULL DEFAULT 'active'
          `);
    await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN "is_active"
          `);

    await queryRunner.query(`
            CREATE TYPE "variant_status_enum" AS ENUM ('active', 'inactive')
          `);
    await queryRunner.query(`
            ALTER TABLE "product_variants"
            ADD COLUMN "status" "variant_status_enum" NOT NULL DEFAULT 'active'
          `);
    await queryRunner.query(`
            ALTER TABLE "product_variants"
            DROP COLUMN "is_active"
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // product_variants
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`
      DROP TYPE "variant_status_enum"
    `);

    // products
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`
      DROP TYPE "product_status_enum"
    `);

    // categories
    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`
      DROP TYPE "category_status_enum"
    `);

    // brands
    await queryRunner.query(`
      ALTER TABLE "brands"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`
      DROP TYPE "brand_status_enum"
    `);
  }
}
