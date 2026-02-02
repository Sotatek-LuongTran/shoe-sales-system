import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateOrderItemsTable1769760523174 implements MigrationInterface {
  name = 'CreateOrderItemsTable1769760523174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
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
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'product_type',
            type: 'enum',
            enumName: 'product_type_enum',
            enum: ['shoe', 'clothing', 'accessory'],
          },
          {
            name: 'gender',
            type: 'enum',
            enumName: 'gender_enum',
            enum: ['male', 'female', 'unisex'],
          },
          {
            name: 'variant_value',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'price',
            type: 'numeric',
            precision: 12,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'final_price',
            type: 'numeric',
            precision: 12,
            scale: 2,
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
      'order_items',
      new TableIndex({
        name: 'idx_order_items_order_id',
        columnNames: ['order_id'],
      }),
    );
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'idx_order_items_product_type_gender',
        columnNames: ['product_type', 'gender'],
      }),
    );
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'idx_order_items_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('order_items');
    const orderFk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('order_id') !== -1,
    );
    const productFk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('product_id') !== -1,
    );
    if (orderFk) await queryRunner.dropForeignKey('order_items', orderFk);
    if (productFk) await queryRunner.dropForeignKey('order_items', productFk);

    await queryRunner.dropIndex('order_items', 'idx_order_items_created_at');
    await queryRunner.dropIndex(
      'order_items',
      'idx_order_items_product_type_gender',
    );
    await queryRunner.dropIndex('order_items', 'idx_order_items_order_id');
    await queryRunner.dropTable('order_items');
  }
}
