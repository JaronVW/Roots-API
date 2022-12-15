import { PrismaClient } from '@prisma/client';
import argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  // should be runnable with 'npx prisma db seed'

  // Tags
  const tag1 = {
    // id: 1,
    subject: 'Finances',
  };

  const tag2 = {
    // id: 2,
    subject: 'Work culture',
  };

  const tag3 = {
    // id: 3,
    subject: 'Adminstration',
  };

  const tag4 = {
    // id: 4,
    subject: 'Infrastructure',
  };

  const tag5 = {
    // id: 5,
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
      role: 'admin',
      events: {
        create: [
          {
            title: 'More teams in a BV',
            description:
              'To improve the efficiency of the company, we are going to split the teams into smaller teams. This will improve the communication between the teams and the efficiency of the company.',
            dateOfEvent: new Date('2021-01-01T00:00:00.000Z'),
            paragraphs: {
              create: [
                {
                  title: 'Splitting of teams',
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla congue molestie ultrices. Curabitur bibendum, \
                  magna quis varius pharetra, urna sapien tincidunt metus, sit amet malesuada velit velit et erat. Mauris mollis nunc \
                  id turpis viverra facilisis. Etiam dapibus consectetur gravida. Duis tincidunt neque consectetur gravida porttitor. \
                  Praesent eu dolor vehicula, aliquam diam viverra, viverra turpis. Praesent nulla turpis, tempus non lectus sit \
                  amet, aliquam sagittis dolor. Integer feugiat, libero ac rhoncus aliquet, tellus urna varius nisi, quis lobortis \
                  ligula lectus pharetra eros. Suspendisse ultrices porta leo vitae ultrices. Aliquam ut pellentesque nisl.',
                },
                {
                  title: 'New teams',
                  text: 'Vivamus tortor quam, hendrerit vitae neque id, sagittis luctus purus. Phasellus aliquam, erat quis tempor \
                  luctus, justo libero vestibulum est, eu elementum dolor lacus id enim. Nulla molestie pellentesque quam ut dapibus. \
                  Etiam neque turpis, bibendum sit amet tincidunt sit amet, interdum vel tellus. Fusce ac libero gravida, accumsan dui \
                  sed, pharetra ante. Fusce convallis, ex et elementum dapibus, ex odio dignissim lectus, non egestas nisl nisi ac \
                  tellus. Nunc rhoncus, dolor blandit porttitor finibus, leo arcu tincidunt augue, sit amet imperdiet lorem elit sit \
                  amet lorem. Sed tincidunt accumsan sem, sed commodo mauris varius eget. Etiam bibendum lacus ut varius varius. Sed \
                  magna dolor, euismod eget elementum semper, commodo non augue. Vestibulum sapien justo, mattis ut arcu eget, semper \
                  bibendum lorem. Ut eu tempor risus.',
                },
              ],
            },
            customTags: {
              create: [
                {
                  subject: 'Smaller teams',
                },
                {
                  subject: 'Splitting teams',
                },
              ],
            },
            tags: {
              connect: [
                {
                  id: 1,
                },
              ],
            },
          },
          {
            title: 'New office',
            description: 'We had to move locations, the main office is now in Breda.',
            dateOfEvent: new Date('2019-05-01T00:00:00.000Z'),
            paragraphs: {
              create: [
                {
                  title: 'Moving',
                  text: 'Phasellus volutpat, sem ac vestibulum lobortis, erat nisl molestie urna, vel tempus nunc magna sed est. \
                  Donec ut pulvinar mauris. Donec hendrerit, ex non rhoncus sodales, quam odio semper dolor, vitae euismod ex turpis \
                  ut massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque massa lacus, eleifend quis est \
                  ut, dignissim pharetra augue. Sed felis leo, lacinia et felis vel, tristique tempor nulla. Ut ut gravida ipsum, ut \
                  porta nibh. Quisque lobortis augue eget tristique viverra. Vestibulum et tellus at nulla posuere convallis. Etiam \
                  posuere ac nunc sed vehicula. Suspendisse et erat varius, finibus magna quis, placerat nisl.',
                },
              ],
            },
            customTags: {
              create: [
                {
                  subject: 'Moving',
                },
              ],
            },
            tags: {
              connect: [
                {
                  id: 5,
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
      role: 'user',
      events: {
        create: [
          {
            title: 'Max 12 people per team in a BV',
            description: 'We are going to limit the amount of people in a team in a BV to 12.',
            dateOfEvent: new Date('2013-09-09T00:00:00.000Z'),
            paragraphs: {
              create: [
                {
                  title: 'Limiting',
                  text: 'In nec vehicula orci, ac efficitur est. Quisque dui mi, mollis ac ex et, tempor vestibulum lectus. Vestibulum \
                  at nibh neque. Fusce ullamcorper egestas lectus, a condimentum nibh suscipit eu. In vitae bibendum nunc, nec mattis \
                  tellus. Nam aliquam congue sem sollicitudin mattis. Maecenas ullamcorper turpis vitae nulla tincidunt iaculis. \
                  Vivamus vulputate et arcu id mattis.',
                },
              ],
            },
            customTags: {
              create: [
                {
                  subject: 'Changing team sizes',
                },
              ],
            },
            tags: {
              connect: [
                {
                  id: 2,
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

  prisma.user.upsert({
    where: { email: `joy@${organisation}` },
    update: {},
    create: {
      email: `joy@${organisation}`,
      password: await argon2.hash('Secret12#'),
      firstName: 'Joy',
      lastName: 'Boellaard',
      role: 'user',
      events: {
        create: [
          {
            title: '20 people per team is the new norm',
            description:
              'We are going to limit the amount of people in a team to 20 as bigger teams tend to cause chaos and some people fall to the background.',
            dateOfEvent: new Date('2008-11-19T00:00:00.000Z'),
            customTags: {
              create: [
                {
                  subject: 'Changing team sizes',
                },
              ],
            },
            tags: {
              connect: [
                {
                  id: 2,
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
      role: 'user',
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
      role: 'user',
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
      role: 'user',
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
      role: 'user',
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
