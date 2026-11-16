import type { Message } from '../types';

/**
 * English UI strings for the app shell and shared components (ADR-0010).
 * Lesson, lab and simulator content lives with each domain and is not part of
 * this catalogue yet. `{name}` placeholders are filled by the translator;
 * numeric parameters are formatted for the active locale.
 */
export const en = {
  'app.skipLink': 'Skip to main content',
  'app.homeLabel': 'OPENLAB home',
  'app.nav.label': 'Primary',
  'app.nav.domains': 'Domains',
  'app.nav.search': 'Search',
  'app.nav.progress': 'Progress',
  'app.nav.paths': 'Paths',
  'app.nav.source': 'Source',
  'app.footer.about':
    'OPENLAB is free and open source (MIT). It runs entirely in your browser: no account, no tracking, no data leaves your device.',
  'app.footer.contribute': 'Contribute on GitHub',
  'app.loading': 'Loading…',

  'theme.system': 'System theme',
  'theme.light': 'Light theme',
  'theme.dark': 'Dark theme',
  'theme.system.short': 'System',
  'theme.light.short': 'Light',
  'theme.dark.short': 'Dark',
  'theme.system.lower': 'system theme',
  'theme.light.lower': 'light theme',
  'theme.dark.lower': 'dark theme',
  'theme.toggleLabel': '{current}. Switch to {next}',
  'theme.toggleTitle': '{current} — click for {next}',

  'status.planned': 'Coming soon',
  'status.in-progress': 'In progress',
  'status.available': 'Available',

  'notFound.title': 'Page not found',
  'notFound.text': 'That route does not exist. It may have moved, or the link was mistyped.',
  'notFound.back': 'Back to all domains',
  'notFound.docTitle': 'Not found',

  'error.title': 'Something went wrong',
  'error.text':
    'The page hit an unexpected error. Reloading usually fixes it; your progress is safe.',
  'error.reload': 'Reload',

  'home.kicker': 'Free · Open source · Runs in your browser',
  'home.titleBefore': 'Learn technology by ',
  'home.titleEmphasis': 'doing',
  'home.titleAfter': '.',
  'home.lede':
    'Interactive visualizations, simulators and labs across eight domains. No account, no tracking, no cost. Pick a domain to begin.',
  'home.resume': 'Continue where you left off →',
  'home.domainsTitle': 'Learning domains',
  'domainCard.topics': '{domain} topics',

  'domain.back': 'All domains',
  'domain.lessons': 'Lessons',
  'domain.lessonsDone': '{done} / {total} done',
  'domain.lessonsList': '{domain} lessons',
  'domain.labs': 'Labs',
  'domain.labsList': '{domain} labs',
  'domain.labBadge': 'Lab',
  'domain.topics': 'What you will explore',
  'domain.planned':
    'This domain is on the roadmap and not built yet. Lessons, simulators and labs will appear here as they land.',

  'lesson.minutes': '{count} min',
  'lesson.completed': 'Completed',
  'lesson.completedSuffix': ' (completed)',
  'lesson.overview': 'Lesson overview',
  'lesson.before': 'Before this',
  'lesson.after': 'After this you can',
  'lesson.markComplete': 'Mark as complete',
  'lesson.undoComplete': 'Completed — click to undo',
  'lesson.learnNext': 'Learn next',
  'lesson.learnNextLabel': 'Learn next:',
  'lesson.missingSimulatorTitle': 'Missing simulator',
  'lesson.missingSimulatorText': 'Simulator `{id}` is not registered.',

  'lab.kicker': 'Lab',
  'lab.goal': 'Goal',
  'lab.passed': 'Passed',
  'lab.notPassed': 'Not passed yet',
  'lab.attempts': { one: '{count} attempt', other: '{count} attempts' },
  'lab.instructions': 'Instructions',
  'lab.check': 'Check my work',
  'lab.resultPassed': 'Passed.',
  'lab.resultNotYet': 'Not yet.',
  'lab.score': 'Score: {score}/100.',
  'lab.share': 'Copy link to this setup',
  'lab.shareLabel': 'Link to this setup',
  'lab.shareCopied': 'Link copied. Anyone who opens it sees this exact setup.',
  'lab.shareManual': 'Copy the link below.',
  'lab.shareTooLong':
    'This setup is too long to share as a link. Reset and try a shorter sequence.',
  'lab.restored': 'Restored a shared setup. Check your work, or press Reset to start fresh.',
  'lab.restoreFailed': 'This shared setup could not be restored, so the lab starts fresh.',

  'search.docTitle': 'Search',
  'search.title': 'Search lessons and labs',
  'search.label': 'Search query',
  'search.placeholder': 'e.g. handshake, subnet, scheduler',
  'search.placeholderEmpty': 'No content yet',
  'search.nothing': 'Nothing to search yet — the first lessons arrive with the Networking domain.',
  'search.indexed': '{count} lessons and labs indexed.',
  'search.results': {
    one: '{count} result for “{query}”.',
    other: '{count} results for “{query}”.',
  },
  'search.kind.lesson': 'lesson',
  'search.kind.lab': 'lab',

  'progress.docTitle': 'Your progress',
  'progress.title': 'Your progress',
  'progress.ledeStored': 'Stored only in this browser. Export a file to move it to another device.',
  'progress.ledeUnavailable':
    'Stored only in this browser (storage is unavailable, so it will not survive a reload). Export a file to move it to another device.',
  'progress.lessons': 'Lessons completed',
  'progress.labs': 'Labs passed',
  'progress.quiz': 'Quiz answers correct',
  'progress.export': 'Export JSON',
  'progress.import': 'Import JSON',
  'progress.reset': 'Reset',
  'progress.confirmReset': 'Delete all progress?',
  'progress.confirmYes': 'Yes, delete',
  'progress.confirmNo': 'Cancel',
  'progress.exported': 'Progress exported.',
  'progress.cleared': 'Progress cleared.',
  'progress.imported': 'Imported {lessons} lessons, {labs} labs and {quizzes} quizzes.',
  'progress.error.too-large': 'That file is too large to be an OPENLAB progress export.',
  'progress.error.invalid-json': 'That file is not valid JSON.',
  'progress.error.invalid': 'That file is not an OPENLAB progress export.',
  'progress.error.unsupported-version':
    'That export comes from a newer version of OPENLAB. Update and try again.',

  'sim.play': 'Play',
  'sim.pause': 'Pause',
  'sim.step': 'Step',
  'sim.reset': 'Reset',
  'sim.speed': 'Speed',
  'sim.speedOption': '×{speed}',
  'sim.finished': 'Finished',
  'sim.stepCount': 'step {count}',
  'sim.controls': '{title} controls',
  'sim.status': 'Simulation status',
  'sim.error':
    'This simulator ran into a problem. Reset it to start again; the rest of the page still works.',

  'quiz.title': 'Check your understanding',
  'quiz.check': 'Check answers',
  'quiz.retry': 'Try again',
  'quiz.correct': 'Correct.',
  'quiz.unanswered': 'Not answered.',
  'quiz.wrong': 'Not quite.',
  'quiz.score': 'You got {correct} of {total} correct.',
  'quiz.progress': '{answered} of {total} answered.',

  'paths.docTitle': 'Learning paths',
  'paths.title': 'Learning paths',
  'paths.lede':
    'Pick a lesson you want to reach. OPENLAB lists everything it builds on, across domains, in an order that works.',
  'paths.goalLabel': 'Goal lesson',
  'paths.suggested': 'Suggested goals that cross domains:',
  'paths.pathTo': 'Path to “{goal}”',
  'paths.lessonCount': { one: '{count} lesson', other: '{count} lessons' },
  'paths.domainCount': { one: '{count} domain', other: '{count} domains' },
  'paths.minuteCount': 'about {count} min',
  'paths.doneCount': '{count} done',
  'paths.stepsLabel': 'Lessons in order',
  'paths.nextUp': 'Next up',
  'paths.complete': 'You have completed every lesson on this path.',
  'lesson.pathLink': 'Path to this lesson',

  'callout.info': 'Note',
  'callout.tip': 'Tip',
  'callout.warning': 'Careful',
  'code.label': '{language} code',
} as const satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
/** Every locale must provide every key: a missing translation is a type error. */
export type Messages = Readonly<Record<MessageKey, Message>>;
