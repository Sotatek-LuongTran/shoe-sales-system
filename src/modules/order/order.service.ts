import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import {
//   CreateOrderItemDto,
// } from 'src/modules/order/dto/create-order.dto';
import { DataSource } from 'typeorm';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { AddToPendingOrderDto } from 'src/modules/order/dto/add-to-order.dto';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaymentRepository } from '../payment/repository/payment.repository';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { RemoveOrderItemDto } from 'src/modules/order/dto/remove-item.dto';
import { CreateOrderItemDto } from './dto/create-order.dto';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

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

  async checkoutOrder(userId: string) {
    const order = await this.orderRepository.findPendingOrderByUser(userId);

    if (!order) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.ORDER_PENDING_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (order.items.length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.ORDER_EMPTY,
        statusCode: 404,
      });
    }

    // create payment
    const payment = this.paymentRepository.create({
      orderId: order.id,
      amount: order.totalPrice,
      paymentStatus: PaymentStatusEnum.PENDING,
    });

    await this.paymentRepository.save(payment);

    order.status = OrderStatusEnum.PROCESSING;
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      paymentId: payment.id,
      amount: payment.amount,
    };
  }

  async getOrdersByUserPagination(userId: string, dto: PaginateOrdersDto) {
    if (!dto.userId || dto.userId !== userId) {
      throw new NotFoundException();
    }
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
      });

    const orders = await this.orderRepository.findOrdersPagination(dto);

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
      });

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (order.userId !== userId) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
        statusCode: 403,
      });
    }

    return new OrderResponseDto(order);
  }

  async addProductToPendingOrder(userId: string, dto: AddToPendingOrderDto) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
      });

    const { productId, productVariantId, quantity } = dto;

    // Validate product
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_AVAILABLE,
        statusCode: 400,
      });
    }

    // Validate variant
    const variant =
      await this.productVariantRepository.findById(productVariantId);

    if (!variant || variant.stock < quantity) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_OUT_OF_STOCK,
        statusCode: 400,
      });
    }

    variant.stock -= quantity;

    await this.productVariantRepository.save(variant);

    // Find or create pending order
    let order = await this.orderRepository.findPendingOrderByUser(userId);

    if (!order) {
      order = this.orderRepository.create({
        user,
        status: OrderStatusEnum.PENDING,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        totalPrice: 0,
      });
      await this.orderRepository.save(order);
    }

    let item = await this.orderItemRepository.findItemInOrder(
      order.id,
      productId,
      variant.variantValue,
    );

    const price = Number(variant.price);

    if (item) {
      item.quantity += quantity;
      item.finalPrice = item.quantity * price;
    } else {
      const createItemDto: CreateOrderItemDto = {
        productId,
        variantValue: variant.variantValue,
        quantity,
        price,
        name: product.name,
        description: product.description,
        productType: product.productType,
        gender: product.gender,
      };

      item = this.orderItemRepository.create({
        orderId: order.id,
        ...createItemDto,
        finalPrice: price * quantity,
      });
    }

    await this.orderItemRepository.save(item);

    // Recalculate total
    const items = await this.orderItemRepository.findByOrderId(order.id);
    order.totalPrice = items.reduce((sum, i) => sum + Number(i.finalPrice), 0);

    await this.orderRepository.save(order);

    return new OrderResponseDto(order);
  }

  async cancelOrder(orderId: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_EMAIL_ALREADY_USED,
        statusCode: 404,
      });

    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findOrderWithItems(orderId);
      if (!order) {
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
          statusCode: 400,
        });
      }

      if (order.userId !== userId) {
        throw new ForbiddenException({
          errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
          statusCode: 403,
        });
      }

      if (
        order.status !== OrderStatusEnum.PENDING &&
        order.status !== OrderStatusEnum.PROCESSING
      ) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.ORDER_INVALID_STATUS,
          statusCode: 400,
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
          variant.stock += item.quantity;
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
      });
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.ORDER_INVALID_STATUS,
        statusCode: 400,
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
      });
    }

    // Restore stock
    const variant = await this.productVariantRepository.findByProductAndValue(
      productId,
      variantValue,
    );

    if (variant) {
      variant.stock += item.quantity;
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
}
