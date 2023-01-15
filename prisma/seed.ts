import { PrismaClient } from '@prisma/client';
import argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  // should be runnable with 'npx prisma db seed'
  const domainName1 = 'jjmttl.nl';

  const organisation1 = await prisma.organisation.create({
    data: {
      name: 'JJMTTL',
      domainName: domainName1,
    },
  });

  // Tags
  const tag1 = {
    subject: 'Finances',
    organisationId: organisation1.id,
  };

  const tag2 = {
    subject: 'Work culture',
    organisationId: organisation1.id,
  };

  const tag3 = {
    subject: 'Adminstration',
    organisationId: organisation1.id,
  };

  const tag4 = {
    subject: 'Infrastructure',
    organisationId: organisation1.id,
  };

  const tag5 = {
    subject: 'Relocation',
    organisationId: organisation1.id,
  };

  await prisma.tag.createMany({
    data: [tag1, tag2, tag3, tag4, tag5],
  });

  // Users with events

  await prisma.user.upsert({
    where: { email: `jaron@${domainName1}` },
    update: {},
    create: {
      email: `jaron@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Jaron',
      lastName: 'van Well',
      organisation: {
        connect: {
          id: organisation1.id,
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
                  where: {
                    unique_tag_organisation: { subject: 'Changing team sizes', organisationId: organisation1.id },
                  },
                  create: { subject: 'Changing team sizes', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Work environment', organisationId: organisation1.id } },
                  create: { subject: 'Work environment', organisation: { connect: { id: organisation1.id } } },
                },
              ],
            },
            organisation: {
              connect: {
                id: organisation1.id,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `joy@${domainName1}` },
    update: {},
    create: {
      email: `joy@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Joy',
      lastName: 'Boellaard',
      organisation: {
        connect: {
          id: organisation1.id,
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
                  where: { unique_tag_organisation: { subject: 'Smaller teams', organisationId: organisation1.id } },
                  create: { subject: 'Smaller teams', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Splitting teams', organisationId: organisation1.id } },
                  create: { subject: 'Splitting teams', organisation: { connect: { id: organisation1.id } } },
                },
              ],
            },
            organisation: {
              connect: {
                id: organisation1.id,
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
                  where: { unique_tag_organisation: { subject: 'Moving', organisationId: organisation1.id } },
                  create: { subject: 'Moving', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'New office', organisationId: organisation1.id } },
                  create: { subject: 'New office', organisation: { connect: { id: organisation1.id } } },
                },
              ],
            },
            organisation: {
              connect: {
                id: organisation1.id,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `lucas@${domainName1}` },
    update: {},
    create: {
      email: `lucas@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Lucas',
      lastName: 'de Kleijn',
      organisation: {
        connect: {
          id: organisation1.id,
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
                  where: {
                    unique_tag_organisation: { subject: 'Changing team sizes', organisationId: organisation1.id },
                  },
                  create: { subject: 'Changing team sizes', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Work environment', organisationId: organisation1.id } },
                  create: {
                    subject: 'Work environment',
                    organisation: { connect: { id: organisation1.id } },
                  },
                },
              ],
            },
            organisation: {
              connect: {
                id: organisation1.id,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `matthijs@${domainName1}` },
    update: {},
    create: {
      email: `matthijs@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Matthijs',
      lastName: 'Feringa',
      organisation: {
        connect: {
          id: organisation1.id,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `thomas@${domainName1}` },
    update: {},
    create: {
      email: `thomas@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Thomas',
      lastName: 'van Otterloo',
      organisation: {
        connect: {
          id: organisation1.id,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: `timothy@${domainName1}` },
    update: {},
    create: {
      email: `timothy@${domainName1}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Timothy',
      lastName: 'Borghouts',
      organisation: {
        connect: {
          id: organisation1.id,
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
