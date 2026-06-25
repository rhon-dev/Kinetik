import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PHRASE_TEMPLATES = [
  {
    category: 'Coding',
    templateText: 'Worked on {{detail}}{{#tags}} using {{tags}}{{/tags}}.',
  },
  {
    category: 'Debugging',
    templateText: 'Investigated and resolved {{detail}}.',
  },
  {
    category: 'Meeting',
    templateText: 'Attended a meeting regarding {{detail}}.',
  },
  {
    category: 'Documentation',
    templateText: 'Documented {{detail}}.',
  },
  {
    category: 'Testing',
    templateText: 'Tested {{detail}} and recorded results.',
  },
  {
    category: 'Research',
    templateText: 'Researched {{detail}} to support upcoming work.',
  },
  {
    category: 'Admin',
    templateText: 'Completed administrative task: {{detail}}.',
  },
];

async function main() {
  console.log('Seeding database...');

  // Note: Built-in phrase templates are created per-user on first diary access
  // This seed file is a placeholder for future global seed data

  console.log('✓ Seed data ready (templates created per-user on first use)');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { DEFAULT_PHRASE_TEMPLATES };
