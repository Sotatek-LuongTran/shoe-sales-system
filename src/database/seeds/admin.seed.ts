import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../shared/modules/user/user.repository';
import { UserRoleEnum } from 'src/shared/enums/user.enum';

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

  const admin = await userRepo.create({
    name: 'System Admin',
    email: adminEmail,
    passwordHash: passwordHash,
    role: UserRoleEnum.ADMIN,
    deletedAt: null,
  });

  console.log('🚀 Admin user seeded successfully');
}
