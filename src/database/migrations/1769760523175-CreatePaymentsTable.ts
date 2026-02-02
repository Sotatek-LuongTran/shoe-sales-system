import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreatePaymentsTable1769760523175 implements MigrationInterface {
  name = 'CreatePaymentsTable1769760523175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'successful', 'failed', 'refunded', 'cancelled');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'numeric',
            precision: 12,
            scale: 2,
          },
          {
            name: 'payment_status',
            type: 'enum',
            enumName: 'payment_status_enum',
            enum: ['pending', 'successful', 'failed', 'refunded', 'cancelled'],
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_order_id',
        columnNames: ['order_id'],
      }),
    );
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_payment_status',
        columnNames: ['payment_status'],
      }),
    );
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payments');
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('order_id') !== -1,
    );
    if (fk) await queryRunner.dropForeignKey('payments', fk);

    await queryRunner.dropIndex('payments', 'idx_payments_deleted_at');
    await queryRunner.dropIndex('payments', 'idx_payments_payment_status');
    await queryRunner.dropIndex('payments', 'idx_payments_order_id');
    await queryRunner.dropTable('payments');
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
  }
}
