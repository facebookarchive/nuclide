'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Breakpoint, DebuggerEvent} from '../debugger/types';

import {launchDebugger} from '../debugger/debugger';
import pathUtil from '../../commons-node/nuclideUri';
import {DebuggerCommander} from '../debugger/DebuggerCommander';

const simple_py = pathUtil.join(__dirname, 'simple.py');

describe('debugger', () => {
  it('has very few events when there are no breakpoints', () => {
    waitsForPromise(async () => {
      const ignoreEvent = () => {};
      const events = await createTestScenario(simple_py, ignoreEvent);
      expect(events).toEqual([
        {event: 'connected'},
        {event: 'start'},
        {event: 'exit'},
      ]);
    });
  });

  it('can hit one breakpoint and then continue', () => {
    waitsForPromise(async () => {
      const onEvent = (event: DebuggerEvent, commander: DebuggerCommander) => {
        if (event.event === 'stop') {
          commander.continue();
        }
      };
      const breakpoints = [
        {
          file: simple_py,
          line: 16,
        },
      ];
      const events = await createTestScenario(simple_py, onEvent, breakpoints);
      expect(events).toEqual([
        {event: 'connected'},
        {event: 'start'},
        {event: 'stop', file: simple_py, line: 16},
        {event: 'exit'},
      ]);
    });
  });

  it('can hit one breakpoint and step the rest of the way through', () => {
    waitsForPromise(async () => {
      const onEvent = (event: DebuggerEvent, commander: DebuggerCommander) => {
        if (event.event === 'stop') {
          commander.step();
        }
      };
      const breakpoints = [
        {
          file: simple_py,
          line: 16,
        },
      ];
      const events = await createTestScenario(simple_py, onEvent, breakpoints);
      expect(events).toEqual([
        {event: 'connected'},
        {event: 'start'},
        {event: 'stop', file: simple_py, line: 16},
        {event: 'stop', file: simple_py, line: 17},
        {event: 'exit'},
      ]);
    });
  });
});

function createTestScenario(
  pythonScript: string,
  onEvent: (event: DebuggerEvent, commander: DebuggerCommander) => mixed,
  initialBreakpoints: Array<Breakpoint> = [],
  pythonScriptArgs: Array<string> = [],
): Promise<Array<DebuggerEvent>> {
  const commander = new DebuggerCommander();

  const originalObservable = launchDebugger(
    commander.asObservable(),
    initialBreakpoints,
    /* pathToPython */ 'python',
    /* pythonArgs */ [pythonScript].concat(pythonScriptArgs),
  );

  const events = [];
  const spyingObservable = originalObservable.do(event => {
    // We filter out log events so we can add debug information without breaking the tests.
    if (event.event !== 'log') {
      events.push(event);
    }
  });

  return new Promise((resolve, reject) => {
    spyingObservable.subscribe(
      event => {
        if (event.event === 'start') {
          // We have no setup to do, so simply continue.
          commander.continue();
        } else {
          onEvent(event, commander);
        }
      },
      reject,
      () => resolve(events),
    );
  });
}
