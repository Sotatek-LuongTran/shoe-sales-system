import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLogoToBrandAndCategory1773629504019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'brands',
      new TableColumn({
        name: 'logo_key',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'categories',
      new TableColumn({
        name: 'logo_key',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('brands', 'logo_key');
    await queryRunner.dropColumn('categories', 'logo_key');
  }
}
