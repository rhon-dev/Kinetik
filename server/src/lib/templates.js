import Mustache from 'mustache';

export const DEFAULT_PHRASE_TEMPLATES = [
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

export const composeText = (templateText, detail, tags = []) => {
  const data = {
    detail,
    tags: tags.length > 0 ? tags.join(', ') : '',
  };
  return Mustache.render(templateText, data);
};
