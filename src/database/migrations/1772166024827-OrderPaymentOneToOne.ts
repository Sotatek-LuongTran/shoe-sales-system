import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderPaymentOneToOne1772166024827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "payments"
          DROP CONSTRAINT IF EXISTS "FK_payments_order"
        `);

    await queryRunner.query(`
          ALTER TABLE "payments"
          ADD CONSTRAINT "UQ_payments_order_id" UNIQUE ("order_id")
        `);

    await queryRunner.query(`
          ALTER TABLE "payments"
          ADD CONSTRAINT "FK_payments_order"
          FOREIGN KEY ("order_id")
          REFERENCES "orders"("id")
          ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "payments"
          DROP CONSTRAINT "FK_payments_order"
        `);

    await queryRunner.query(`
          ALTER TABLE "payments"
          DROP CONSTRAINT "UQ_payments_order_id"
        `);

    await queryRunner.query(`
          ALTER TABLE "payments"
          ADD CONSTRAINT "FK_payments_order"
          FOREIGN KEY ("order_id")
          REFERENCES "orders"("id")
        `);
  }
}
