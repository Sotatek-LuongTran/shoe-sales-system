import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateProductsTable1769760523171 implements MigrationInterface {
  name = 'CreateProductsTable1769760523171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "product_type_enum" AS ENUM ('shoe', 'clothing', 'accessory');
    `);
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'unisex');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
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
            name: 'brand_id',
            type: 'uuid',
          },
          {
            name: 'category_id',
            type: 'uuid',
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
      'products',
      new TableIndex({
        name: 'idx_products_brand_id',
        columnNames: ['brand_id'],
      }),
    );
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'idx_products_category_id',
        columnNames: ['category_id'],
      }),
    );
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'idx_products_brand_id_category_id_is_active_deleted_at',
        columnNames: ['brand_id', 'category_id', 'is_active', 'deleted_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const productsTable = await queryRunner.getTable('products');
    const brandFk = productsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('brand_id') !== -1,
    );
    const categoryFk = productsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('category_id') !== -1,
    );
    if (brandFk) await queryRunner.dropForeignKey('products', brandFk);
    if (categoryFk) await queryRunner.dropForeignKey('products', categoryFk);

    await queryRunner.dropIndex(
      'products',
      'idx_products_brand_id_category_id_is_active_deleted_at',
    );
    await queryRunner.dropIndex('products', 'idx_products_category_id');
    await queryRunner.dropIndex('products', 'idx_products_brand_id');
    await queryRunner.dropTable('products');
    await queryRunner.query(`DROP TYPE "product_type_enum"`);
    await queryRunner.query(`DROP TYPE "gender_enum"`);
  }
}
