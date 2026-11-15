# Knowledge Graphs

Two graphs matter in OPENLAB:

1. The **project knowledge graph** — how the codebase, documents and processes relate. For contributors.
2. The **learning knowledge graph** — how concepts and lessons depend on each other across domains. For learners, and for the "learn next" engine.

## 1. Project knowledge graph

```mermaid
graph LR
  README[README.md] --> ROADMAP[ROADMAP.md]
  README --> PROGRESS[DEVELOPMENT_PROGRESS.md]
  README --> CONTRIB[CONTRIBUTING.md]
  README --> CLAUDE[CLAUDE.md]
  README --> ARCH[docs/architecture/ARCHITECTURE.md]

  CLAUDE --> DEPS[MODULE_DEPENDENCIES.md]
  CLAUDE --> STD[CODING_STANDARDS.md]

  ARCH --> SYS[SYSTEM_ARCHITECTURE.md]
  ARCH --> FLOW[DATA_FLOW.md]
  ARCH --> KG[KNOWLEDGE_GRAPH.md]
  ARCH --> DEPS
  ARCH --> ADR["ADR/*"]

  CONTRIB --> GUIDE[docs/contribution/CONTRIBUTING_GUIDE.md]
  CONTRIB --> COC[CODE_OF_CONDUCT.md]
  CONTRIB --> STD
  CONTRIB --> TEST[TESTING.md]

  SEC[SECURITY.md] --> SECPOL[docs/security/SECURITY_POLICY.md]

  SETUP[SETUP.md] --> ENV[ENVIRONMENT_REPORT.md]

  SYS --> CI[.github/workflows/ci.yml]
  SYS --> CD[.github/workflows/deploy.yml]
  CI --> PKG[package.json scripts]
  CD --> VITE[vite.config.ts base]

  DEPS --> ESLINT[eslint.config.js<br/>no-restricted-imports]
  DEPS --> TSCFG[tsconfig paths]

  STD --> ESLINT
  STD --> PRETTIER[.prettierrc]
  TEST --> VITEST["vite.config.ts (test block)"]
  TEST --> PW[playwright.config.ts]

  ROADMAP --> PROGRESS
  PROGRESS --> CHANGELOG[CHANGELOG.md]
```

Reading guide: start at `README.md`; for rules go `CLAUDE.md` → `MODULE_DEPENDENCIES.md` →
`CODING_STANDARDS.md`; for design go `ARCHITECTURE.md` → the specific view → ADRs.

## 2. Learning knowledge graph

Each domain owns its lessons, but prerequisites cross domain boundaries freely. The graph below
is the **planned top-level concept map**; the real graph is derived at build time from each
lesson's `prerequisites` metadata and will be far more granular.

```mermaid
graph TB
  subgraph CS["Computer Science"]
    bits["Bits & binary"]
    logic[Logic gates]
    cpu["CPU & memory model"]
    complexity["Complexity & Big-O"]
    automata["Automata & parsing"]
  end

  subgraph PROG["Programming"]
    vars["Variables & control flow"]
    ds[Data structures]
    algo[Algorithms]
    paradigms["Paradigms & patterns"]
    debug[Debugging]
  end

  subgraph OS["Linux & OS"]
    shell[Shell basics]
    fs["Filesystem & permissions"]
    proc["Processes & scheduling"]
    mem[Virtual memory]
    sockets["Sockets & IPC"]
  end

  subgraph NET["Networking"]
    osi[OSI / TCP-IP layers]
    ip["IP addressing & subnetting"]
    tcp["TCP & handshakes"]
    dns[DNS]
    http[HTTP]
    tls[TLS]
  end

  subgraph SEC["Cybersecurity"]
    threat[Threat modelling]
    crypto[Cryptography basics]
    auth["Authentication & sessions"]
    webvuln[Web vulnerabilities]
    defense[Defensive practices]
  end

  subgraph SD["System Design"]
    scale["Scaling & load balancing"]
    cache[Caching]
    queue["Queues & async"]
    consist["Consistency & replication"]
  end

  subgraph CLOUD["Cloud & DevOps"]
    git[Version control]
    cicd[CI/CD]
    containers[Containers]
    iac[Infrastructure as code]
    observ[Observability]
  end

  subgraph AI["AI & ML"]
    linalg["Vectors & matrices"]
    perceptron[Perceptron]
    gd[Gradient descent]
    nn[Neural networks]
    tokens["Tokenisation & attention"]
  end

  bits --> logic --> cpu
  bits --> vars
  vars --> ds --> algo --> complexity
  cpu --> mem
  cpu --> proc
  algo --> paradigms --> debug
  shell --> fs --> proc
  proc --> sockets
  bits --> ip
  osi --> ip --> tcp --> http
  dns --> http
  sockets --> tcp
  tcp --> tls
  crypto --> tls
  crypto --> auth
  http --> webvuln
  auth --> webvuln
  threat --> defense
  webvuln --> defense
  http --> scale --> cache
  scale --> queue
  ds --> cache
  queue --> consist
  git --> cicd --> containers --> iac
  containers --> proc
  cicd --> observ
  ds --> linalg --> perceptron --> gd --> nn --> tokens
  complexity --> gd
  automata --> tokens
  http --> cicd
```

### How the graph is used

| Feature                                  | Uses                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Lesson page "Before this" / "Learn next" | Direct prerequisite / dependent edges                  |
| Domain overview                          | Topological order of lessons within the domain         |
| Learning paths (Phase 6)                 | Shortest prerequisite closure to a target lesson       |
| Content validation script                | Detects cycles, dangling prerequisites, orphan lessons |

### Metadata contract (Phase 2)

```ts
interface LessonMeta {
  id: string; // 'networking/tcp-handshake'
  prerequisites: string[]; // ids, may cross domains
  outcomes: string[]; // "can explain …", "can configure …"
  estimatedMinutes: number;
  tags: string[];
}
```

The build-time script `scripts/validate-content.mjs` (Phase 2) turns all `LessonMeta` into a DAG,
fails CI on cycles, and emits `src/data/graph.json` consumed by the UI.
