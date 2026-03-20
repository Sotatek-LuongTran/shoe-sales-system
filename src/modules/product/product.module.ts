import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';
import { FileRepository } from 'src/shared/modules/files/file.repository';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [
    ProductService,
    ProductRepository,
    BrandRepository,
    CategoryRepository,
    StorageService,
    FileRepository,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
