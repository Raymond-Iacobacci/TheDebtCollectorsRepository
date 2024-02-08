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
}));
