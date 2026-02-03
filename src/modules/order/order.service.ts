import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderItemDto } from 'src/shared/dto/order/create-order.dto';
import { DataSource } from 'typeorm';
import { OrderRepository } from './order.repository';
import { OrderItemRepository } from './order-item.repository';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { AddToPendingOrderDto } from 'src/shared/dto/order/add-to-order.dto';
import { OrderPaymentStatus, OrderStatus } from 'src/shared/enums/order.enum';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly userRepository: UserRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async checkoutOrder(dto: CreateOrderDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.createOrder(manager, userId);
      await this.orderItemRepository.createItems(manager, order.id, dto.items);

      return order;
    });
  }

  async getMyOrders(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.orderRepository.findOrdersByUser(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async getAllOrders() {
    return this.orderRepository.findAllOrders();
  }

  async addProductToPendingOrder(userId: string, dto: AddToPendingOrderDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const { productId, variantValue, quantity } = dto;

    // Validate product
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new BadRequestException('Product not available');
    }

    // Validate variant
    const variant = await this.productVariantRepository.findByProductAndVariant(
      productId,
      variantValue,
    );

    if (!variant || variant.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    variant.stock-= quantity;

    await this.productVariantRepository.save(variant);

    // Find or create pending order
    let order = await this.orderRepository.findPendingOrderByUser(userId);

    if (!order) {
      order = await this.orderRepository.create({
        user,
        status: OrderStatus.PENDING,
        paymentStatus: OrderPaymentStatus.UNPAID,
        totalPrice: 0,
      });
      await this.orderRepository.save(order);
    }

    let item = await this.orderItemRepository.findItemInOrder(
      order.id,
      productId,
      variantValue,
    );

    const price = Number(variant.price);

    if (item) {
      item.quantity += quantity;
      item.finalPrice = item.quantity * price;
    } else {
      const createItemDto: CreateOrderItemDto = {
        productId,
        variantValue,
        quantity,
        price,
        name: product.name,
        description: product.description,
        productType: product.productType,
        gender: product.gender,
      };

      item = await this.orderItemRepository.create({
        orderId: order.id,
        ...createItemDto,
        finalPrice: price * quantity,
      });
    }

    await this.orderItemRepository.save(item);

    // Recalculate total
    const items = await this.orderItemRepository.findByOrderId(order.id);
    order.totalPrice = items.reduce((sum, i) => sum + Number(i.finalPrice), 0);

    return this.orderRepository.save(order);
  }
}
