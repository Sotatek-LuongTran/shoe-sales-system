import { Test } from '@nestjs/testing';
import { OrderService } from './order.service';
import { DataSource } from 'typeorm';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { UserRepository } from '../../shared/modules/common-user/user.repository';
import { NotificationService } from '../../shared/modules/notifications/notification.service';
import { GenderEnum, ProductTypeEnum } from '../../shared/enums/product.enum';
import { VariantStatusEnum } from '../../shared/enums/product-variant.enum';
import { ProductVariantEntity } from '../../database/entities/product-variant.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { UserEntity } from '../../database/entities/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { PaymentEntity } from 'src/database/entities/payment.entity';

describe('Order service', () => {
  // Init providers
  let orderService: OrderService;

  let orderRepository: any;
  let userRepository: any;
  let notificationService: any;
  let dataSource: any;

  beforeEach(async () => {
    // Mock functions
    dataSource = {
      transaction: jest.fn(),
    };

    orderRepository = {
      findOrdersPaginationUser: jest.fn(),
      findById: jest.fn(),
      findOrderWithItems: jest.fn(),
    };

    userRepository = {
      findById: jest.fn(),
    };

    notificationService = {
      sendOrderCancelled: jest.fn(),
      sendOrderCreated: jest.fn(),
    };

    // Create test module
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DataSource, useValue: dataSource },
        { provide: OrderRepository, useValue: orderRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();
    orderService = module.get<OrderService>(OrderService);
  });

  describe('createOrder', () => {
    const user = { id: 'user-1' };
    it('should create order successfully', async () => {
      const dto = {
        items: [
          {
            variantId: 'variant-1',
            quantity: 1,
          },
        ],
      };

      const variant = {
        id: 'variant-1',
        variantValue: 'EU 40',
        price: 100,
        stock: 30,
        reservedStock: 5,
        status: 'active',
        productId: 'product-1',
        product: {
          id: 'product-1',
          name: 'Nike running shoes',
          description: 'Run',
          productType: ProductTypeEnum.SHOE,
          gender: GenderEnum.UNISEX,
          brand: { id: 'brand-1', name: 'Nike' },
          category: { id: 'category-1', name: 'Running' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        images: [],
      };

      const userEntity = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        status: 'active',
        avatarKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const order = {
        id: 'order-1',
        userId: user.id,
        status: OrderStatusEnum.PENDING,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        totalPrice: 100,
        items: [],
        payment: {},
        expiresAt: new Date(),
      };

      const manager = {
        getRepository: jest.fn(),
        create: jest.fn((entity, data) => {
          if (entity === OrderEntity) {
            return {
              id: Math.random().toString(),
              ...data,
              items: data.items || [],
            };
          }
          return {
            id: Math.random().toString(),
            ...data,
          };
        }),
        save: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      const orderRepoMock = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            ...order,
            items: [],
            payment: { id: 'payment-1', paymentStatus: 'pending', amount: 100 },
          }),
        create: jest.fn().mockReturnValue(order),
        save: jest.fn(),
      };

      manager.getRepository.mockImplementation((entity) => {
        if (entity === UserEntity) {
          return {
            findOne: jest.fn().mockResolvedValue(userEntity),
          };
        }

        if (entity === OrderEntity) {
          return orderRepoMock;
        }

        if (entity === ProductVariantEntity) {
          return {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              setLock: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([variant]),
            }),
            save: jest.fn(),
          };
        }

        return {
          create: jest.fn(),
          save: jest.fn(),
        };
      });

      const result = await orderService.createOrder(user.id, dto as any);

      expect(result).toBeDefined();
      expect(notificationService.sendOrderCreated).toHaveBeenCalled();
    });
    it('should throw user not found', async () => {
      const dto = {};

      const manager = {
        getRepository: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      manager.getRepository.mockImplementation(() => {
        return { findOne: jest.fn().mockResolvedValue(null) };
      });

      await expect(
        orderService.createOrder(user.id, dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw pending order exists', async () => {
      const dto = {};

      const order = {
        status: OrderStatusEnum.PENDING,
      };
      const manager = {
        getRepository: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      manager.getRepository.mockImplementation(() => {
        return { findOne: jest.fn().mockResolvedValue(order) };
      });

      await expect(
        orderService.createOrder(user.id, dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw variant not found', async () => {
      const manager = {
        getRepository: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      manager.getRepository.mockImplementation((entity) => {
        if (entity === UserEntity) {
          return {
            findOne: jest.fn().mockResolvedValue({ id: 'user-1' }),
          };
        }

        if (entity === OrderEntity) {
          return {
            findOne: jest.fn().mockResolvedValue(null),
          };
        }

        if (entity === ProductVariantEntity) {
          return {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              setLock: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        return {};
      });

      await expect(
        orderService.createOrder('user-1', {
          items: [{ variantId: 'v1', quantity: 1 }],
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw quantity too large', async () => {
      const variant = {
        id: 'v1',
        stock: 10,
        reservedStock: 10,
      };
      const manager = {
        getRepository: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      manager.getRepository.mockImplementation((entity) => {
        if (entity === UserEntity) {
          return {
            findOne: jest.fn().mockResolvedValue({ id: 'user-1' }),
          };
        }

        if (entity === OrderEntity) {
          return {
            findOne: jest.fn().mockResolvedValue(null),
          };
        }

        if (entity === ProductVariantEntity) {
          return {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              setLock: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([variant]),
            }),
          };
        }
        return {};
      });

      await expect(
        orderService.createOrder('user-1', {
          items: [{ variantId: 'v1', quantity: 1 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
  describe('getOrdersByUserPagination', () => {
    const user = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword',
      role: 'user',
      status: 'active',
      avatarKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should get all orders successfully', async () => {
      const orders = {
        items: [
          {
            id: 'order-1',
            userId: user.id,
            status: OrderStatusEnum.PENDING,
            paymentStatus: OrderPaymentStatusEnum.UNPAID,
            totalPrice: 100,
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            items: [
              {
                id: 'item-1',
                orderId: 'order-1',
                name: 'Nike running shoes',
                description: 'Comfortable shoes',
                productType: ProductTypeEnum.SHOE,
                gender: GenderEnum.UNISEX,
                variantValue: 'EU 40',
                price: 100,
                quantity: 1,
                finalPrice: 100,
                productId: 'product-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              },
            ],
            payment: {
              id: 'payment-1',
              orderId: 'order-1',
              amount: 100,
              paymentStatus: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            },
            user: user,
          },
          {
            id: 'order-2',
            userId: user.id,
            status: OrderStatusEnum.COMPLETED,
            paymentStatus: OrderPaymentStatusEnum.PAID,
            totalPrice: 200,
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            items: [
              {
                id: 'item-2',
                orderId: 'order-2',
                name: 'Adidas sneakers',
                description: 'Stylish sneakers',
                productType: ProductTypeEnum.SHOE,
                gender: GenderEnum.UNISEX,
                variantValue: 'EU 42',
                price: 200,
                quantity: 1,
                finalPrice: 200,
                productId: 'product-2',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              },
            ],
            payment: {
              id: 'payment-2',
              orderId: 'order-2',
              amount: 200,
              paymentStatus: 'paid',
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            },
            user: user,
          },
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };
      userRepository.findById.mockResolvedValue(user);
      orderRepository.findOrdersPaginationUser.mockResolvedValue(orders);

      const result = await orderService.getOrdersByUserPagination(user.id, {});

      expect(result).toBeDefined();
      expect(result.meta).toEqual(orders.meta);
      expect(result.data.length).toBe(2);
    });
    it('should throw user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        orderService.getOrdersByUserPagination(user.id, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('getOrderById', () => {
    const user = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword',
      role: 'user',
      status: 'active',
      avatarKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should get order successfully', async () => {
      const order = {
        id: 'order-1',
        userId: user.id,
        status: OrderStatusEnum.PENDING,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        totalPrice: 100,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        items: [
          {
            id: 'item-1',
            orderId: 'order-1',
            name: 'Nike running shoes',
            description: 'Comfortable shoes',
            productType: ProductTypeEnum.SHOE,
            gender: GenderEnum.UNISEX,
            variantValue: 'EU 40',
            price: 100,
            quantity: 1,
            finalPrice: 100,
            productId: 'product-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
        payment: {
          id: 'payment-1',
          orderId: 'order-1',
          amount: 100,
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        user: user,
      };

      userRepository.findById.mockResolvedValue(user);
      orderRepository.findOrderWithItems.mockResolvedValue(order);

      const result = await orderService.getOrderById(order.id, user.id);
      expect(result).toBeDefined();
    });
    it('should throw user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(
        orderService.getOrderById('order-1', user.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw order not found', async () => {
      userRepository.findById.mockResolvedValue(user);
      orderRepository.findOrderWithItems.mockResolvedValue(null);
      await expect(
        orderService.getOrderById('order-1', user.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw forbidden resource', async () => {
      userRepository.findById.mockResolvedValue(user);
      orderRepository.findOrderWithItems.mockResolvedValue({
        id: 'order-1',
        user: 'wrong-user',
      });
      await expect(
        orderService.getOrderById('order-1', user.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
  describe('cancelOrder', () => {
    const user = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword',
      role: 'user',
      status: 'active',
      avatarKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should cancel order successfully', async () => {
      const order = {
        id: 'order-1',
        userId: user.id,
        status: OrderStatusEnum.PENDING,
        paymentStatus: OrderPaymentStatusEnum.UNPAID,
        totalPrice: 500,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        items: [
          {
            id: 'item-1',
            orderId: 'order-1',
            name: 'Nike running shoes',
            description: 'Comfortable shoes',
            productType: ProductTypeEnum.SHOE,
            gender: GenderEnum.UNISEX,
            variantValue: 'EU 40',
            price: 100,
            quantity: 5,
            finalPrice: 500,
            productId: 'product-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
        payment: {
          id: 'payment-1',
          orderId: 'order-1',
          amount: 500,
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        user: user,
      };

      const variant = {
        id: 'variant-1',
        variantValue: 'EU 40',
        price: 100,
        stock: 30,
        reservedStock: 5,
        status: 'active',
        productId: 'product-1',
        product: {
          id: 'product-1',
          name: 'Nike running shoes',
          description: 'Comfortable shoes',
          productType: ProductTypeEnum.SHOE,
          gender: GenderEnum.UNISEX,
          brand: { id: 'brand-1', name: 'Nike' },
          category: { id: 'category-1', name: 'Running' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        images: [],
      };

      userRepository.findById.mockResolvedValue(user);

      const manager = {
        getRepository: jest.fn(),
        save: jest.fn(),
      };

      dataSource.transaction.mockImplementation(async (cb) => cb(manager));

      const productVariantRepoMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(variant),
        }),
        save: jest.fn().mockResolvedValue(variant),
      };

      const orderRepoMock = {
        findOne: jest.fn().mockResolvedValue(order),
        save: jest.fn().mockResolvedValue(order),
      };

      manager.getRepository.mockImplementation((entity) => {
        if (entity === OrderEntity) {
          return orderRepoMock;
        }
        if (entity === ProductVariantEntity) {
          return productVariantRepoMock;
        }
        if (entity === PaymentEntity) {
          return {
            save: jest.fn().mockResolvedValue(order.payment),
          };
        }
        return {};
      });

      const result = await orderService.cancelOrder(order.id, user.id);

      expect(result).toBeDefined();
      expect(notificationService.sendOrderCancelled).toHaveBeenCalled();
    });
  });
});
