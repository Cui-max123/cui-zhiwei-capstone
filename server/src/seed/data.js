const fs = require('fs');
const path = require('path');

const readPost = (name) =>
  fs.readFileSync(path.join(__dirname, 'posts', name), 'utf8').trim();

const accounts = {
  admin: {
    username: 'cuizhiwei',
    email: 'cui@cuizhiwei.dev',
    password: 'CuiZhiwei2026!',
    role: 'admin'
  },
  linwei: {
    username: 'linwei',
    email: 'linwei@example.com',
    password: 'Reader2026!',
    role: 'author'
  },
  maya: {
    username: 'maya',
    email: 'maya@example.com',
    password: 'Reader2026!',
    role: 'author'
  }
};

const projects = [
  {
    slug: 'meridian',
    title: 'Meridian',
    summary: 'A calmer way to see where the month actually went — a private budget visualizer built around sankey flows instead of spreadsheets.',
    description:
      'Meridian turns a plain list of transactions into a set of readable flows: income in, spending categories out, savings set aside. It is a personal finance tool that refuses to nag you. Instead of budgets that scold, it shows proportions and lets the pattern do the talking.',
    problem:
      'Every budgeting app I tried wanted a five-minute onboarding quiz before it would show me anything, then buried the useful chart behind a paywall. I wanted the one chart I actually needed — where the money went — in one screen, with my own CSV files.',
    solution:
      'I built a small parser that normalizes bank and WeChat exports into one schema, a sankey diagram for the overview, and a monthly comparison view. Everything runs locally: transactions are stored in IndexedDB so no financial data ever leaves the device.',
    outcome:
      'The first version took three evenings and already replaced my spreadsheet. The hard part was not the chart — it was making two different bank exports look the same before any visualization touched them.',
    category: 'Frontend',
    status: 'in-progress',
    year: '2026',
    role: 'Solo — design & build',
    timeline: '3 weeks, ongoing',
    techStack: ['React', 'TypeScript', 'D3', 'IndexedDB', 'Vite'],
    highlights: [
      { label: 'Charts', value: 'Sankey + stacked area, built on D3' },
      { label: 'Privacy', value: 'All data stays in the browser' },
      { label: 'Parsers', value: '2 bank formats → 1 schema' }
    ],
    imageUrl: '/covers/meridian.svg',
    repoUrl: '',
    liveUrl: '',
    featured: true,
    order: 1
  },
  {
    slug: 'coursegraph',
    title: 'CourseGraph',
    summary: 'A prerequisite planner that draws your degree as a graph, so you can see which course blocks which — before registration closes.',
    description:
      'CourseGraph turns a list of courses and prerequisites into an interactive dependency graph. Students can click a course, see what unlocks when they pass it, and check a degree plan for impossible paths. It was a team project for a web development course.',
    problem:
      'Course registration hands you a flat list of sections. Prerequisites live in a separate PDF. Every term, someone signs up for a course they cannot take and finds out two weeks later.',
    solution:
      'We modelled courses and requirements as a graph, then rendered it with a force-directed layout. A "requirements" view reverses the arrows so you can see, for any goal course, the full chain of classes you still need.',
    outcome:
      'Two classmates used it during real registration. The biggest lesson was that graph layout is a UX problem: the first version was technically correct and completely unreadable until we added grouping by faculty.',
    category: 'Full-stack',
    status: 'shipped',
    year: '2025',
    role: 'Backend + graph layout — team of 3',
    timeline: '6 weeks',
    techStack: ['React', 'Express', 'MongoDB', 'D3'],
    highlights: [
      { label: 'Graph', value: 'Force-directed prerequisite layout' },
      { label: 'Reverse view', value: 'What you still need to take' },
      { label: 'Team', value: 'Built with 2 classmates' }
    ],
    imageUrl: '/covers/coursegraph.svg',
    repoUrl: '',
    liveUrl: '',
    featured: true,
    order: 2
  },
  {
    slug: 'signal',
    title: 'Signal',
    summary: 'A tiny uptime monitor that pings your services on a schedule and pushes a notification the moment one of them stumbles.',
    description:
      'Signal is a self-hosted uptime monitor. You register a URL, it checks it on a schedule, and when a check fails it sends a webhook or a notification. There is no dashboard you have to watch — it only bothers you when something is wrong.',
    problem:
      'I had a couple of small projects deployed on free tiers that would sleep or crash without telling me. I wanted to know when they went down, not a chart of how often.',
    solution:
      'A cron-based scheduler runs checks, stores results in SQLite, and emits events over Server-Sent Events for a lightweight status page. Failures trigger a webhook so I can wire it to any notification channel.',
    outcome:
      'This is a concept I return to whenever I deploy something new. The interesting problem is failure detection: distinguishing "down" from "slow" needs a retry policy, not a single timeout.',
    category: 'Tooling',
    status: 'concept',
    year: '2026',
    role: 'Solo — concept & prototype',
    timeline: 'Design spec',
    techStack: ['Node.js', 'SQLite', 'Server-Sent Events', 'cron'],
    highlights: [
      { label: 'Push', value: 'Notifies only on state change' },
      { label: 'Retries', value: 'Down vs. slow detection' }
    ],
    imageUrl: '/covers/signal.svg',
    repoUrl: '',
    liveUrl: '',
    featured: false,
    order: 3
  },
  {
    slug: 'shelf',
    title: 'Shelf',
    summary: 'A reading-list progressive web app that works offline and lets you log books from anywhere, even on a train with no signal.',
    description:
      'Shelf is a personal reading list. You add a book, mark it as reading or finished, and write short notes. It stores everything locally and syncs when it can, so the queue survives a dead connection.',
    problem:
      'I keep a reading list in a notes app that does not work offline and does not separate "want to read" from "reading" from "finished". I wanted one queue I could trust on a commute.',
    solution:
      'Shelf is a PWA backed by IndexedDB with a service worker for offline support. A small import tool accepts CSV exports from other reading apps, and notes are stored as plain text with no account required.',
    outcome:
      'I use it every week. The genuinely useful part was the offline cache: a reading list you can only open online is just a website with extra steps.',
    category: 'Frontend',
    status: 'shipped',
    year: '2025',
    role: 'Solo',
    timeline: '2 weeks',
    techStack: ['React', 'IndexedDB', 'Service Worker', 'PWA'],
    highlights: [
      { label: 'Offline', value: 'Works with no connection' },
      { label: 'Import', value: 'CSV from other apps' }
    ],
    imageUrl: '/covers/shelf.svg',
    repoUrl: '',
    liveUrl: '',
    featured: false,
    order: 4
  },
  {
    slug: 'fieldnotes',
    title: 'Fieldnotes',
    summary: 'This site — a portfolio and blog with a REST API, JWT authentication and an admin dashboard for managing every piece of content.',
    description:
      'Fieldnotes is the portfolio and blog you are reading now. It is the capstone project for this course: an Express and MongoDB API behind a React single-page application, with authentication, ownership checks, comments and a full admin dashboard.',
    problem:
      'My projects were scattered across GitHub and my writing across notes apps. I wanted one place where a visitor could read about me, click into a project, and see that I finish things.',
    solution:
      'The back end is a REST API with six resource groups (users, projects, skills, posts, comments, messages), JWT authentication, a protect middleware and author-level ownership checks. The front end is a React SPA with routing, a Context-based auth layer and an admin dashboard for full CRUD.',
    outcome:
      'Building the admin dashboard first forced the data model to be honest. The public site is a presentation of decisions; the dashboard is where those decisions get made.',
    category: 'Full-stack',
    status: 'shipped',
    year: '2026',
    role: 'Solo — full stack',
    timeline: '4 weeks',
    techStack: ['React', 'Express', 'MongoDB', 'Mongoose', 'JWT'],
    highlights: [
      { label: 'API', value: '30 endpoints, JWT + ownership' },
      { label: 'Admin', value: 'Full CRUD for every resource' },
      { label: 'Docs', value: 'Interactive endpoint reference' }
    ],
    imageUrl: '/covers/fieldnotes.svg',
    repoUrl: '',
    liveUrl: '',
    featured: true,
    order: 0
  },
  {
    slug: 'tidepool',
    title: 'Tidepool',
    summary: 'A command-line tool that takes messy CSV files — inconsistent headers, missing cells, duplicate rows — and returns clean, typed data.',
    description:
      'Tidepool is a small CLI for cleaning tabular data. It normalizes column names, detects and reports missing values, deduplicates rows, and emits a typed CSV or JSON. It is the tool I wished I had during a data management assignment.',
    problem:
      'Coursework kept handing me CSV files with different encodings, mixed casing in headers and half-empty rows. I kept writing the same cleaning script from scratch, slightly differently, each time.',
    solution:
      'Tidepool packages those scripts into one command with a small configuration file. It runs a sequence of passes — parse, normalize, validate, dedupe, emit — and prints a report of what it changed so the cleaning is auditable.',
    outcome:
      'The report was the feature that mattered. Cleaning data silently is how you lose a column without noticing; Tidepool tells you exactly what it dropped and why.',
    category: 'Data',
    status: 'in-progress',
    year: '2026',
    role: 'Solo',
    timeline: 'Ongoing',
    techStack: ['Python', 'pandas', 'Click'],
    highlights: [
      { label: 'Audit', value: 'Reports every change it makes' },
      { label: 'Typed', value: 'Emits clean CSV or JSON' }
    ],
    imageUrl: '/covers/tidepool.svg',
    repoUrl: '',
    liveUrl: '',
    featured: false,
    order: 5
  }
];

const skills = [
  { name: 'JavaScript', category: 'Frontend', level: 5, order: 1 },
  { name: 'React', category: 'Frontend', level: 5, order: 2 },
  { name: 'TypeScript', category: 'Frontend', level: 4, order: 3 },
  { name: 'CSS architecture', category: 'Frontend', level: 4, order: 4 },
  { name: 'Accessibility', category: 'Frontend', level: 3, order: 5 },
  { name: 'Node.js', category: 'Backend', level: 4, order: 1 },
  { name: 'Express', category: 'Backend', level: 4, order: 2 },
  { name: 'REST API design', category: 'Backend', level: 4, order: 3 },
  { name: 'JWT & auth', category: 'Backend', level: 4, order: 4 },
  { name: 'MongoDB', category: 'Database', level: 4, order: 1 },
  { name: 'Mongoose', category: 'Database', level: 4, order: 2 },
  { name: 'Data modelling', category: 'Database', level: 4, order: 3 },
  { name: 'SQL', category: 'Database', level: 3, order: 4 },
  { name: 'Git', category: 'Tooling', level: 4, order: 1 },
  { name: 'Vite', category: 'Tooling', level: 4, order: 2 },
  { name: 'Docker', category: 'Tooling', level: 3, order: 3 },
  { name: 'Testing', category: 'Tooling', level: 3, order: 4 },
  { name: 'Python', category: 'Data', level: 4, order: 1 },
  { name: 'pandas', category: 'Data', level: 3, order: 2 },
  { name: 'D3', category: 'Data', level: 3, order: 3 },
  { name: 'Figma', category: 'Design', level: 3, order: 1 },
  { name: 'Design systems', category: 'Design', level: 3, order: 2 }
];

const posts = [
  {
    slug: 'modelling-uncertainty',
    title: 'What MongoDB taught me about modelling uncertainty',
    excerpt: 'A schema is not a description of what is in the database — it is a promise about what the application is allowed to read tomorrow.',
    tags: ['mongodb', 'data-modelling', 'backend'],
    coverImage: '/covers/post-modelling.svg',
    featured: true,
    published: true,
    content: readPost('modelling-uncertainty.md')
  },
  {
    slug: 'jwt-is-a-receipt',
    title: 'A JWT is a receipt, not a session',
    excerpt: 'A token proves a claim was issued. It does not prove the claim is still allowed to do anything. That distinction is the whole security model.',
    tags: ['auth', 'security', 'jwt'],
    coverImage: '/covers/post-jwt.svg',
    featured: false,
    published: true,
    content: readPost('jwt-is-a-receipt.md')
  },
  {
    slug: 'admin-dashboard',
    title: 'The admin dashboard is the real product',
    excerpt: 'Visitors see the finished site. You see the dashboard you use to put it there. If the second one is bad, the first becomes a museum.',
    tags: ['ux', 'react', 'product'],
    coverImage: '/covers/post-dashboard.svg',
    featured: false,
    published: true,
    content: readPost('admin-dashboard.md')
  },
  {
    slug: 'writing-about-yourself',
    title: 'Shipping a portfolio when you hate writing about yourself',
    excerpt: 'A portfolio that only shows successes reads like a brochure. One that explains a wrong turn reads like a person.',
    tags: ['process', 'career'],
    coverImage: '/covers/post-writing.svg',
    featured: false,
    published: true,
    content: readPost('writing-about-yourself.md')
  }
];

const comments = [
  {
    postSlug: 'modelling-uncertainty',
    authorKey: 'linwei',
    body: 'The "fact vs. view" distinction is the clearest way I have seen this put. I have definitely stored completion percentages before and regretted it.'
  },
  {
    postSlug: 'modelling-uncertainty',
    authorKey: 'maya',
    body: 'The two-query comment count trick saved me an N+1 problem last week. Thanks for spelling it out with code.'
  },
  {
    postSlug: 'jwt-is-a-receipt',
    authorKey: 'linwei',
    body: 'The tokenVersion idea is exactly the "small amount of state for a large amount of control" you describe. Do you have a write-up on the cookie side?'
  },
  {
    postSlug: 'admin-dashboard',
    authorKey: 'maya',
    body: 'Building the dashboard first is advice I wish I had read before my last project. The data model would have been different.'
  },
  {
    postSlug: 'writing-about-yourself',
    authorKey: 'linwei',
    body: 'The four prompts worked for me immediately. Writing into a shape is the whole trick.'
  }
];

const messages = [
  {
    name: 'Lin Wei',
    email: 'linwei@example.com',
    message:
      'Hi Cui — I read your CourseGraph case study and we are looking for a part-time front-end developer for a similar scheduling tool. Would you be open to a short chat this week?',
    read: false
  },
  {
    name: 'Maya Chen',
    email: 'maya@example.com',
    message:
      'Just wanted to say the MongoDB modelling post was genuinely useful. The "schema is a promise" framing changed how I review pull requests.',
    read: true
  }
];

module.exports = { accounts, projects, skills, posts, comments, messages };
