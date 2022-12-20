import { PrismaClient } from '@prisma/client';
import argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  // should be runnable with 'npx prisma db seed'

  // Tags
  const tag1 = {
    subject: 'Finances',
  };

  const tag2 = {
    subject: 'Work culture',
  };

  const tag3 = {
    subject: 'Adminstration',
  };

  const tag4 = {
    subject: 'Infrastructure',
  };

  const tag5 = {
    subject: 'Relocation',
  };

  await prisma.tag.createMany({
    data: [tag1, tag2, tag3, tag4, tag5],
  });

  // Users with events
  const organisation = 'jjmttl.nl';

  await prisma.user.upsert({
    where: { email: `adminmail@${organisation}` },
    update: {},
    create: {
      email: `adminmail@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'A',
      lastName: 'Admin',
      events: {
        create: [
          {
            title: 'More teams in a BV',
            description:
              'To improve the efficiency of the company, we are going to split the teams into smaller teams. This will improve the communication between the teams and the efficiency of the company.',
            dateOfEvent: new Date('2021-01-01T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { subject: 'Smaller teams' },
                  create: { subject: 'Smaller teams' },
                },
                {
                  where: { subject: 'Splitting teams' },
                  create: { subject: 'Splitting teams' },
                },
              ],
            },
          },
          {
            title: 'New office',
            description: 'We had to move locations, the main office is now in Breda.',
            dateOfEvent: new Date('2019-05-01T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { subject: 'Moving' },
                  create: { subject: 'Moving' },
                },
                {
                  where: { subject: 'New office' },
                  create: { subject: 'New office' },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `jaron@${organisation}` },
    update: {},
    create: {
      email: `jaron@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Jaron',
      lastName: 'van Well',
      events: {
        create: [
          {
            title: 'Max 12 people per team in a BV',
            description: 'We are going to limit the amount of people in a team in a BV to 12.',
            dateOfEvent: new Date('2013-09-09T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { subject: 'Changing team sizes' },
                  create: { subject: 'Changing team sizes' },
                },
                {
                  where: { subject: 'Work environment' },
                  create: { subject: 'Work environment' },
                },
              ],
            },
            // multimediaItems: {
            //   create: [
            //     {
            //       description: 'Team work',
            //       alt: 'Imagge representing team work',
            //       url: './images/teamwork.jpg',
            //     },
            //   ],
            // },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `joy@${organisation}` },
    update: {},
    create: {
      email: `joy@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Joy',
      lastName: 'Boellaard',
      events: {
        create: [
          {
            title: '20 people per team is the new norm',
            description:
              'We are going to limit the amount of people in a team to 20 as bigger teams tend to cause chaos and some people fall to the background.',
            dateOfEvent: new Date('2008-12-11T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { subject: 'Changing team sizes' },
                  create: { subject: 'Changing team sizes' },
                },
                {
                  where: { subject: 'Work environment' },
                  create: { subject: 'Work environment' },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `lucas@${organisation}` },
    update: {},
    create: {
      email: `lucas@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Lucas',
      lastName: 'de Kleijn',
    },
  });

  await prisma.user.upsert({
    where: { email: `matthijs@${organisation}` },
    update: {},
    create: {
      email: `matthijs@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Matthijs',
      lastName: 'Feringa',
    },
  });

  await prisma.user.upsert({
    where: { email: `thomas@${organisation}` },
    update: {},
    create: {
      email: `thomas@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Thomas',
      lastName: 'van Otterloo',
    },
  });

  await prisma.user.upsert({
    where: { email: `timothy@${organisation}` },
    update: {},
    create: {
      email: `timothy@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Timothy',
      lastName: 'Borghouts',
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
