import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateOrdersTable1769760523173 implements MigrationInterface {
  name = 'CreateOrdersTable1769760523173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM ('pending', 'processing', 'shipped', 'completed', 'cancelled');
    `);
    await queryRunner.query(`
      CREATE TYPE "order_payment_status_enum" AS ENUM ('paid', 'unpaid');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'order_status_enum',
            enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
          },
          {
            name: 'payment_status',
            type: 'enum',
            enumName: 'order_payment_status_enum',
            enum: ['paid', 'unpaid'],
          },
          {
            name: 'total_price',
            type: 'numeric',
            precision: 12,
            scale: 2,
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
      'orders',
      new TableIndex({
        name: 'idx_orders_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'idx_orders_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'idx_orders_payment_status',
        columnNames: ['payment_status'],
      }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'idx_orders_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders');
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (fk) await queryRunner.dropForeignKey('orders', fk);

    await queryRunner.dropIndex('orders', 'idx_orders_deleted_at');
    await queryRunner.dropIndex('orders', 'idx_orders_payment_status');
    await queryRunner.dropIndex('orders', 'idx_orders_status');
    await queryRunner.dropIndex('orders', 'idx_orders_created_at');
    await queryRunner.dropTable('orders');
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TYPE "order_payment_status_enum"`);
  }
}
