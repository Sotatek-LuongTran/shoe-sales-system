import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserTable1769760523168 implements MigrationInterface {
  name = 'CreateUserTable1769760523168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'enum',
            enumName: 'user_role_enum',
            enum: ['admin', 'user'],
            default: `'user'`,
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
      'users',
      new TableIndex({
        name: 'idx_users_email_deleted_at',
        columnNames: ['email', 'deleted_at'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role_deleted_at',
        columnNames: ['role', 'deleted_at'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_created_at');
    await queryRunner.dropIndex('users', 'idx_users_role_deleted_at');
    await queryRunner.dropIndex('users', 'idx_users_email_deleted_at');
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}
