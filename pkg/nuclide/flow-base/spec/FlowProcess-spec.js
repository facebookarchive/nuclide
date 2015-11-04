'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowProcess as FlowProcessT} from '../lib/FlowProcess';

import {uncachedRequire} from 'nuclide-test-helpers';

const flowProcessPath = '../lib/FlowProcess';

describe('FlowProcess', () => {
  describe('Server startup and teardown', () => {
    let flowProcess: FlowProcessT = (null: any);
    // Mocked ChildProcess instance (not typed as such because the mock only implements a subset of
    // methods).
    let childSpy: any;

    const root = '/path/to/flow/root';

    function execFlow() {
      return flowProcess.execFlow([], {}, '/path/to/flow/root/file.js');
    }

    beforeEach(() => {
      let called = false;
      // we want asyncExecute to throw the first time, to mimic Flow not
      // runinng. Then, it will spawn a new flow process, and we want that to be
      // successful
      spyOn(require('nuclide-commons'), 'asyncExecute').andCallFake(() => {
        if (called) {
          return {};
        } else {
          called = true;
          throw {
            stderr: 'There is no flow server running\n\'/path/to/flow/root\'',
          };
        }
      });

      childSpy = {
        stdout: { on() {} },
        stderr: { on() {} },
        on() {},
        kill() {},
      };
      spyOn(childSpy, 'kill');
      spyOn(childSpy, 'on');
      spyOn(require('nuclide-commons'), 'safeSpawn').andReturn(childSpy);
      // we have to create another flow service here since we've mocked modules
      // we depend on since the outer beforeEach ran.
      const {FlowProcess} = (uncachedRequire(require, flowProcessPath): any);
      flowProcess = new FlowProcess(root);
      spyOn(flowProcess, '_getFlowExecOptions').andReturn(Promise.resolve({cwd: root}));
      waitsForPromise(async () => { await execFlow(); });
    });

    afterEach(() => {
      global.unspy(require('nuclide-commons'), 'asyncExecute');
      global.unspy(require('nuclide-commons'), 'safeSpawn');
    });

    describe('execFlow', () => {
      it('should spawn a new Flow server', () => {
        expect(require('nuclide-commons').safeSpawn).toHaveBeenCalledWith(
          'flow',
          ['server', '/path/to/flow/root']
        );
      });
    });

    describe('crashing Flow', () => {
      let event;
      let handler;

      beforeEach(() => {
        [event, handler] = childSpy.on.mostRecentCall.args;
        // simulate a Flow crash
        handler(2, null);
      });

      it('should blacklist the root', () => {
        expect(event).toBe('exit');
        (require('nuclide-commons').safeSpawn: any).reset();
        waitsForPromise(async () => { await execFlow(); });
        expect(require('nuclide-commons').safeSpawn).not.toHaveBeenCalled();
      });
    });

    describe('dispose', () => {
      it('should kill flow server', () => {
        waitsForPromise(async () => {
          flowProcess.dispose();
          expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
        });
      });
    });
  });
});
