import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBrandsTable1769760523169 implements MigrationInterface {
  name = 'CreateBrandsTable1769760523169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'brands',
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
      'brands',
      new TableIndex({
        name: 'idx_brands_name_deleted_at',
        columnNames: ['name', 'deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('brands', 'idx_brands_name_deleted_at');
    await queryRunner.dropTable('brands');
  }
}
