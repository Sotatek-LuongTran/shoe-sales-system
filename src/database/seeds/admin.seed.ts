import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../shared/modules/common-user/user.repository';
import { UserRoleEnum, UserStatusEnum } from 'src/shared/enums/user.enum';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = new UserRepository(dataSource);

  const adminEmail = 'admin@example.com';

  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail },
    withDeleted: true,
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const admin = userRepo.create({
    name: 'System Admin',
    email: adminEmail,
    passwordHash: passwordHash,
    role: UserRoleEnum.ADMIN,
    deletedAt: null,
    status: UserStatusEnum.ACTIVE,
  });

  userRepo.save(admin)

  console.log('🚀 Admin user seeded successfully');
}
