'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {getFirstTask} from '../lib/redux/Selectors';

function makeFakeTask(label, disabled, priority) {
  return {
    type: 'build',
    label,
    description: '',
    disabled,
    priority,
    runnable: true,
    icon: 'x',
    taskRunnerId: '',
    taskRunnerName: '',
  };
}

describe('getFirstTask', () => {

  it('prefers non-disabled tasks', () => {
    const tasks = new Map([[
      'test',
      [
        makeFakeTask('disabled', true),
        makeFakeTask('enabled', false),
      ],
    ]]);

    const task = getFirstTask(tasks);
    invariant(task != null, 'expected task');
    expect(task.label).toBe('enabled');
  });

  it('prefers tasks that provide disabled', () => {
    const tasks = new Map([[
      'test',
      [
        makeFakeTask('enabled'),
        makeFakeTask('enabled_better', false),
      ],
    ]]);

    const task = getFirstTask(tasks);
    invariant(task != null, 'expected task');
    expect(task.label).toBe('enabled_better');
  });

  it('prefers tasks with higher priority', () => {
    const tasks = new Map([[
      'test',
      [
        makeFakeTask('enabled0', false, 0),
        makeFakeTask('enabled1', false, 1),
        makeFakeTask('enabled_bad', true, 666),
      ],
    ]]);

    const task = getFirstTask(tasks);
    invariant(task != null, 'expected task');
    expect(task.label).toBe('enabled1');
  });

});
