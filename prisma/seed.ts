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
  const domainName = 'jjmttl.nl';

  await prisma.organisation.upsert({
    where: { name: 'JJMTTL' },
    update: {},
    create: {
      name: 'JJMTTL',
      domainName: domainName,
    },
  });

  await prisma.user.upsert({
    where: { email: `adminmail@${domainName}` },
    update: {},
    create: {
      email: `adminmail@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'A',
      lastName: 'Admin',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `jaron@${domainName}` },
    update: {},
    create: {
      email: `jaron@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Jaron',
      lastName: 'van Well',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
      events: {
        create: [
          {
            title: 'Max 12 people per team in a BV',
            description: 'We are going to limit the amount of people in a team in a BV to 12.',
            content: '',
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
            organisation: {
              connectOrCreate: {
                where: { name: 'JJMTTL' },
                create: { name: 'JJMTTL', domainName: domainName },
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `joy@${domainName}` },
    update: {},
    create: {
      email: `joy@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Joy',
      lastName: 'Boellaard',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
      events: {
        create: [
          {
            title: 'More teams in a BV',
            description:
              'To improve the efficiency of the company, we are going to split the teams into smaller teams. This will improve the communication between the teams and the efficiency of the company.',
            content:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque egestas orci a urna vestibulum, vel blandit felis aliquet. Pellentesque posuere turpis ut ultrices fringilla. Donec interdum nisl quis sem mattis, ac finibus elit ultrices. Duis efficitur faucibus luctus. Nam porta scelerisque urna, ut eleifend leo facilisis vel. Maecenas non quam pellentesque, maximus libero quis, gravida elit. Pellentesque ac ornare nisl, sit amet consequat eros. Mauris lorem justo, ullamcorper nec pretium id, eleifend vel leo. \nVivamus nec sagittis lorem. Mauris vitae suscipit lectus. Duis tortor ipsum, fermentum id ante non, ullamcorper hendrerit lectus. Vivamus semper velit sit amet libero ultricies aliquam. Integer a dictum ex, et gravida tortor. Integer cursus neque sed consectetur tincidunt. In porttitor aliquet lorem vitae rhoncus. Vivamus non libero cursus, accumsan dolor a, pharetra risus. Duis dignissim metus ut lorem consequat, ac sodales libero cursus. Fusce pharetra maximus fringilla. Sed tempus dignissim odio ut molestie. In sit amet bibendum urna, at euismod risus. Duis hendrerit velit ac tellus placerat, et sodales ex sollicitudin.',
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
            organisation: {
              connectOrCreate: {
                where: { name: 'JJMTTL' },
                create: { name: 'JJMTTL', domainName: domainName },
              },
            },
          },
          {
            title: 'New office',
            description: 'We had to move locations, the main office is now in Breda.',
            content:
              'Nulla nec metus sit amet tortor fermentum faucibus. Pellentesque rhoncus eros a elit venenatis, a facilisis augue venenatis. Phasellus ante erat, lacinia id odio lacinia, condimentum finibus magna. Pellentesque viverra, leo in accumsan tincidunt, lacus odio sagittis nibh, vulputate posuere nisl justo ut eros. Ut mattis arcu eget semper tempor. Cras feugiat quis sem at efficitur. Nulla facilisi.',
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
            organisation: {
              connectOrCreate: {
                where: { name: 'JJMTTL' },
                create: { name: 'JJMTTL', domainName: domainName },
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `lucas@${domainName}` },
    update: {},
    create: {
      email: `lucas@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Lucas',
      lastName: 'de Kleijn',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
      events: {
        create: [
          {
            title: '20 people per team is the new norm',
            description:
              'We are going to limit the amount of people in a team to 20 as bigger teams tend to cause chaos and some people fall to the background.',
            content:
              'Proin rhoncus dapibus quam, at tempus ante semper sit amet. Suspendisse pretium sed nunc sed tempor. Phasellus sagittis posuere tempor. In commodo eros sed massa blandit, eu volutpat metus ornare. Etiam libero nisi, facilisis vitae ante sodales, faucibus fermentum neque. Ut et eleifend turpis. Donec vehicula mi purus, sit amet efficitur nibh molestie quis. Proin quis lectus quis odio sagittis vehicula. Cras a purus eget dui efficitur suscipit. Sed a velit leo. \nUt ut urna risus. In eleifend lectus sit amet facilisis consequat. Phasellus malesuada faucibus turpis, a ornare quam consectetur ut. Donec egestas aliquet dui, ac eleifend tellus imperdiet at. Quisque rhoncus tincidunt ipsum. Maecenas nec imperdiet libero, ut iaculis mauris. Sed ac gravida magna, semper elementum neque. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce non imperdiet magna, vitae lobortis sapien. Duis sodales eu justo quis feugiat. Vestibulum massa magna, malesuada ut nisi eget, feugiat maximus urna. Sed maximus tellus sit amet est porttitor, vitae efficitur arcu iaculis. Curabitur porttitor mi interdum mauris scelerisque rutrum. Curabitur nec mauris tempus, bibendum est in, pulvinar mauris. Nulla commodo nibh diam, a hendrerit turpis faucibus ut.',
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
            organisation: {
              connectOrCreate: {
                where: { name: 'JJMTTL' },
                create: { name: 'JJMTTL', domainName: domainName },
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `matthijs@${domainName}` },
    update: {},
    create: {
      email: `matthijs@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Matthijs',
      lastName: 'Feringa',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `thomas@${domainName}` },
    update: {},
    create: {
      email: `thomas@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Thomas',
      lastName: 'van Otterloo',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `timothy@${domainName}` },
    update: {},
    create: {
      email: `timothy@${domainName}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Timothy',
      lastName: 'Borghouts',
      organisation: {
        connectOrCreate: {
          where: { name: 'JJMTTL' },
          create: { name: 'JJMTTL', domainName: domainName },
        },
      },
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
