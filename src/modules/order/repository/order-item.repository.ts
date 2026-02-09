import { Injectable } from '@nestjs/common';
import { OrderItemEntity } from 'src/database/entities/order-item.entity';
import { GenderEnum, ProductTypeEnum } from 'src/shared/enums/product.enum';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrderItemRepository extends BaseRepository<OrderItemEntity> {
  constructor(datasource: DataSource) {
    super(datasource, OrderItemEntity);
  }

  async createItems(
    manager: EntityManager,
    orderId: string,
    items: {
      productId: string;
      variantValue: string;
      quantity: number;
      price: number;
      name: string;
      description?: string;
      productType: ProductTypeEnum;
      gender: GenderEnum;
    }[],
  ): Promise<OrderItemEntity[]> {
    const repo = manager.getRepository(OrderItemEntity);

    const entities = items.map((item) =>
      repo.create({
        orderId,
        productId: item.productId,
        name: item.name,
        description: item.description,
        productType: item.productType,
        gender: item.gender,
        variantValue: item.variantValue,
        price: item.price,
        quantity: item.quantity,
        finalPrice: item.price * item.quantity,
      }),
    );

    return repo.save(entities);
  }

  async findItemInOrder(
    orderId: string,
    productId: string,
    variantValue: string,
  ) {
    return this.findOne({
      where: {
        orderId,
        productId,
        variantValue,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<OrderItemEntity[]> {
    return this.find({
      where: {
        orderId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this.delete({ orderId });
  }

  async removeItemFromOrder(
    orderId: string,
    productId: string,
    variantValue: string,
  ): Promise<boolean> {
    const result = await this.delete({
      orderId,
      productId,
      variantValue,
    });

    return (result.affected ?? 0) > 0;
  }
}
