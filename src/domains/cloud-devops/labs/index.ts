import { defineLab } from '@core/model';
import { rebuildSeconds, validate } from '../simulators/docker/engine';
import type { DockerState } from '../simulators/docker/engine';
import { history } from '../simulators/git/engine';
import type { GitState } from '../simulators/git/engine';
import { isPipelineDone } from '../simulators/pipeline/engine';
import type { PipelineState } from '../simulators/pipeline/engine';

export const FAST_PIPELINE = 8;
export const FAST_REBUILD = 17;

export const mergeLab = defineLab({
  slug: 'merge-a-feature',
  domainId: 'cloud-devops',
  title: 'Merge a feature branch',
  summary: 'Branch, work, let main move on, then join the histories with a merge commit.',
  estimatedMinutes: 4,
  prerequisites: ['cloud-devops/version-control'],
  simulatorId: 'cloud-devops/git-graph',
  goal: 'End with main’s tip being a merge commit that brings in at least two feature commits, while main also gained at least one commit of its own.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Use the buttons rather than Play. Remember that creating a branch does not switch to it.',
    },
  ],
  check: (state) => {
    const s = state as GitState;
    const tipId = s.branches.main;
    const tip = s.commits.find((c) => c.id === tipId);
    if (Object.keys(s.branches).length < 2)
      return { passed: false, message: 'Start by creating a branch.', score: 0 };
    if (tip?.parents.length !== 2) {
      const ff = Object.entries(s.branches).some(([b, c]) => b !== 'main' && c === tipId);
      return ff
        ? {
            passed: false,
            message:
              'That was a fast-forward: main had no new commits of its own. Commit on main before merging to see a real merge.',
            score: 60,
          }
        : { passed: false, message: 'main’s tip is not a merge commit yet.', score: 20 };
    }
    const [p1, p2] = tip.parents;
    const mainSide = history(s, p1);
    const featureSide = history(s, p2);
    const featureOnly = [...featureSide].filter((c) => !mainSide.has(c)).length;
    const mainOnly = [...mainSide].filter((c) => !featureSide.has(c)).length;
    if (featureOnly < 2)
      return {
        passed: false,
        message: `The merge brought in ${String(featureOnly)} feature commit${featureOnly === 1 ? '' : 's'}. Make at least two.`,
        score: 70,
      };
    if (mainOnly < 1)
      return {
        passed: false,
        message: 'main needs a commit of its own after branching.',
        score: 70,
      };
    return {
      passed: true,
      message: `Merge commit ${tip.id} joins ${String(featureOnly)} feature commits with ${String(mainOnly)} on main.`,
      score: 100,
    };
  },
});

export const pipelineLab = defineLab({
  slug: 'fast-and-safe',
  domainId: 'cloud-devops',
  title: 'Fast and safe pipeline',
  summary: 'Get to a green deploy, and get there quickly.',
  estimatedMinutes: 3,
  prerequisites: ['cloud-devops/ci-cd-pipelines'],
  simulatorId: 'cloud-devops/ci-pipeline',
  goal: `Finish with a successful deploy in at most ${String(FAST_PIPELINE)} time units.`,
  instructions: [
    {
      type: 'paragraph',
      text: 'Two things stand in the way. Changing a setting restarts the pipeline.',
    },
  ],
  check: (state) => {
    const s = state as PipelineState;
    if (!isPipelineDone(s))
      return { passed: false, message: 'Run the pipeline to the end.', score: 10 };
    if (s.status.deploy !== 'passed')
      return {
        passed: false,
        message: 'The deploy was skipped because a job failed. Fix the bug first.',
        score: 30,
      };
    if (s.time > FAST_PIPELINE)
      return {
        passed: false,
        message: `Green, but it took ${String(s.time)} units. Which jobs do not depend on each other?`,
        score: 70,
      };
    return {
      passed: true,
      message: `Green in ${String(s.time)} units: correct and on the critical path.`,
      score: 100,
    };
  },
});

export const dockerLab = defineLab({
  slug: 'cache-friendly-dockerfile',
  domainId: 'cloud-devops',
  title: 'Cache-friendly Dockerfile',
  summary: 'Reorder the Dockerfile so everyday code edits rebuild fast.',
  estimatedMinutes: 3,
  prerequisites: ['cloud-devops/containers-and-layers'],
  simulatorId: 'cloud-devops/docker-layers',
  goal: `With "Application source code" selected, reorder so the rebuild takes at most ${String(FAST_REBUILD)} s, then step through the whole rebuild.`,
  instructions: [
    {
      type: 'paragraph',
      text: 'Use the arrows. Some orders are invalid — the simulator will say why.',
    },
  ],
  check: (state) => {
    const s = state as DockerState;
    if (s.edit !== 'source')
      return {
        passed: false,
        message: 'Select "Application source code" as the change.',
        score: 0,
      };
    const err = validate(s.order);
    if (err) return { passed: false, message: `That order cannot build: ${err}`, score: 20 };
    if (s.built < s.order.length)
      return { passed: false, message: 'Step through the whole rebuild.', score: 30 };
    const secs = rebuildSeconds(s.order, s.edit);
    if (secs > FAST_REBUILD)
      return {
        passed: false,
        message: `${String(secs)} s: the source copy still invalidates npm ci.`,
        score: 50,
      };
    return {
      passed: true,
      message: `${String(secs)} s: dependencies stay cached across code edits.`,
      score: 100,
    };
  },
});
