import { MockContext, createMockContext } from 'prisma/context';
import { Context } from 'vm';

let mockCtx: MockContext;
let ctx: Context;

const testTag = {
  id: 1,
  subject: 'test tag 1',
};

const testEvent1 = {
  title: 'Test event 1',
  description: 'Test event 1',
  dateOfEvent: new Date(),
  userId: 1,
  tags: [testTag],
  multimediaItems: [],
  customTags: [],
  paragraphs: [],
};

const eventArray = [
  testEvent1,
  {
    title: 'Test event 1',
    description: 'Test event 1',
    dateOfEvent: new Date(),
    userId: 1,
    tags: [testTag],
    multimediaItems: [],
    customTags: [],
    paragraphs: [],
  },
];

const oneEvent = eventArray[0];

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});



interface CreateUser {
  name: string
  email: string
  acceptTermsAndConditions: boolean
}

export async function createUser(user: CreateUser, ctx: Context) {
  if (user.acceptTermsAndConditions) {
    return await ctx.prisma.user.create({
      data: user,
    })
  } else {
    return new Error('User must accept terms!')
  }
}

interface UpdateUser {
  id: number
  name: string
  email: string
}

export async function updateUsername(user: UpdateUser, ctx: Context) {
  return await ctx.prisma.user.update({
    where: { id: user.id },
    data: user,
  })
}