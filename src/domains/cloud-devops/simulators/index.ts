import { defineSimulator } from '@core/model';
import { dockerEngine } from './docker/engine';
import { DockerView } from './docker/DockerView';
import { gitEngine } from './git/engine';
import { GitView } from './git/GitView';
import { pipelineEngine } from './pipeline/engine';
import { PipelineView } from './pipeline/PipelineView';
import { sloEngine } from './slo/engine';
import { SloView } from './slo/SloView';

const domainId = 'cloud-devops' as const;

export const git = defineSimulator({
  domainId,
  slug: 'git-graph',
  title: 'Commit graph',
  description: 'Commit, branch, checkout and merge, drawn as a graph.',
  engine: gitEngine,
  View: GitView,
  tickRate: 1,
});
export const pipeline = defineSimulator({
  domainId,
  slug: 'ci-pipeline',
  title: 'CI/CD pipeline',
  description: 'Jobs, dependencies, a failing test and a gated deploy.',
  engine: pipelineEngine,
  View: PipelineView,
  tickRate: 2,
});
export const docker = defineSimulator({
  domainId,
  slug: 'docker-layers',
  title: 'Image layer cache',
  description: 'Reorder a Dockerfile and see what a rebuild costs.',
  engine: dockerEngine,
  View: DockerView,
  tickRate: 2,
});
export const slo = defineSimulator({
  domainId,
  slug: 'error-budget',
  title: 'Error budget',
  description: 'Availability targets as minutes of allowed downtime.',
  engine: sloEngine,
  View: SloView,
  tickRate: 4,
});

export const simulators = [git, pipeline, docker, slo];
