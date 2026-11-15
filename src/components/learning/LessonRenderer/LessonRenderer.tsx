import type { AnySimulatorDefinition, ContentBlock, Lesson } from '@core/model/types';
import { Callout } from '../Callout';
import { CodeBlock } from '../CodeBlock';
import { InlineText } from '../InlineText';
import { Quiz } from '../Quiz';
import type { QuizResult } from '../Quiz';
import { SimulatorHost } from '../SimulatorHost';
import styles from './LessonRenderer.module.css';

export interface LessonRendererProps {
  lesson: Lesson;
  resolveSimulator: (id: string) => AnySimulatorDefinition | undefined;
  reducedMotion: boolean;
  onQuizComplete?: (quizId: string, result: QuizResult) => void;
}

export function LessonRenderer({
  lesson,
  resolveSimulator,
  reducedMotion,
  onQuizComplete,
}: LessonRendererProps) {
  return (
    <div className={styles.flow}>
      {lesson.blocks.map((block, i) => (
        <Block
          // Blocks are static authored content: index keys are stable.
          key={i}
          block={block}
          resolveSimulator={resolveSimulator}
          reducedMotion={reducedMotion}
          onQuizComplete={onQuizComplete}
        />
      ))}
    </div>
  );
}

interface BlockProps {
  block: ContentBlock;
  resolveSimulator: LessonRendererProps['resolveSimulator'];
  reducedMotion: boolean;
  onQuizComplete: LessonRendererProps['onQuizComplete'] | undefined;
}

function Block({ block, resolveSimulator, reducedMotion, onQuizComplete }: BlockProps) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className={styles.p}>
          <InlineText text={block.text} />
        </p>
      );
    case 'heading':
      return block.level === 2 ? (
        <h2 className={styles.h2}>{block.text}</h2>
      ) : (
        <h3 className={styles.h3}>{block.text}</h3>
      );
    case 'list': {
      const items = block.items.map((t) => (
        <li key={t}>
          <InlineText text={t} />
        </li>
      ));
      return block.ordered ? (
        <ol className={styles.list}>{items}</ol>
      ) : (
        <ul className={styles.list}>{items}</ul>
      );
    }
    case 'callout':
      return block.title !== undefined ? (
        <Callout tone={block.tone} title={block.title} text={block.text} />
      ) : (
        <Callout tone={block.tone} text={block.text} />
      );
    case 'code':
      return block.caption !== undefined ? (
        <CodeBlock language={block.language} code={block.code} caption={block.caption} />
      ) : (
        <CodeBlock language={block.language} code={block.code} />
      );
    case 'interactive': {
      const sim = resolveSimulator(block.simulatorId);
      if (!sim) {
        return (
          <Callout
            tone="warning"
            title="Missing simulator"
            text={`Simulator \`${block.simulatorId}\` is not registered.`}
          />
        );
      }
      return block.caption !== undefined ? (
        <SimulatorHost simulator={sim} reducedMotion={reducedMotion} caption={block.caption} />
      ) : (
        <SimulatorHost simulator={sim} reducedMotion={reducedMotion} />
      );
    }
    case 'quiz':
      return (
        <Quiz
          quiz={block.quiz}
          onComplete={(r) => {
            onQuizComplete?.(block.quiz.id, r);
          }}
        />
      );
  }
}
