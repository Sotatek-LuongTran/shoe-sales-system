import { DataSource } from "typeorm";

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  const tableNames = entities
    .map((entity) => `"${entity.schema || 'public'}"."${entity.tableName}"`)
    .join(', ');

  if (!tableNames) return;

  await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
}
