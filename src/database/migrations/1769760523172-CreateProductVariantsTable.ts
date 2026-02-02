import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableCheck,
} from 'typeorm';

export class CreateProductVariantsTable1769760523172
  implements MigrationInterface
{
  name = 'CreateProductVariantsTable1769760523172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'product_id',
            type: 'uuid',
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
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_product_id_variant_value',
        columnNames: ['product_id', 'variant_value'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_product_id',
        columnNames: ['product_id'],
      }),
    );
    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_product_id_is_active_deleted_at',
        columnNames: ['product_id', 'is_active', 'deleted_at'],
      }),
    );

    await queryRunner.createCheckConstraint(
      'product_variants',
      new TableCheck({
        name: 'CHK_product_variants_price',
        expression: '"price" >= 0',
      }),
    );
    await queryRunner.createCheckConstraint(
      'product_variants',
      new TableCheck({
        name: 'CHK_product_variants_stock',
        expression: '"stock" >= 0',
      }),
    );

    await queryRunner.createForeignKey(
      'product_variants',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product_variants');
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('product_id') !== -1,
    );
    if (fk) await queryRunner.dropForeignKey('product_variants', fk);

    await queryRunner.dropCheckConstraint(
      'product_variants',
      'CHK_product_variants_stock',
    );
    await queryRunner.dropCheckConstraint(
      'product_variants',
      'CHK_product_variants_price',
    );

    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_product_id_is_active_deleted_at',
    );
    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_product_id',
    );
    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_product_id_variant_value',
    );
    await queryRunner.dropTable('product_variants');
  }
}
