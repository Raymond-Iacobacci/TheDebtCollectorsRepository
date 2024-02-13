import { sample } from 'lodash';
import { faker } from '@faker-js/faker';

// ----------------------------------------------------------------------

export const requests = [...Array(24)].map((_, index) => ({
  id: faker.string.uuid(),
  avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
  name: faker.person.fullName(),
  address: faker.location.streetAddress(true),
  isVerified: faker.datatype.boolean(),
  status: sample([
    'Completed',
    'Ongoing',
    'Not Started'
  ]),
  type: sample([
    'Pest Control',
    'Basic repairs',
    'Electrical',
    'Water Leaks',
    'Corrective Maintenance',
    'Indoor Appliances',
    'Plumbing',
    'Emergency Maintenance',
  ]),
  description: faker.lorem.paragraph(8),
  logs: [...Array(5)].map((_l, l_i) => ({
    id: faker.string.uuid(),
    title: [
      'Request submitted by tenant',
      'Manager contacted maintenance people',
      'Status changed to In Progress',
      'Maintenance people visited tenant',
      'Status changed to Completed',
    ][l_i],
    type: [
      'info',
      'info',
      'ongoing',
      'info',
      'completed',
    ][l_i],
    time: faker.date.past(),
  })),
  attachments: [...Array(1)].map((_a, a_i) => ({
    id: faker.string.uuid(),
    title: "Photo of Damages",
    description: faker.lorem.paragraph(2),
    image: `/assets/images/covers/cover_${a_i + 1}.jpg`,
    postedAt: faker.date.recent(),
  })),
  comments: [...Array(2)].map((_c, c_i) => ({
    id: faker.string.uuid(),
    user: sample(["Manager", "Tenant"]),
    text: faker.lorem.paragraph(3),
    postedAt: faker.date.recent(),
  }))
}));
