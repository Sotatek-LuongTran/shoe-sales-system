import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { AdminUserService } from './admin-user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

describe('AdminUserService', () => {
  let service: AdminUserService;
  let userRepo: any;
  let redisService: any;

  beforeEach(async () => {
    userRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findUsersPaginationAdmin: jest.fn(),
    };
    redisService = {
      incr: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        AdminUserService,
        { provide: UserRepository, useValue: userRepo },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();
    service = module.get<AdminUserService>(AdminUserService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'test',
      };
      const user = await service.createUser(createUserDto);
      expect(user).toBeDefined();
      expect(userRepo.create).toHaveBeenCalledWith(createUserDto);
    });
  });
  describe('getAllUsersPagination', () => {
    it('should get all users pagination', async () => {
      const users = await service.getAllUsersPagination({ page: 1, limit: 10 });
      expect(users).toBeDefined();
      expect(userRepo.findUsersPaginationAdmin).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
  describe('findUserById', () => {
    it('should find a user by id', async () => {
      const user = await service.findUserById('1');
      expect(user).toBeDefined();
      expect(userRepo.findById).toHaveBeenCalledWith('1');
    });
    it('should throw an error if user not found', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.findUserById('1')).rejects.toThrow(NotFoundException);
    });
  });
  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'test',
      };
      const user = await service.updateUser('1', updateUserDto);
      expect(user).toBeDefined();
      expect(userRepo.update).toHaveBeenCalledWith('1', updateUserDto);
    });
    it('should throw an error if user not found', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.updateUser('1', { email: 'test@example.com', password: 'password', name: 'test' })).rejects.toThrow(NotFoundException);
    });
  });   
  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const user = await service.deactivateUser('1');
      expect(user).toBeDefined();
      expect(userRepo.deactivateUser).toHaveBeenCalledWith('1');
    });
    it('should throw an error if user not found', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.deactivateUser('1')).rejects.toThrow(NotFoundException);
    });
  });
  describe('restoreUser', () => {
    it('should restore a user', async () => {
      const user = await service.restoreUser('1');
      expect(user).toBeDefined();
      expect(userRepo.restoreUser).toHaveBeenCalledWith('1');
    });
    it('should throw an error if user not found', async () => {
      userRepo.findBannedUser.mockResolvedValue(null);
      await expect(service.restoreUser('1')).rejects.toThrow(NotFoundException);
    });
  });
});