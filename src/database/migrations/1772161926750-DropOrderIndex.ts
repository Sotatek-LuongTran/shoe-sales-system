import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOrderIndex1772161926750 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_orders_user_status"
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
