import { describe, expect, it } from 'vitest';
import { linuxOsModule } from '@domains/linux-os';
import { createRegistry } from '@core/registry';
import { foreignDomains } from '@app/moduleStore';
import { cloudDevopsModule } from './index';
import { CACHE_FRIENDLY_ORDER, dockerEngine } from './simulators/docker/engine';
import type { DockerState } from './simulators/docker/engine';
import { applyGit, initGit } from './simulators/git/engine';
import type { GitAction } from './simulators/git/engine';
import { finishPipeline, initPipeline } from './simulators/pipeline/engine';

describe('cloud-devops module', () => {
  const registry = createRegistry([cloudDevopsModule, linuxOsModule]);

  it('depends on linux-os and orders lessons', () => {
    expect(foreignDomains(cloudDevopsModule)).toEqual(['linux-os']);
    expect(registry.lessonsFor('cloud-devops').map((l) => l.slug)).toEqual([
      'version-control',
      'ci-cd-pipelines',
      'containers-and-layers',
      'reliability-and-slos',
    ]);
  });

  it('grades the merge lab', () => {
    const lab = registry.getLab('cloud-devops/merge-a-feature');
    const run = (actions: GitAction[]) => actions.reduce(applyGit, initGit());
    const branchWork: GitAction[] = [
      { type: 'branch', name: 'feature' },
      { type: 'checkout', name: 'feature' },
      { type: 'commit' },
      { type: 'commit' },
      { type: 'checkout', name: 'main' },
    ];
    expect(lab?.check(initGit())).toMatchObject({ passed: false, score: 0 });
    expect(lab?.check(run([...branchWork, { type: 'merge', name: 'feature' }]))).toMatchObject({
      passed: false,
      score: 60,
    });
    expect(
      lab?.check(
        run([
          { type: 'branch', name: 'feature' },
          { type: 'checkout', name: 'feature' },
          { type: 'commit' },
          { type: 'checkout', name: 'main' },
          { type: 'commit' },
          { type: 'merge', name: 'feature' },
        ]),
      ),
    ).toMatchObject({ passed: false, score: 70 });
    expect(
      lab?.check(run([...branchWork, { type: 'commit' }, { type: 'merge', name: 'feature' }])),
    ).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the pipeline lab', () => {
    const lab = registry.getLab('cloud-devops/fast-and-safe');
    expect(lab?.check(initPipeline(false, true))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(finishPipeline(initPipeline(true, true)))).toMatchObject({
      passed: false,
      score: 30,
    });
    expect(lab?.check(finishPipeline(initPipeline(false, false)))).toMatchObject({
      passed: false,
      score: 70,
    });
    expect(lab?.check(finishPipeline(initPipeline(true, false)))).toMatchObject({
      passed: true,
      score: 100,
    });
  });

  it('grades the Dockerfile lab', () => {
    const lab = registry.getLab('cloud-devops/cache-friendly-dockerfile');
    const finish = (s: DockerState) => {
      let x = s;
      while (!dockerEngine.isDone?.(x)) x = dockerEngine.step(x);
      return x;
    };
    expect(lab?.check(finish(dockerEngine.init(1)))).toMatchObject({ passed: false, score: 50 });
    const good: DockerState = { order: CACHE_FRIENDLY_ORDER, edit: 'source', built: 0, elapsed: 0 };
    expect(lab?.check(good)).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(finish(good))).toMatchObject({
      passed: true,
      score: 100,
      message: '17 s: dependencies stay cached across code edits.',
    });
    expect(
      lab?.check({ ...good, order: ['workdir', 'from', 'manifest', 'install', 'source', 'build'] }),
    ).toMatchObject({ passed: false, score: 20 });
    expect(lab?.check({ ...good, edit: 'dependencies' })).toMatchObject({
      passed: false,
      score: 0,
    });
  });
});
