import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCategoryLogo1773801397458 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('categories', 'logo_key');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
