import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@escritorio.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário ${email} já existe, nada a fazer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, passwordHash },
  });

  console.log(`Usuário admin criado: ${email} / senha: ${password}`);
  console.log("Altere a senha após o primeiro acesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
