import { DataSource } from 'typeorm';

import { BrandStatusEnum } from 'src/shared/enums/brand.enum';
import { CategoryStatusEnum } from 'src/shared/enums/category.enum';
import {
  GenderEnum,
  ProductStatusEnum,
  ProductTypeEnum,
} from 'src/shared/enums/product.enum';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';
import { BrandEntity } from 'src/database/entities/brand.entity';
import { CategoryEntity } from 'src/database/entities/category.entity';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum, UserStatusEnum } from 'src/shared/enums/user.enum';

export async function seedTestData(dataSource: DataSource) {
  const brandRepo = dataSource.getRepository(BrandEntity);
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const productRepo = dataSource.getRepository(ProductEntity);
  const variantRepo = dataSource.getRepository(ProductVariantEntity);
  const userRepo = dataSource.getRepository(UserEntity);

  const user = await userRepo.save({
    email: 'test@mail.com',
    name: 'Test',
    passwordHash: await bcrypt.hash('123456', 10),
    role: UserRoleEnum.USER,
    status: UserStatusEnum.ACTIVE,
  });

  /* -------------------- Brands -------------------- */
  const brands = brandRepo.create([
    {
      name: 'Nike',
      description: 'Sportswear brand',
      status: BrandStatusEnum.ACTIVE,
    },
    {
      name: 'Adidas',
      description: 'German sports brand',
      status: BrandStatusEnum.ACTIVE,
    },
    {
      name: 'Puma',
      description: 'Performance sportswear',
      status: BrandStatusEnum.ACTIVE,
    },
    {
      name: 'New Balance',
      description: 'Comfort-focused shoes',
      status: BrandStatusEnum.ACTIVE,
    },
    {
      name: 'Converse',
      description: 'Classic sneakers',
      status: BrandStatusEnum.ACTIVE,
    },
  ]);
  await brandRepo.save(brands);

  /* -------------------- Categories -------------------- */
  const categories = categoryRepo.create([
    {
      name: 'Running Shoes',
      description: 'For running',
      status: CategoryStatusEnum.ACTIVE,
    },
    {
      name: 'Basketball Shoes',
      description: 'For basketball',
      status: CategoryStatusEnum.ACTIVE,
    },
    {
      name: 'Casual Shoes',
      description: 'Everyday wear',
      status: CategoryStatusEnum.ACTIVE,
    },
    {
      name: 'Training Shoes',
      description: 'Gym & training',
      status: CategoryStatusEnum.ACTIVE,
    },
    {
      name: 'Lifestyle Shoes',
      description: 'Street style',
      status: CategoryStatusEnum.ACTIVE,
    },
  ]);
  await categoryRepo.save(categories);

  let products: ProductEntity[] = [];
  let variants: ProductVariantEntity[] = [];

  /* -------------------- Products + Variants -------------------- */
  for (const brand of brands) {
    for (const category of categories.slice(0, 2)) {
      const product = productRepo.create({
        name: `${brand.name} ${category.name}`,
        description: `${brand.name} premium ${category.name.toLowerCase()}`,
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.ACTIVE,
        brandId: brand.id,
        categoryId: category.id,
      });

      await productRepo.save(product);

      products.push(product);

      const createdVariants = variantRepo.create([
        {
          variantValue: 'EU 40',
          price: 100,
          stock: 40,
          reservedStock: 0,
          status: VariantStatusEnum.ACTIVE,
          productId: product.id,
        },
        {
          variantValue: 'EU 41',
          price: 105,
          stock: 40,
          reservedStock: 0,
          status: VariantStatusEnum.ACTIVE,
          productId: product.id,
        },
        {
          variantValue: 'EU 42',
          price: 110,
          stock: 40,
          reservedStock: 0,
          status: VariantStatusEnum.ACTIVE,
          productId: product.id,
        },
      ]);

      await variantRepo.save(createdVariants);
      variants.push(...createdVariants);
    }
  }

  console.log('✅ Brands, categories, products & variants seeded successfully');
  return {
    user,
    products,
    variants,
  };
}
