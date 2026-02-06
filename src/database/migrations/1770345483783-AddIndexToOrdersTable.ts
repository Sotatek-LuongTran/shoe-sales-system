import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToOrdersTable1770345483783 implements MigrationInterface {
  name = 'AddIndexToOrdersTable1770345483783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_orders_user_status"
      ON "orders" ("user_id", "status")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "idx_orders_user_status"
    `);
  }
}
