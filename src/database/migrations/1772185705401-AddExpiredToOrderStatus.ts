import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiredToOrderStatus1772185705401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TYPE "order_status_enum"
          ADD VALUE IF NOT EXISTS 'expired'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
