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
      isActive: true,
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
      isActive: true,

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
              '<p>Naar aanleiding van de iets lagere productiviteit dan gewent in 2020, gaan we experimenteren met het aantal teams. Als begin staan we een aantal meer teams toe (ongeveer 5-8) in een BV. Als dit negatief effect heeft op de efficiëntie, dan zal dit terug verlaagt worden.</p><p>Als mensen hier bezwaar tegen hebben kunnen ze bij een leidinggevende hun mening laten weten. Dit zal dan in consideratie genomen worden.</p>',
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
            title: 'Nieuw kantoor',
            description: 'We zijn verhuisd naar een nieuwe locatie, het nieuwe kantoor is in Breda.',
            content:
              '<p>De oude locatie in Etten-Leur zal nog toegankelijk zijn voor een aantal dagen, check of je al je bezittingen mee hebt genomen!</p>',
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
      isActive: true,

      organisation: {
        connect: {
          id: organisation1.id,
        },
      },
      events: {
        create: [
          {
            title: 'Twintig mensen per team is de nieuwe norm',
            description:
              'We gaan het aantal mensen per team verminderen naar twintig mensen. Dit zal de communicatie tussen de teams en de efficiëntie van de organisatie verbeteren.',
            content:
              '</p>Uit vorig onderzoek blijkt dat mensen het als chaotisch en ongeorganiseerd ervaren wanneer er te veel mensen in een team zitten. Hierom hebben we het aantal mensen per team verlaagt naar twintig mensen.</p>',
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
      isActive: true,

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
      isActive: true,

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
      isActive: true,

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
