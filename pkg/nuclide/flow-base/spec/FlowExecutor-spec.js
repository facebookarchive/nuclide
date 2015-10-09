'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {uncachedRequire} from 'nuclide-test-helpers';

describe('FlowExecutor', () => {
  describe('flow server creation and teardown', () => {
    let childSpy: any;
    let flowExecutor: any;

    function execFlow() {
      return flowExecutor.execFlow([], {}, '/path/to/flow/root/file.js');
    }

    beforeEach(() => {
      spyOn(require('../lib/FlowHelpers'), 'getFlowExecOptions')
        .andReturn({cwd: '/path/to/flow/root'});
      var called = false;
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
      flowExecutor = uncachedRequire(require, '../lib/FlowExecutor');
      waitsForPromise(async () => { await execFlow(); });
    });

    afterEach(() => {
      global.unspy(require('nuclide-commons'), 'asyncExecute');
      global.unspy(require('nuclide-commons'), 'safeSpawn');
    });

    describe('_execFlow', () => {
      it('should spawn a new Flow server', () => {
        expect(require('nuclide-commons').safeSpawn).toHaveBeenCalledWith(
          'flow',
          ['server', '/path/to/flow/root']
        );
      });
    });

    describe('crashing Flow', () => {
      var event;
      var handler;

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
      it('should kill flow servers', () => {
        waitsForPromise(async () => {
          flowExecutor.dispose();
          expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
        });
      });
    });
  });
});
