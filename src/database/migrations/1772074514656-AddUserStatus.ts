import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1772074514656 implements MigrationInterface {
  name = 'AddUserStatus1772074514656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive', 'banned')
        `);

    await queryRunner.query(`
          ALTER TABLE "users"
          ADD COLUMN "status" "user_status_enum" NOT NULL DEFAULT 'inactive'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "users"
          DROP COLUMN "status"
        `);

    await queryRunner.query(`
          DROP TYPE "user_status_enum"
        `);
  }
}
