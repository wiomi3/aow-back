import 'dotenv/config';
import { prisma } from "./client.js";

async function main() {
  console.log('Starting seeding...');

  // 1. EmployeeTypes
  const singer = await prisma.employeeType.upsert({
    where: { name: 'Певец' },
    update: {},
    create: { name: 'Певец' },
  });

  const worker = await prisma.employeeType.upsert({
    where: { name: 'Разнорабочий' },
    update: {},
    create: { name: 'Разнорабочий' },
  });

  const animator = await prisma.employeeType.upsert({
    where: { name: 'Аниматор' },
    update: {},
    create: { name: 'Аниматор' },
  });

  console.log('Created employee types.');

  // 2. Employees
  const employee1 = await prisma.employee.create({
    data: {
      name: 'Дмитрий Иванов',
      employeeTypeId: singer.id,
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      name: 'Петр Петров',
      employeeTypeId: worker.id,
    },
  });

  const employee3 = await prisma.employee.create({
    data: {
      name: 'Мария Пидорова',
      employeeTypeId: animator.id,
    },
  });

  console.log('Created employees.');

  // 4. EventTypes
  const rehearsal = await prisma.eventType.upsert({
    where: { name: 'Репетиция' },
    update: {},
    create: {
      name: 'Репетиция',
      color: '#4A90E2',
    },
  });

  const concert = await prisma.eventType.upsert({
    where: { name: 'Концерт' },
    update: {},
    create: {
      name: 'Концерт',
      color: '#D0021B',
    },
  });

  console.log('Created event types.');

  // 5. Locations
  const studio = await prisma.location.upsert({
    where: { name: 'Студия Звукозаписи' },
    update: {},
    create: {
      name: 'Студия Звукозаписи',
      address: 'ул. Музыкальная, 10',
    },
  });

  const concertHall = await prisma.location.upsert({
    where: { name: 'Главный Концертный Зал' },
    update: {},
    create: {
      name: 'Главный Концертный Зал',
      address: 'Пл. Искусств, 1',
    },
  });

  console.log('Created locations.');

  // 6. Events
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.event.create({
    data: {
      title: 'Утренняя репетиция',
      description: 'Отработка вокальных партий',
      startAt: new Date(now.setHours(10, 0, 0, 0)),
      endAt: new Date(now.setHours(12, 0, 0, 0)),
      typeId: rehearsal.id,
      locationId: studio.id,
      employees: {
        connect: [{ id: employee1.id }, { id: employee2.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Благотворительный концерт',
      description: 'Выступление в поддержку фонда',
      startAt: new Date(tomorrow.setHours(19, 0, 0, 0)),
      endAt: new Date(tomorrow.setHours(21, 0, 0, 0)),
      typeId: concert.id,
      locationId: concertHall.id,
      employees: {
        connect: [{ id: employee1.id }, { id: employee3.id }],
      },
    },
  });

  console.log('Created events.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
