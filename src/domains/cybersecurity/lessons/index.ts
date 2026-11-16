import { defineLesson } from '@core/model';

export const encryption = defineLesson({
  slug: 'encryption-and-keys',
  domainId: 'cybersecurity',
  title: 'Encryption, keys and keyspace',
  summary: 'Why a cipher is only as strong as the number of keys an attacker must try.',
  estimatedMinutes: 7,
  prerequisites: [],
  outcomes: [
    'explain plaintext, ciphertext and key',
    'brute-force a Caesar cipher and say why it is easy',
    'compare a 26-key cipher with a 128-bit key',
    'state Kerckhoffs’s principle',
  ],
  tags: ['cryptography', 'cipher', 'keyspace', 'brute-force'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **cipher** turns readable **plaintext** into **ciphertext** using a **key**. The Caesar cipher shifts every letter by the key: with key 3, `attack at dawn` becomes `dwwdfn dw gdzq`. Anyone with the key reverses it.',
    },
    {
      type: 'interactive',
      simulatorId: 'cybersecurity/caesar',
      caption:
        'Change the key and the message. Press Play to watch an attacker who knows the method but not the key.',
    },
    { type: 'heading', level: 2, text: 'Keyspace decides everything' },
    {
      type: 'paragraph',
      text: 'The Caesar cipher has only 26 keys, so the attacker simply tries them all and keeps the one that produces English. That is a **brute-force** attack, and it finishes in 26 tries no matter how clever the message is.',
    },
    {
      type: 'paragraph',
      text: 'Modern ciphers such as AES use keys of 128 bits or more: 2¹²⁸ ≈ 3.4 × 10³⁸ possibilities. Even at a trillion keys per second, trying them all would take about 10¹⁹ years — far longer than the age of the universe.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Kerckhoffs’s principle',
      text: 'Assume the attacker knows exactly how your system works. Security must rest on the secrecy of the key alone. The attacker in the simulator knows it is a Caesar cipher; only the key is hidden — and 26 keys is not enough.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cybersecurity/encryption/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'How many keys does the brute-force attacker try in the simulator?',
            choices: [
              { id: 'a', text: '3' },
              { id: 'b', text: '26' },
              { id: 'c', text: '2¹²⁸' },
            ],
            answerId: 'b',
            explanation: 'One per possible shift, 0 to 25.',
          },
          {
            id: 'q2',
            prompt: 'According to Kerckhoffs’s principle, what must stay secret?',
            choices: [
              { id: 'a', text: 'The algorithm' },
              { id: 'b', text: 'The key' },
              { id: 'c', text: 'Both' },
            ],
            answerId: 'b',
            explanation:
              'Algorithms leak; well-studied public algorithms with secret keys are the standard.',
          },
        ],
      },
    },
  ],
});

export const passwords = defineLesson({
  slug: 'passwords-and-entropy',
  domainId: 'cybersecurity',
  title: 'Passwords and entropy',
  summary: 'What makes a password hard to guess, and why the usual rules miss the point.',
  estimatedMinutes: 9,
  prerequisites: ['cybersecurity/encryption-and-keys'],
  outcomes: [
    'compute naive entropy as length × log₂(pool)',
    'explain why common and patterned passwords fall instantly',
    'estimate brute-force time and why slow hashing matters',
  ],
  tags: ['passwords', 'entropy', 'authentication'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A password is a key that a human has to remember. If it is chosen **at random** from a pool of characters, its strength is measured in bits of **entropy**: length × log₂(pool size). Each extra bit doubles the attacker’s work.',
    },
    {
      type: 'interactive',
      simulatorId: 'cybersecurity/password-strength',
      caption:
        'Try the examples. The time assumes 10 billion guesses per second against a fast, unsalted hash.',
    },
    { type: 'heading', level: 2, text: 'Where the formula lies' },
    {
      type: 'list',
      items: [
        '`sunshine` scores 37.6 bits by the formula, but it is on every attacker’s list of common passwords, so it falls on one of the first guesses.',
        '`Tr0ub4dor&3` scores 72.3 bits (about 9,012 years by the formula). But it is a dictionary word with predictable substitutions, and cracking tools try exactly those rules first. The xkcd comic that made it famous estimated about 28 bits.',
        '`correcthorsebatterystaple` scores 117.5 bits by the formula. If the four words were picked at random from a 2,048-word list, the honest figure is 4 × 11 = **44 bits**.',
      ],
    },
    {
      type: 'paragraph',
      text: '44 bits is about 15 minutes against a fast hash at 10 billion guesses per second, but about 28 years against a deliberately slow password hash that allows only 10,000 guesses per second. How the site **stores** your password matters as much as the password itself — that is the next lesson.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'What actually works',
      text: 'Use a password manager to generate long random passwords, a different one for every site. Turn on multi-factor authentication, so a stolen password alone is not enough.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cybersecurity/passwords/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Naive entropy of 8 random lowercase letters?',
            choices: [
              { id: 'a', text: 'About 26 bits' },
              { id: 'b', text: 'About 37.6 bits' },
              { id: 'c', text: '208 bits' },
            ],
            answerId: 'b',
            explanation: '8 × log₂(26) ≈ 8 × 4.70.',
          },
          {
            id: 'q2',
            prompt: 'Why can a 44-bit passphrase still be reasonable?',
            choices: [
              { id: 'a', text: 'Because it is long' },
              { id: 'b', text: 'Because a slow password hash makes each guess expensive' },
              { id: 'c', text: 'Because symbols are not required' },
            ],
            answerId: 'b',
            explanation: 'At 10,000 guesses per second, 2⁴³ guesses take about 28 years.',
          },
        ],
      },
    },
  ],
});

export const hashing = defineLesson({
  slug: 'hashing-and-salting',
  domainId: 'cybersecurity',
  title: 'Hashing and salting passwords',
  summary: 'What happens when a password database leaks, and what salts really protect.',
  estimatedMinutes: 9,
  prerequisites: ['cybersecurity/passwords-and-entropy'],
  outcomes: [
    'describe what a cryptographic hash is',
    'explain how a dictionary attack cracks leaked hashes',
    'say what salting does and does not protect',
    'name proper password-hashing functions',
  ],
  tags: ['hashing', 'salt', 'sha-256', 'password-storage'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Sites should never store your password. They store a **hash**: a fixed-size fingerprint that is easy to compute and infeasible to reverse. The same input always gives the same hash, and changing one character flips about half of the 256 bits of a SHA-256 hash.',
    },
    {
      type: 'paragraph',
      text: 'When the user table leaks, the attacker cannot reverse the hashes, but can **guess**: hash each word from a list of common passwords and look for matches.',
    },
    {
      type: 'interactive',
      simulatorId: 'cybersecurity/hash-cracker',
      caption:
        'Run the attack unsalted, then tick the salt box and run it again. Compare the hash counts. These are real SHA-256 hashes.',
    },
    { type: 'heading', level: 2, text: 'What you should see' },
    {
      type: 'list',
      items: [
        '**Unsalted**: alice and dave have identical stored hashes, so the attacker learns they share a password before cracking anything. Ten guesses cost ten hash computations and crack three of the four accounts.',
        '**Salted**: each user has a random salt mixed into the hash, so identical passwords no longer look identical, and precomputed tables are useless. But each guess must now be hashed once per user: 40 computations instead of 10 — and the same three weak passwords still fall.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Salt is not enough',
      text: 'Salting removes shortcuts; it does not make `sunshine` strong. Real systems also use a deliberately **slow** password hash — bcrypt, scrypt or Argon2 — tuned so each guess costs milliseconds. SHA-256 is designed to be fast, which is exactly wrong for passwords.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cybersecurity/hashing/quiz',
        questions: [
          {
            id: 'q1',
            prompt:
              'With per-user salts, how many hashes does trying 10 words against 4 users cost?',
            choices: [
              { id: 'a', text: '10' },
              { id: 'b', text: '14' },
              { id: 'c', text: '40' },
            ],
            answerId: 'c',
            explanation: 'Each guess must be combined with each user’s salt: 10 × 4.',
          },
          {
            id: 'q2',
            prompt: 'Does salting stop `sunshine` from being cracked?',
            choices: [
              { id: 'a', text: 'Yes' },
              { id: 'b', text: 'No' },
            ],
            answerId: 'b',
            explanation:
              'It is still the fifth word on the list; salting only increases per-user work.',
          },
        ],
      },
    },
  ],
});

export const sqlInjection = defineLesson({
  slug: 'sql-injection',
  domainId: 'cybersecurity',
  title: 'SQL injection',
  summary: 'How user input becomes part of a database command, and the one fix that works.',
  estimatedMinutes: 9,
  // Cross-domain prerequisite: reading code as state and steps.
  prerequisites: ['programming/state-and-steps'],
  outcomes: [
    'explain how string concatenation lets input change a query',
    'perform the classic login bypasses in a sandbox',
    'fix injection with parameterized queries',
  ],
  tags: ['injection', 'sql', 'web', 'owasp'],
  blocks: [
    {
      type: 'paragraph',
      text: "The vulnerable server builds its query by pasting your input between quotes: `... WHERE name = '<username>' AND password = '<password>'`. If your input contains a quote, it ends the string early and the rest is read as **SQL code**, not data.",
    },
    {
      type: 'interactive',
      simulatorId: 'cybersecurity/sql-login',
      caption:
        'Log in normally as alice / s3cret!, then try the payloads below. Watch the query the database receives.',
    },
    { type: 'heading', level: 2, text: 'Two classic payloads' },
    {
      type: 'list',
      items: [
        "Username `admin' --` closes the string after admin, and `--` turns the rest of the line — including the password check — into a comment.",
        "Password `' OR '1'='1` makes the condition `... AND password = '' OR '1'='1'`. AND binds tighter than OR, so the whole thing is true for every row, and you are logged in as the first user.",
        "An innocent name such as `O'Brien` breaks the query with a syntax error. Bugs and vulnerabilities often look the same.",
      ],
    },
    { type: 'heading', level: 2, text: 'The fix' },
    {
      type: 'paragraph',
      text: 'Switch to **parameterized queries**. The SQL text has placeholders (`?`), and the values travel separately, so the database never parses them as code. Every payload above simply fails to match a user. Hand-written escaping and blocklists of “bad” words are not substitutes — they are routinely bypassed.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Only attack what you own',
      text: 'Trying these payloads on systems you are not authorised to test is illegal in most countries. Practise in sandboxes like this one, or in deliberately vulnerable training apps on your own machine.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cybersecurity/sqli/quiz',
        questions: [
          {
            id: 'q1',
            prompt: "Why does `admin' --` bypass the password?",
            choices: [
              { id: 'a', text: 'It guesses the password' },
              { id: 'b', text: 'It comments out the password check' },
              { id: 'c', text: 'It deletes the users table' },
            ],
            answerId: 'b',
            explanation: 'Everything after `--` is ignored by the database.',
          },
          {
            id: 'q2',
            prompt: 'Which fix reliably prevents SQL injection?',
            choices: [
              { id: 'a', text: 'Blocking the word OR' },
              { id: 'b', text: 'Parameterized queries' },
              { id: 'c', text: 'Hiding error messages' },
            ],
            answerId: 'b',
            explanation: 'Values sent as parameters can never be interpreted as SQL.',
          },
        ],
      },
    },
  ],
});

export const xssLesson = defineLesson({
  slug: 'cross-site-scripting',
  domainId: 'cybersecurity',
  title: 'Cross-site scripting (XSS)',
  summary: 'The same mistake as SQL injection, made in HTML — and how escaping fixes it.',
  estimatedMinutes: 8,
  prerequisites: ['cybersecurity/sql-injection'],
  outcomes: [
    'explain how unescaped output lets input run as script',
    'recognise script-tag, event-handler and javascript: URL payloads',
    'fix XSS with contextual output escaping and add CSP as a second layer',
  ],
  tags: ['xss', 'html', 'web', 'owasp', 'csp'],
  blocks: [
    {
      type: 'paragraph',
      text: 'XSS is injection into a web page. If a site places a visitor’s comment into its HTML as-is, the comment can contain markup — including a `<script>` — and that script runs in **every other visitor’s browser**, with their session on the site.',
    },
    {
      type: 'interactive',
      simulatorId: 'cybersecurity/xss-comments',
      caption:
        'Try each example comment in raw mode, then switch to escaped. OPENLAB never inserts your input as real HTML; the verdict is simulated.',
    },
    { type: 'heading', level: 2, text: 'Three common vectors' },
    {
      type: 'list',
      items: [
        'A `<script>` element',
        'An event-handler attribute such as `onerror` on an image that is guaranteed to fail loading',
        'A `javascript:` URL in a link or source',
      ],
    },
    { type: 'heading', level: 2, text: 'The fix: escape output for its context' },
    {
      type: 'paragraph',
      text: 'Before inserting text into HTML, replace `<`, `>`, `&`, `"` and `\'` with their HTML entities. The browser then shows the characters instead of parsing them. Modern frameworks do this by default — React escapes text unless you use `dangerouslySetInnerHTML`, which OPENLAB’s own security policy forbids.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Defence in depth',
      text: "A Content Security Policy such as `script-src 'self'` tells the browser to refuse inline scripts and handlers even if one slips through. OPENLAB ships one. It is a second layer, not a replacement for escaping.",
    },
    {
      type: 'quiz',
      quiz: {
        id: 'cybersecurity/xss/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Whose browser runs a stored XSS payload?',
            choices: [
              { id: 'a', text: 'Only the attacker’s' },
              { id: 'b', text: 'Every visitor who views the page' },
              { id: 'c', text: 'The server' },
            ],
            answerId: 'b',
            explanation: 'The payload is saved with the comment and served to everyone.',
          },
          {
            id: 'q2',
            prompt: 'What is the primary fix?',
            choices: [
              { id: 'a', text: 'Escape output for the HTML context' },
              { id: 'b', text: 'Block the word script' },
              { id: 'c', text: 'Use HTTPS' },
            ],
            answerId: 'a',
            explanation: 'Filters miss variants; escaping makes all input inert text.',
          },
        ],
      },
    },
  ],
});
