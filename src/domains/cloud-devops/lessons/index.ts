import { defineLesson } from '@core/model';

export const versionControl = defineLesson({
  slug: 'version-control',
  domainId: 'cloud-devops',
  title: 'Version control with Git',
  summary: 'Commits, branches as movable labels, and the two ways a merge can go.',
  estimatedMinutes: 9,
  prerequisites: [],
  outcomes: [
    'explain commits as snapshots with parent links',
    'describe a branch as a pointer and HEAD as the current branch',
    'tell a fast-forward from a merge commit',
  ],
  tags: ['git', 'version-control', 'branching', 'merge'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **commit** is a snapshot of your project plus a link to the commit before it (its **parent**). Follow the links back and you get the full history. A **branch** is just a named label pointing at one commit; committing moves the current branch’s label forward. **HEAD** says which branch you are on.',
    },
    {
      type: 'interactive',
      simulatorId: 'cloud-devops/git-graph',
      caption:
        'Press Play for a typical feature-branch workflow, or drive it yourself with the buttons. Orange commits have two parents.',
    },
    { type: 'heading', level: 2, text: 'Two kinds of merge' },
    {
      type: 'list',
      items: [
        '**Fast-forward**: if main has not moved since you branched, merging just slides main’s label up to the feature’s tip. No new commit.',
        '**Merge commit**: if both branches gained commits, Git creates a new commit with **two parents** that joins the histories.',
        'Creating a branch does not switch to it. Forgetting `checkout` (or `switch`) is the classic way to commit to the wrong branch — try it.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why this matters for DevOps',
      text: 'Every pipeline, review and deployment in the next lessons is triggered by commits and branches. Teams typically protect main and require changes to arrive through reviewed branches.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cloud-devops/git/quiz',
        questions: [
          {
            id: 'q1',
            prompt:
              'You branch from main, commit twice on the branch, then merge it into an unchanged main. What happens?',
            choices: [
              { id: 'a', text: 'A merge commit with two parents' },
              { id: 'b', text: 'A fast-forward' },
              { id: 'c', text: 'A conflict' },
            ],
            answerId: 'b',
            explanation:
              'main’s tip is an ancestor of the branch tip, so its label just moves forward.',
          },
          {
            id: 'q2',
            prompt: 'What is a branch in Git?',
            choices: [
              { id: 'a', text: 'A copy of all files' },
              { id: 'b', text: 'A movable pointer to a commit' },
              { id: 'c', text: 'A separate repository' },
            ],
            answerId: 'b',
            explanation: 'That is why creating branches is instant and cheap.',
          },
        ],
      },
    },
  ],
});

export const cicd = defineLesson({
  slug: 'ci-cd-pipelines',
  domainId: 'cloud-devops',
  title: 'CI/CD pipelines',
  summary:
    'Automated checks on every commit, a deploy that only happens when they pass, and the critical path.',
  estimatedMinutes: 8,
  prerequisites: ['cloud-devops/version-control'],
  outcomes: [
    'describe continuous integration and continuous delivery',
    'explain why a failed job must block the deploy',
    'shorten a pipeline by running independent jobs in parallel',
  ],
  tags: ['ci', 'cd', 'pipeline', 'automation'],
  blocks: [
    {
      type: 'paragraph',
      text: '**Continuous integration** runs automated checks — lint, tests, build — on every push. **Continuous delivery** extends that to deployment: if everything passes, the change ships. Jobs form a graph: each job lists what must succeed before it starts.',
    },
    {
      type: 'interactive',
      simulatorId: 'cloud-devops/ci-pipeline',
      caption:
        'Run it with the bug, then without. Then switch on parallel jobs. Each column is one time unit.',
    },
    { type: 'heading', level: 2, text: 'What to notice' },
    {
      type: 'list',
      items: [
        'With the bug, unit tests fail and build, E2E and deploy are **skipped**. Broken code never ships.',
        'Run one after another, the pipeline takes 11 time units. Running lint beside unit tests and splitting E2E into two shards cuts it to 8 — the length of the longest chain of dependent jobs, called the **critical path**.',
        'Parallel jobs also report failure sooner: the failing unit test finishes at time 3 instead of 4.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'This project does it too',
      text: 'OPENLAB’s own `.github/workflows/ci.yml` runs typecheck, lint and tests, then a build, then browser tests; `deploy.yml` publishes only from main.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cloud-devops/cicd/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Unit tests fail. What should happen to the deploy job?',
            choices: [
              { id: 'a', text: 'Run anyway' },
              { id: 'b', text: 'Be skipped' },
              { id: 'c', text: 'Retry forever' },
            ],
            answerId: 'b',
            explanation: 'A deploy that ignores failures defeats the purpose of the pipeline.',
          },
          {
            id: 'q2',
            prompt: 'What limits how short a pipeline can be?',
            choices: [
              { id: 'a', text: 'The number of jobs' },
              { id: 'b', text: 'The critical path of dependent jobs' },
              { id: 'c', text: 'The slowest single job only' },
            ],
            answerId: 'b',
            explanation: 'Independent jobs can overlap; a chain of dependencies cannot.',
          },
        ],
      },
    },
  ],
});

export const containers = defineLesson({
  slug: 'containers-and-layers',
  domainId: 'cloud-devops',
  title: 'Containers and image layers',
  summary:
    'What a container is, how images are built in cached layers, and how instruction order decides rebuild time.',
  estimatedMinutes: 9,
  // Cross-domain prerequisite: a container is a process with fences around it.
  prerequisites: ['cloud-devops/ci-cd-pipelines', 'linux-os/processes'],
  outcomes: [
    'explain a container as an isolated process plus a filesystem image',
    'describe how each Dockerfile instruction becomes a cached layer',
    'order a Dockerfile so everyday code changes rebuild quickly',
  ],
  tags: ['containers', 'docker', 'images', 'build-cache'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **container** is an ordinary process that the kernel fences off: it sees its own filesystem, process list and network. The filesystem comes from an **image**, built from a Dockerfile one instruction at a time. Each instruction produces a **layer**, and layers are cached.',
    },
    {
      type: 'paragraph',
      text: 'The rule: when an instruction’s inputs change, that layer **and every layer after it** must be rebuilt. So the order of instructions decides what a change costs.',
    },
    {
      type: 'interactive',
      simulatorId: 'cloud-devops/docker-layers',
      caption:
        'Step through a rebuild after a source edit. Then move COPY . . down below RUN npm ci and try again.',
    },
    { type: 'heading', level: 2, text: 'The classic fix' },
    {
      type: 'paragraph',
      text: 'Copying the whole source before installing dependencies means every code edit re-runs `npm ci`: 2 + 1 + 30 + 15 = **48 s**. Copy just `package.json` and the lockfile first, install, then copy the rest: a code edit now rebuilds only the last two layers, **17 s**. Changing a dependency still costs 48 s — that is fine, it happens rarely.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Order from least to most frequently changed',
      text: 'Base image, system packages, dependency manifests, dependency install, then your code. The same idea speeds up CI caches too.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cloud-devops/containers/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'A layer’s input changes. Which layers rebuild?',
            choices: [
              { id: 'a', text: 'Only that one' },
              { id: 'b', text: 'That one and all after it' },
              { id: 'c', text: 'All of them' },
            ],
            answerId: 'b',
            explanation:
              'Each layer builds on the one before, so the cache breaks from that point on.',
          },
          {
            id: 'q2',
            prompt: 'What is a container, underneath?',
            choices: [
              { id: 'a', text: 'A small virtual machine with its own kernel' },
              { id: 'b', text: 'An isolated process sharing the host kernel' },
              { id: 'c', text: 'A compressed archive' },
            ],
            answerId: 'b',
            explanation: 'Namespaces and cgroups isolate it; the kernel is shared.',
          },
        ],
      },
    },
  ],
});

export const reliability = defineLesson({
  slug: 'reliability-and-slos',
  domainId: 'cloud-devops',
  title: 'Reliability, SLOs and error budgets',
  summary: 'Turning “highly available” into minutes of downtime, and spending them deliberately.',
  estimatedMinutes: 7,
  prerequisites: ['cloud-devops/ci-cd-pipelines'],
  outcomes: [
    'convert an availability target into allowed downtime',
    'explain an error budget and how it guides release decisions',
    'see why each extra nine is ten times harder',
  ],
  tags: ['sre', 'slo', 'availability', 'observability'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **service level objective** (SLO) is a target such as “available 99.9% of the time over 30 days”. Its flip side is the **error budget**: the downtime you are allowed. 0.1% of 30 days is **43.2 minutes**.',
    },
    {
      type: 'interactive',
      simulatorId: 'cloud-devops/error-budget',
      caption:
        'The same month of incidents (50 minutes in total) against different targets. Step through the days.',
    },
    { type: 'heading', level: 2, text: 'Each nine costs ten times more' },
    {
      type: 'list',
      items: [
        '99% allows 7.2 hours a month',
        '99.9% allows 43.2 minutes a month (8.76 hours a year)',
        '99.99% allows 4.32 minutes a month — less than one slow incident',
      ],
    },
    {
      type: 'paragraph',
      text: 'At 99.9% this month’s incidents use the budget up on day 19. At 99.99% it is gone on day 3. At 99.5% there is plenty left.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Using the budget',
      text: 'While budget remains, teams ship features and take reasonable risks. When it runs out, they slow down: freeze risky deploys and spend the time on reliability. The budget turns an argument into a number.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cloud-devops/slo/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Allowed downtime at 99.9% over 30 days?',
            choices: [
              { id: 'a', text: '4.32 minutes' },
              { id: 'b', text: '43.2 minutes' },
              { id: 'c', text: '7.2 hours' },
            ],
            answerId: 'b',
            explanation: '0.001 × 30 × 24 × 60 = 43.2.',
          },
          {
            id: 'q2',
            prompt: 'The error budget is exhausted. A sensible response?',
            choices: [
              { id: 'a', text: 'Ship faster to catch up' },
              { id: 'b', text: 'Freeze risky changes and invest in reliability' },
              { id: 'c', text: 'Lower the target quietly' },
            ],
            answerId: 'b',
            explanation: 'That is the point of having a budget.',
          },
        ],
      },
    },
  ],
});
