import { defineLesson } from '@core/model';

export const shellBasics = defineLesson({
  slug: 'shell-basics',
  domainId: 'linux-os',
  title: 'The shell: talking to the operating system',
  summary:
    'What a shell is, how commands, arguments and flags work, and your first dozen commands.',
  estimatedMinutes: 8,
  prerequisites: [],
  outcomes: [
    'explain the prompt, commands, arguments and flags',
    'move around with pwd, ls and cd',
    'read and create files with cat, echo and redirection',
  ],
  tags: ['shell', 'bash', 'cli', 'basics'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **shell** is a program that reads a line you type, runs the command it names, and shows the output. The prompt `learner@openlab-vm:~$` tells you who you are, which machine you are on and where you are (`~` is your home directory).',
    },
    {
      type: 'paragraph',
      text: 'Every line is `command [flags] [arguments]`. Flags start with `-` and change behaviour; arguments say what to act on. Try `ls`, then `ls -l`, then `ls -la /etc`.',
    },
    {
      type: 'interactive',
      simulatorId: 'linux-os/terminal',
      caption:
        'A sandbox: nothing you do here touches your real computer. `help` lists the commands.',
    },
    { type: 'heading', level: 2, text: 'Commands to try' },
    {
      type: 'list',
      items: [
        '`pwd` — print the working directory',
        '`ls -la` — list everything, including dotfiles, in long form',
        '`cd /etc` then `cat hostname` — change directory and print a file',
        '`cd` with no argument returns home; `cd ..` goes up one level',
        '`echo "hello" > hi.txt` creates a file; `>>` appends; `cat hi.txt` reads it back',
        '`mkdir code` and `touch code/main.c` — make a directory and an empty file',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Reading errors',
      text: 'Shell errors are terse but precise: `cat: shadow: Permission denied` says which program (`cat`), which file, and why. Learn to read them left to right.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'linux-os/shell-basics/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'In `ls -la /var/log`, what is `/var/log`?',
            choices: [
              { id: 'a', text: 'A flag' },
              { id: 'b', text: 'An argument' },
              { id: 'c', text: 'The command' },
            ],
            answerId: 'b',
            explanation: '`ls` is the command, `-la` the flags, `/var/log` the argument it lists.',
          },
          {
            id: 'q2',
            prompt: 'What does `echo hi >> notes.txt` do if notes.txt exists?',
            choices: [
              { id: 'a', text: 'Replaces its content with hi' },
              { id: 'b', text: 'Appends hi to it' },
              { id: 'c', text: 'Prints the file' },
            ],
            answerId: 'b',
            explanation: '`>` truncates and writes; `>>` appends.',
          },
        ],
      },
    },
  ],
});

export const filesystem = defineLesson({
  slug: 'filesystem',
  domainId: 'linux-os',
  title: 'The filesystem tree',
  summary: 'One tree rooted at /, where things live, and absolute versus relative paths.',
  estimatedMinutes: 7,
  prerequisites: ['linux-os/shell-basics'],
  outcomes: [
    'navigate with absolute and relative paths',
    'say what /etc, /home, /var, /tmp, /usr and /proc are for',
    'explain “everything is a file”',
  ],
  tags: ['filesystem', 'paths', 'fhs'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Linux has no drive letters. Everything hangs off a single root directory `/`. A path that starts with `/` is **absolute**; anything else is **relative** to where you are. `.` is here, `..` is the parent, `~` is your home.',
    },
    {
      type: 'interactive',
      simulatorId: 'linux-os/terminal',
      caption: 'Explore: `ls /`, `cd /var/log`, `ls -l`, `cd ../..`, `pwd`, `cat /proc/cpuinfo`.',
    },
    { type: 'heading', level: 2, text: 'Where things live' },
    {
      type: 'list',
      items: [
        '`/etc` — system configuration, plain text',
        '`/home` — one directory per user; `/root` for the superuser',
        '`/var` — data that changes: logs in `/var/log`, caches, mail',
        '`/tmp` — scratch space anyone can write; cleared on reboot',
        '`/usr` — installed programs and libraries (`/usr/bin`)',
        '`/proc` and `/sys` — not on disk at all: the kernel exposes live information as files',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Everything is a file',
      text: 'Devices, running processes and kernel settings all appear as files, so the same tools (`cat`, `ls`, redirection) work on them. `cat /proc/cpuinfo` reads the kernel, not a disk.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'linux-os/filesystem/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'You are in `/home/learner/projects`. Where does `cd ../../..` take you?',
            choices: [
              { id: 'a', text: '/home' },
              { id: 'b', text: '/' },
              { id: 'c', text: '/home/learner' },
            ],
            answerId: 'b',
            explanation: 'Three levels up: projects → learner → home → /.',
          },
          {
            id: 'q2',
            prompt: 'Where would you look for a web server’s error log?',
            choices: [
              { id: 'a', text: '/etc' },
              { id: 'b', text: '/usr/bin' },
              { id: 'c', text: '/var/log' },
            ],
            answerId: 'c',
            explanation: '`/var` holds variable data; logs go under `/var/log`.',
          },
        ],
      },
    },
  ],
});

export const permissions = defineLesson({
  slug: 'permissions',
  domainId: 'linux-os',
  title: 'Users, groups and permissions',
  summary: 'The rwx bits, who they apply to, octal notation and chmod.',
  estimatedMinutes: 9,
  prerequisites: ['linux-os/filesystem'],
  outcomes: [
    'read a mode string like -rw-r--r--',
    'convert between symbolic and octal modes',
    'explain why execute on a directory means “enter”',
  ],
  tags: ['permissions', 'chmod', 'users', 'security'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Every file has an **owner**, a **group**, and nine permission bits: read, write and execute for the owner, the group, and everyone else. `ls -l` shows them as a string like `-rw-r--r--`; `chmod` changes them.',
    },
    {
      type: 'interactive',
      simulatorId: 'linux-os/permission-bits',
      caption: 'Each column of three bits is one octal digit: r=4, w=2, x=1. 644 = rw- r-- r--.',
    },
    { type: 'heading', level: 2, text: 'Directories are different' },
    {
      type: 'paragraph',
      text: 'On a directory, **read** lets you list names, **write** lets you create or delete entries, and **execute** lets you *enter* it or reach anything inside. A directory with `r--` but no `x` can be listed but not entered. Tick “Treat as a directory” above to see the wording change.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Private keys',
      text: 'SSH refuses to use a private key that others can read. The fix is `chmod 600 ~/.ssh/id_ed25519`: owner read/write, nobody else anything. The lab after this lesson has you do exactly that.',
    },
    { type: 'heading', level: 2, text: 'Common modes' },
    {
      type: 'list',
      items: [
        '`644` files: you edit, everyone reads (documents, web pages)',
        '`600` files: only you (keys, secrets)',
        '`755` directories and programs: you change, everyone enters/runs',
        '`700` directories: only you (`~/.ssh`)',
        '`777` almost never: anyone can change or delete',
      ],
    },
    {
      type: 'quiz',
      quiz: {
        id: 'linux-os/permissions/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'What octal mode is `-rwxr-x---`?',
            choices: [
              { id: 'a', text: '750' },
              { id: 'b', text: '755' },
              { id: 'c', text: '770' },
            ],
            answerId: 'a',
            explanation: 'rwx=7, r-x=5, ---=0.',
          },
          {
            id: 'q2',
            prompt: 'A directory is `drw-r--r--`. Can its owner `cd` into it?',
            choices: [
              { id: 'a', text: 'Yes' },
              { id: 'b', text: 'No, execute is missing' },
            ],
            answerId: 'b',
            explanation: 'Entering a directory needs the x bit, regardless of r and w.',
          },
        ],
      },
    },
  ],
});

export const processes = defineLesson({
  slug: 'processes',
  domainId: 'linux-os',
  title: 'Processes and the scheduler',
  summary: 'What a process is, its states, and how round-robin scheduling shares one CPU.',
  estimatedMinutes: 9,
  prerequisites: ['linux-os/shell-basics'],
  outcomes: [
    'define process, PID and process state',
    'explain time slices and context switches',
    'predict how the quantum trades responsiveness against overhead',
  ],
  tags: ['processes', 'scheduling', 'cpu', 'round-robin'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **process** is a running program: its code, memory, open files and a **PID**. At any instant a single CPU core runs exactly one process; the **scheduler** decides which, and switches between them so fast that all appear to run at once.',
    },
    {
      type: 'paragraph',
      text: 'The simplest fair policy is **round-robin**: each ready process gets the CPU for at most one **quantum** (time slice), then goes to the back of the queue. Switching costs time — the kernel must save one process’s registers and restore another’s: a **context switch**.',
    },
    {
      type: 'interactive',
      simulatorId: 'linux-os/scheduler',
      caption:
        'Three processes with different CPU bursts. Change the quantum and watch the timeline and context-switch count.',
    },
    { type: 'heading', level: 2, text: 'Process states' },
    {
      type: 'list',
      items: [
        '**Running** — on the CPU right now',
        '**Ready** — could run, waiting in the queue',
        '**Blocked / sleeping** — waiting for I/O, a timer or a lock; not in the queue at all',
        '**Terminated (zombie)** — finished, waiting for its parent to collect the exit status',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'The quantum trade-off',
      text: 'A tiny quantum makes every process respond quickly but wastes time switching. A huge quantum becomes first-come-first-served: the editor waits for the whole compile. Real schedulers (Linux CFS/EEVDF) pick slices dynamically and favour interactive tasks.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'linux-os/processes/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'A process waiting for a disk read is…',
            choices: [
              { id: 'a', text: 'Ready' },
              { id: 'b', text: 'Blocked' },
              { id: 'c', text: 'Running' },
            ],
            answerId: 'b',
            explanation:
              'It cannot use the CPU until the I/O completes, so it is not in the ready queue.',
          },
          {
            id: 'q2',
            prompt: 'Making the quantum very large mostly affects…',
            choices: [
              { id: 'a', text: 'Total CPU work' },
              { id: 'b', text: 'Responsiveness of short tasks' },
              { id: 'c', text: 'Memory use' },
            ],
            answerId: 'b',
            explanation: 'Total work is unchanged; short tasks wait behind long ones.',
          },
        ],
      },
    },
  ],
});

export const memory = defineLesson({
  slug: 'virtual-memory',
  domainId: 'linux-os',
  title: 'Virtual memory and paging',
  summary: 'Pages, frames, page faults, and why LRU usually beats FIFO.',
  estimatedMinutes: 9,
  prerequisites: ['linux-os/processes'],
  outcomes: [
    'explain the difference between a virtual page and a physical frame',
    'trace page faults for a reference string',
    'compare FIFO and LRU replacement',
  ],
  tags: ['memory', 'paging', 'page-fault', 'lru'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Each process sees its own private address space, split into fixed-size **pages** (usually 4 KiB). Physical RAM is split into **frames** of the same size. A per-process **page table** maps pages to frames; the CPU’s MMU does the translation on every access.',
    },
    {
      type: 'paragraph',
      text: 'When a page is not in any frame, the access traps into the kernel: a **page fault**. The kernel loads the page, evicting another if RAM is full. Which one to evict is the **replacement policy**.',
    },
    {
      type: 'interactive',
      simulatorId: 'linux-os/paging',
      caption:
        'A classic reference string. Count faults with FIFO, then switch to LRU. Try 4 frames.',
    },
    { type: 'heading', level: 2, text: 'FIFO versus LRU' },
    {
      type: 'list',
      items: [
        '**FIFO** evicts the page that has been resident longest — even if it is used constantly.',
        '**LRU** evicts the page unused for the longest time, betting that recent use predicts future use. Usually better, costlier to track exactly, so kernels approximate it (clock / second-chance algorithms).',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Thrashing',
      text: 'If a program’s working set is larger than the frames it is given, almost every access faults and the machine spends its time swapping instead of computing. More RAM or a smaller working set is the only cure.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'linux-os/virtual-memory/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'A page fault means…',
            choices: [
              { id: 'a', text: 'A bug in the program' },
              { id: 'b', text: 'The page is not currently in a physical frame' },
              { id: 'c', text: 'The page table is corrupt' },
            ],
            answerId: 'b',
            explanation: 'Faults are normal: they are how pages get loaded on demand.',
          },
          {
            id: 'q2',
            prompt: 'With the reference string above and 3 frames, which policy faults less?',
            choices: [
              { id: 'a', text: 'FIFO' },
              { id: 'b', text: 'LRU' },
              { id: 'c', text: 'They tie' },
            ],
            answerId: 'b',
            explanation: 'LRU gives 12 faults to FIFO’s 15 here.',
          },
        ],
      },
    },
  ],
});
