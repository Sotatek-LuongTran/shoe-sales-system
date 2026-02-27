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
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
        message: 'User not found',
      });
    }

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        userId: userId,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        status: OrderStatusEnum.PENDING,
        totalPrice: 0,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      }),
    );

    let totalPrice = 0;

    for (const itemDto of dto.items) {
      const variant =
        await this.productVariantRepository.findVariantWithProduct(
          itemDto.variantId,
        );

      if (!variant) {
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
          statusCode: 404,
          message: 'Variant not found',
        });
      }

      if (variant.stock - variant.reservedStock < itemDto.quantity) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.ORDER_INVALID_QUANTITY,
          statusCode: 400,
          message: 'Quantity too large',
        });
      }

      const finalPrice = variant.price * itemDto.quantity;
      totalPrice += finalPrice;

      const item = this.orderItemRepository.create({
        orderId: order.id,
        name: variant.product.name,
        description: variant.product.description,
        productType: variant.product.productType,
        gender: variant.product.gender,
        variantValue: variant.variantValue,
        price: variant.price,
        quantity: itemDto.quantity,
        finalPrice,
        productId: variant.productId,
      });

      variant.reservedStock += itemDto.quantity;

      await this.productVariantRepository.save(variant);

      await this.orderItemRepository.save(item);
    }

    order.totalPrice = totalPrice;
    await this.orderRepository.save(order);

    const payment = this.paymentRepository.create({
      orderId: order.id,
      amount: totalPrice,
      paymentStatus: PaymentStatusEnum.PENDING,
    });

    order.payment = payment;

    await this.orderRepository.save(order);

    await this.paymentRepository.save(payment);

    const finalOrder = await this.orderRepository.findOrderWithItems(order.id);
    if (!finalOrder) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
        statusCode: 404,
        message: 'Order has not been created successfully',
      });
    }
    return new OrderResponseDto(finalOrder);
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

  // async addProductToPendingOrder(userId: string, dto: AddToPendingOrderDto) {
  //   const user = await this.userRepository.findById(userId);
  //   if (!user)
  //     throw new NotFoundException({
  //       errorCode: ErrorCodeEnum.USER_NOT_FOUND,
  //       statusCode: 404,
  //       message: 'User not found',
  //     });

  //   const { productId, productVariantId, quantity } = dto;

  //   // Validate product
  //   const product = await this.productRepository.findById(productId);
  //   if (!product || product.status !== ProductStatusEnum.ACTIVE ) {
  //     throw new BadRequestException({
  //       errorCode: ErrorCodeEnum.PRODUCT_NOT_AVAILABLE,
  //       statusCode: 400,
  //       message: 'Product not available',
  //     });
  //   }

  //   // Validate variant
  //   const variant =
  //     await this.productVariantRepository.findById(productVariantId);

  //   if (!variant || variant.stock < quantity) {
  //     throw new BadRequestException({
  //       errorCode: ErrorCodeEnum.PRODUCT_VARIANT_OUT_OF_STOCK,
  //       statusCode: 400,
  //       message: 'Variant out of stock',
  //     });
  //   }

  //   // Bo
  //   variant.stock -= quantity;

  //   await this.productVariantRepository.save(variant);

  //   // Find or create pending order
  //   let order = await this.orderRepository.findPendingOrderByUser(userId);

  //   if (!order) {
  //     order = this.orderRepository.create({
  //       user,
  //       status: OrderStatusEnum.PENDING,
  //       paymentStatus: OrderPaymentStatusEnum.UNPAID,
  //       totalPrice: 0,
  //     });
  //     await this.orderRepository.save(order);
  //   }

  //   let item = await this.orderItemRepository.findItemInOrder(
  //     order.id,
  //     productId,
  //     variant.variantValue,
  //   );

  //   const price = Number(variant.price);

  //   if (item) {
  //     item.quantity += quantity;
  //     item.finalPrice = item.quantity * price;
  //   } else {
  //     const createItemDto: CreateOrderItemDto = {
  //       productId,
  //       variantValue: variant.variantValue,
  //       quantity,
  //       price,
  //       name: product.name,
  //       description: product.description,
  //       productType: product.productType,
  //       gender: product.gender,
  //     };

  //     item = this.orderItemRepository.create({
  //       orderId: order.id,
  //       ...createItemDto,
  //       finalPrice: price * quantity,
  //     });
  //   }

  //   await this.orderItemRepository.save(item);

  //   // Recalculate total
  //   const items = await this.orderItemRepository.findByOrderId(order.id);
  //   order.totalPrice = items.reduce((sum, i) => sum + Number(i.finalPrice), 0);

  //   await this.orderRepository.save(order);

  //   return new OrderResponseDto(order);
  // }

  async cancelOrder(orderId: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_EMAIL_ALREADY_USED,
        statusCode: 404,
        message: 'Email already used',
      });

    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findOrderWithItems(orderId);
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

      if (
        order.status !== OrderStatusEnum.PENDING
      ) {
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
        const variant =
          await this.productVariantRepository.findByProductAndValue(
            item.productId,
            item.variantValue,
          );

        if (variant) {
          variant.reservedStock -= item.quantity;
          await manager.getRepository(variant.constructor).save(variant);
        }
      }

      await manager.getRepository(order.constructor).save(order);
      return new OrderResponseDto(order);
    });
  }

  async removeItemFromPendingOrder(userId: string, dto: RemoveOrderItemDto) {
    const { productId, variantValue } = dto;
    // Find pending order
    const order = await this.orderRepository.findPendingOrderByUser(userId);

    if (!order) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_PENDING_NOT_FOUND,
        statusCode: 400,
        message: 'No pending order found',
      });
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.ORDER_INVALID_STATUS,
        statusCode: 400,
        message: 'Invalid order status',
      });
    }

    // Find item in order
    const item = await this.orderItemRepository.findItemInOrder(
      order.id,
      productId,
      variantValue,
    );

    if (!item) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_EMPTY,
        statusCode: 404,
        message: 'OrderIsEmpty',
      });
    }

    // Restore stock
    const variant = await this.productVariantRepository.findByProductAndValue(
      productId,
      variantValue,
    );

    if (variant) {
      variant.reservedStock -= item.quantity;
      await this.productVariantRepository.save(variant);
    }

    // Remove item
    await this.orderItemRepository.removeItemFromOrder(
      order.id,
      productId,
      variantValue,
    );

    // Recalculate total price
    const remainingItems = await this.orderItemRepository.findByOrderId(
      order.id,
    );

    order.totalPrice = remainingItems.reduce(
      (sum, i) => sum + Number(i.finalPrice),
      0,
    );

    await this.orderRepository.save(order);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async cancelExpiredOrders() {
    console.log("Start cancel expired orders . . .")
    const pendingOrders = await this.orderRepository.findAllPendingOrders();

    for (const order of pendingOrders) {
      for (const item of order.items) {
        const variant =
          await this.productVariantRepository.findByProductAndValue(
            item.productId,
            item.variantValue,
          );

        if (!variant) {
          throw new NotFoundException({
            errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
            statusCode: 404,
            message: 'Variant not found',
          });
        }

        variant.reservedStock -= item.quantity;
        await this.productVariantRepository.save(variant);
      }
      order.status = OrderStatusEnum.CANCELLED;
      await this.orderRepository.save(order);
    }
    console.log("Cancel expired orders completed.")
  }
}
