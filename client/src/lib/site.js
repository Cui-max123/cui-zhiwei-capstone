export const site = {
  name: 'Cui Zhiwei',
  nameZh: '崔志伟',
  studentId: '24998007',
  role: 'Full-Stack Developer & Data Management Student',
  tagline: 'I build calm, useful software and write about how it works.',
  location: 'Shenyang, China',
  email: 'cui@cuizhiwei.dev',
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  availability: 'Open to 2027 internships',
  intro:
    'I study how data moves and build interfaces that make it feel simple. Currently finishing my degree in computer science, with a focus on web data management.',
  stats: [
    { value: '6', label: 'Selected builds' },
    { value: '4', label: 'Field notes' },
    { value: '22', label: 'Tools in the box' }
  ],
  nav: [
    { to: '/projects', label: 'Work' },
    { to: '/blog', label: 'Field Notes' },
    { to: '/contact', label: 'Contact' }
  ]
};

export const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
