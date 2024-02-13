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
  description: "The HVAC system is acting up, causing discomfort with inconsistent heating. It's urgent to assess and fix this issue. Additionally, my refrigerator is making unusual noises, affecting food preservation and convenience. I kindly request a prompt inspection and necessary repairs to restore optimal functionality. Your swift attention to these matters is crucial for my satisfaction and to prevent further escalation. Thank you for prioritizing these concerns, enhancing my living conditions in a timely manner.",
  attachments: [...Array(1)].map((_item, i) => ({
    id: faker.string.uuid(),
    title: "Photo of Damages",
    description: "Shown here is a photo of the damages that need repaired... etc. This description can be used for various attachment details.",
    image: `/assets/images/covers/cover_${i + 1}.jpg`,
    postedAt: faker.date.recent(),
  }))
}));
