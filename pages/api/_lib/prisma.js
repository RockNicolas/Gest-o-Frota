import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: globalThis.process.env.DATABASE_URL,
});

const prisma = globalThis.prisma || new PrismaClient({ adapter });
if (globalThis.process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
