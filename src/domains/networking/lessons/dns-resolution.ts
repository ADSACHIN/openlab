import { defineLesson } from '@core/model';

export const dnsResolution = defineLesson({
  slug: 'dns-resolution',
  domainId: 'networking',
  title: 'DNS: from name to address',
  summary:
    'How a recursive resolver turns www.example.org into an IP address by following referrals.',
  estimatedMinutes: 7,
  prerequisites: ['networking/ip-addressing'],
  outcomes: [
    'describe the roles of stub, recursive, root, TLD and authoritative servers',
    'explain what a referral and a TTL are',
    'read a basic A/NS record answer',
  ],
  tags: ['dns', 'resolver', 'records', 'ttl'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Your browser does not know where `www.example.org` is. It asks a **recursive resolver** (usually your ISP’s, or one like `1.1.1.1`), which does the detective work and remembers the answer.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/dns-lookup',
      caption:
        'A cold lookup: nothing is cached, so the resolver walks the hierarchy from the root.',
    },
    { type: 'heading', level: 2, text: 'The hierarchy' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Root servers** know who runs each top-level domain (`.org`, `.com`, `.uk`).',
        '**TLD servers** know which name servers are authoritative for each registered domain (`example.org`).',
        '**Authoritative servers** hold the actual records for the domain and give the final answer.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Referrals, not answers',
      text: 'Root and TLD servers never answer the question directly. They reply "not me, try these" with NS records (and glue A records so the resolver can reach them). That is a referral.',
    },
    { type: 'heading', level: 2, text: 'Caching and TTL' },
    {
      type: 'paragraph',
      text: 'Every record carries a **TTL** in seconds. The resolver caches the answer for that long, so the next person asking gets a reply instantly and the root servers see only a tiny fraction of all lookups.',
    },
    {
      type: 'code',
      language: 'text',
      code: ';; ANSWER SECTION:\nwww.example.org.   3600  IN  A   93.184.216.34\n\n;; AUTHORITY SECTION:\nexample.org.      86400  IN  NS  ns1.example.org.',
      caption: 'What `dig www.example.org` shows: an A record with a one-hour TTL.',
    },
  ],
});
