import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import {
//   CreateOrderItemDto,
// } from 'src/modules/order/dto/create-order.dto';
import { DataSource, Not } from 'typeorm';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { AddToPendingOrderDto } from 'src/modules/order/dto/add-to-order.dto';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaymentRepository } from '../../shared/modules/common-payment/payment.repository';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { RemoveOrderItemDto } from 'src/modules/order/dto/remove-item.dto';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { ProductStatusEnum } from 'src/shared/enums/product.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { OrderItemEntity } from 'src/database/entities/order-item.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { UserEntity } from 'src/database/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly userRepository: UserRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(UserEntity).findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.USER_NOT_FOUND,
          statusCode: 404,
          message: 'User not found',
        });
      }
      const existing = await manager.getRepository(OrderEntity).findOne({
        where: { userId, status: OrderStatusEnum.PENDING },
      });
      if (existing) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.ORDER_PENDING_EXISTS,
          statusCode: 400,
          message: 'You have one pending order',
        });
      }

      const variantIds = dto.items.map((item) => item.variantId);

      const variants = await manager
        .getRepository(ProductVariantEntity)
        .createQueryBuilder('variant')
        .innerJoinAndSelect('variant.product', 'product')
        .where('variant.id IN (:...ids)', { ids: variantIds })
        .setLock('pessimistic_write')
        .getMany();

      const variantMap = new Map(
        variants.map((variant) => [variant.id, variant]),
      );

      let totalPrice = 0;
      const orderItems: OrderItemEntity[] = [];
      for (const item of dto.items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new NotFoundException({
            errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
            statusCode: 404,
            message: 'Variant not found',
          });
        }
        if (variant.stock - variant.reservedStock < item.quantity) {
          throw new BadRequestException({
            errorCode: ErrorCodeEnum.ORDER_INVALID_QUANTITY,
            statusCode: 400,
            message: 'Quantity too large',
          });
        }
        const finalPrice = variant.price * item.quantity;
        totalPrice += finalPrice;

        variant.reservedStock += item.quantity;
        orderItems.push(
          manager.create(OrderItemEntity, {
            name: variant.product.name,
            description: variant.product.description,
            productType: variant.product.productType,
            gender: variant.product.gender,
            variantValue: variant.variantValue,
            price: variant.price,
            quantity: item.quantity,
            finalPrice,
            productId: variant.productId,
          }),
        );
      }
      const order = manager.getRepository(OrderEntity).create({
        userId,
        status: OrderStatusEnum.PENDING,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        totalPrice,
        items: orderItems,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      });
      await manager.save(order);

      orderItems.forEach((i) => (i.orderId = order.id));
      await manager.save(orderItems);

      const payment = manager.create(PaymentEntity, {
        orderId: order.id,
        amount: totalPrice,
        paymentStatus: PaymentStatusEnum.PENDING,
      });

      await manager.save(payment);

      await manager.save([...variantMap.values()]);
      const finalOrder = await manager.getRepository(OrderEntity).findOne({
        where: { id: order.id },
        relations: ['items', 'payment'],
      });

      if (!finalOrder) {
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
          statusCode: 404,
          message: 'Order has not been created successfully',
        });
      }

      return new OrderResponseDto(finalOrder);
    });
  }

  async getOrdersByUserPagination(userId: string, dto: PaginateOrdersDto) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
        message: 'User not found',
      });

    const orders = await this.orderRepository.findOrdersPaginationUser(
      userId,
      dto,
    );

    return {
      ...orders,
      items: orders.items.map((item) => new OrderResponseDto(item)),
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
        message: 'User not found',
      });

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
        statusCode: 404,
        message: 'Order not found',
      });
    }

    if (order.userId !== userId) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
        statusCode: 403,
        message: 'Access denied',
      });
    }

    return new OrderResponseDto(order);
  }

  async cancelOrder(orderId: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_EMAIL_ALREADY_USED,
        statusCode: 404,
        message: 'Email already used',
      });

    return this.dataSource.transaction(async (manager) => {
      const order = await manager
        .withRepository(this.orderRepository)
        .findOrderWithItems(orderId);
      if (!order) {
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
          statusCode: 400,
          message: 'Order not found',
        });
      }

      if (order.userId !== userId) {
        throw new ForbiddenException({
          errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
          statusCode: 403,
          message: 'Access denied',
        });
      }

      if (order.status !== OrderStatusEnum.PENDING) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.ORDER_INVALID_STATUS,
          statusCode: 400,
          message: 'Invalid order status',
        });
      }

      order.status = OrderStatusEnum.CANCELLED;
      order.paymentStatus = OrderPaymentStatusEnum.UNPAID; // Reset payment status

      // ROLLBACK STOCK
      for (const item of order.items) {
        const variant = await manager
          .withRepository(this.productVariantRepository)
          .findByProductAndValue(item.productId, item.variantValue);

        if (!variant) {
          throw new NotFoundException({
            errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
            statusCode: 404,
            message: 'Variant not found',
          });
        }

        variant.reservedStock -= item.quantity;
        await manager
          .withRepository(this.productVariantRepository)
          .save(variant);
      }

      await manager.getRepository(order.constructor).save(order);
      return new OrderResponseDto(order);
    });
  }
}
