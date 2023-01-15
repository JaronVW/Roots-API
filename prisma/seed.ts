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
    subject: 'Financiën',
    organisationId: organisation1.id,
  };

  const tag2 = {
    subject: 'Werkcultuur',
    organisationId: organisation1.id,
  };

  const tag3 = {
    subject: 'Administratie',
    organisationId: organisation1.id,
  };

  const tag4 = {
    subject: 'Infrastructuur',
    organisationId: organisation1.id,
  };

  const tag5 = {
    subject: 'Verhuizing',
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
            title: 'Max twaalf mensen in een team per BV',
            description: 'We gaan het aantal mensen in een team per BV terugbrengen naar twaalf.',
            content: '',
            dateOfEvent: new Date('2013-09-09T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: {
                    unique_tag_organisation: { subject: 'Wijziging teamgrootte', organisationId: organisation1.id },
                  },
                  create: { subject: 'Wijziging teamgrootte', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Werkomgeving', organisationId: organisation1.id } },
                  create: { subject: 'Werkomgeving', organisation: { connect: { id: organisation1.id } } },
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
            title: 'Meer teams in een BV',
            description:
              'We gaan meer teams in een BV toestaan. Dit is een experiment om te kijken of dit de productiviteit verhoogt.',
            content:
              '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque egestas orci a urna vestibulum, vel blandit felis aliquet. Pellentesque posuere turpis ut ultrices fringilla. Donec interdum nisl quis sem mattis, ac finibus elit ultrices. Duis efficitur faucibus luctus. Nam porta scelerisque urna, ut eleifend leo facilisis vel. Maecenas non quam pellentesque, maximus libero quis, gravida elit. Pellentesque ac ornare nisl, sit amet consequat eros. Mauris lorem justo, ullamcorper nec pretium id, eleifend vel leo. \nVivamus nec sagittis lorem. Mauris vitae suscipit lectus. Duis tortor ipsum, fermentum id ante non, ullamcorper hendrerit lectus. Vivamus semper velit sit amet libero ultricies aliquam. Integer a dictum ex, et gravida tortor. Integer cursus neque sed consectetur tincidunt. In porttitor aliquet lorem vitae rhoncus. Vivamus non libero cursus, accumsan dolor a, pharetra risus. Duis dignissim metus ut lorem consequat, ac sodales libero cursus. Fusce pharetra maximus fringilla. Sed tempus dignissim odio ut molestie. In sit amet bibendum urna, at euismod risus. Duis hendrerit velit ac tellus placerat, et sodales ex sollicitudin.</p>',
            dateOfEvent: new Date('2021-01-01T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { unique_tag_organisation: { subject: 'Kleinere teams', organisationId: organisation1.id } },
                  create: { subject: 'Kleinere teams', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Teams splitten', organisationId: organisation1.id } },
                  create: { subject: 'Teams splitten', organisation: { connect: { id: organisation1.id } } },
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
            title: 'Nieuw kantoorkantoor',
            description: 'We zijn verhuisd naar een nieuwe locatie, het nieuwe kantoor is in Breda.',
            content:
              '<p>Nulla nec metus sit amet tortor fermentum faucibus. Pellentesque rhoncus eros a elit venenatis, a facilisis augue venenatis. Phasellus ante erat, lacinia id odio lacinia, condimentum finibus magna. Pellentesque viverra, leo in accumsan tincidunt, lacus odio sagittis nibh, vulputate posuere nisl justo ut eros. Ut mattis arcu eget semper tempor. Cras feugiat quis sem at efficitur. Nulla facilisi.</p>',
            dateOfEvent: new Date('2019-05-01T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: { unique_tag_organisation: { subject: 'Verhuizing', organisationId: organisation1.id } },
                  create: { subject: 'Verhuizing', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Nieuw kantoor', organisationId: organisation1.id } },
                  create: { subject: 'Nieuw kantoor', organisation: { connect: { id: organisation1.id } } },
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
            title: 'Twitig mensen per team is de nieuwe norm',
            description:
              'We gaan het aantal mensen per team verminderen naar twintig mensen. Dit zal de communicatie tussen de teams en de efficiëntie van de organisatie verbeteren.',
            content:
              '</p>Proin rhoncus dapibus quam, at tempus ante semper sit amet. Suspendisse pretium sed nunc sed tempor. Phasellus sagittis posuere tempor. In commodo eros sed massa blandit, eu volutpat metus ornare. Etiam libero nisi, facilisis vitae ante sodales, faucibus fermentum neque. Ut et eleifend turpis. Donec vehicula mi purus, sit amet efficitur nibh molestie quis. Proin quis lectus quis odio sagittis vehicula. Cras a purus eget dui efficitur suscipit. Sed a velit leo. \nUt ut urna risus. In eleifend lectus sit amet facilisis consequat. Phasellus malesuada faucibus turpis, a ornare quam consectetur ut. Donec egestas aliquet dui, ac eleifend tellus imperdiet at. Quisque rhoncus tincidunt ipsum. Maecenas nec imperdiet libero, ut iaculis mauris. Sed ac gravida magna, semper elementum neque. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce non imperdiet magna, vitae lobortis sapien. Duis sodales eu justo quis feugiat. Vestibulum massa magna, malesuada ut nisi eget, feugiat maximus urna. Sed maximus tellus sit amet est porttitor, vitae efficitur arcu iaculis. Curabitur porttitor mi interdum mauris scelerisque rutrum. Curabitur nec mauris tempus, bibendum est in, pulvinar mauris. Nulla commodo nibh diam, a hendrerit turpis faucibus ut.</p>',
            dateOfEvent: new Date('2008-12-11T00:00:00.000Z'),
            tags: {
              connectOrCreate: [
                {
                  where: {
                    unique_tag_organisation: { subject: 'Wijziging teamgrootte', organisationId: organisation1.id },
                  },
                  create: { subject: 'Wijziging teamgrootte', organisation: { connect: { id: organisation1.id } } },
                },
                {
                  where: { unique_tag_organisation: { subject: 'Werkomgeving', organisationId: organisation1.id } },
                  create: {
                    subject: 'Werkomgeving',
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
