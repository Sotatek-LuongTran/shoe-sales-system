import { AppDataSource } from "../data-source";
import { seedAdmin } from "./admin.seed";
import { seedProducts } from "./products-data.seed";


async function runSeed() {
  await AppDataSource.initialize();
  await seedAdmin(AppDataSource);
  await seedProducts(AppDataSource);
  await AppDataSource.destroy();
}

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
