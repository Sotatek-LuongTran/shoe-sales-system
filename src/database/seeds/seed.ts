import { AppDataSource } from "../data-source";
import { seedAdmin } from "./admin.seed";


async function runSeed() {
  await AppDataSource.initialize();
  await seedAdmin(AppDataSource);
  await AppDataSource.destroy();
}

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
