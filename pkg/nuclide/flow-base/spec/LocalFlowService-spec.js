'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {uncachedRequire} = require('nuclide-test-helpers');

describe('LocalFlowService', () => {
  var file = 'test.js';
  var currentContents = '/* @flow */\nvar x = "this_is_a_string"';
  var line = 2;
  var column = 12;

  var flowService;

  function newFlowService() {
    var localFlowService = '../lib/LocalFlowService';
    // we have to invalidate the require cache in order to mock modules we
    // depend on
    return new (uncachedRequire(require, localFlowService))();
  }

  beforeEach(() => {
    spyOn(require('../lib/FlowHelpers'), 'getFlowExecOptions').andReturn({});
    flowService = newFlowService();
  });

  afterEach(() => {
    flowService = null;
    unspy(require('../lib/FlowHelpers'), 'getFlowExecOptions');
  });

  function mockExec(outputString) {
    spyOn(flowService, '_execFlow').andReturn({stdout: outputString});
  }

  describe('flow server creation and teardown', () => {
    var childSpy;

    beforeEach(() => {
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
        kill() {},
      };
      spyOn(childSpy, 'kill');
      spyOn(require('nuclide-commons'), 'safeSpawn').andReturn(childSpy);
      // we have to create another flow service here since we've mocked modules
      // we depend on since the outer beforeEach ran.
      flowService = newFlowService();
      waitsForPromise(async () => {
        await flowService._execFlow([], {});
      });
    });

    afterEach(() => {
      unspy(require('nuclide-commons'), 'asyncExecute');
      unspy(require('nuclide-commons'), 'safeSpawn');
    });

    describe('_execFlow', () => {
      it('should spawn a new Flow server', () => {
        expect(require('nuclide-commons').safeSpawn).toHaveBeenCalledWith(
          'flow',
          ['server', '/path/to/flow/root']
        );
      });
    });

    describe('dispose', () => {
      it('should kill flow servers', () => {
        waitsForPromise(async () => {
          flowService.dispose();
          expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
        });
      });
    });
  });

  describe('getType', () => {
    function runWith(outputString) {
      mockExec(outputString);
      return flowService.getType(file, currentContents, line, column);
    }

    it('should return the type on success', () => {
      waitsForPromise(async () => {
        expect(await runWith('thisIsAType')).toBe('thisIsAType');
      });
    });

    it('should return null if the type is unknown', () => {
      waitsForPromise(async () => {
        expect(await runWith('(unknown)')).toBe(null);
      });
    });

    it('should return null if the type is empty', () => {
      waitsForPromise(async () => {
        expect(await runWith('')).toBe(null);
      });
    });

    it('should return null on failure', () => {
      waitsForPromise(async () => {
        expect(await runWith('something\nFailure uh oh')).toBe(null);
      });
    });

    it('should return a type containing the string Failure', () => {
      waitsForPromise(async () => {
        expect(await runWith('Failure')).toBe('Failure');
      });
    });

    it('should return null if the flow process fails', () => {
      waitsForPromise(async () => {
        spyOn(flowService, '_execFlow').andThrow('error');
        // this causes some errors to get logged, but I don't think it's a big
        // deal and I don't know how to mock a module
        expect(await flowService.getType(file, currentContents, line, column)).toBe(null);
      });
    });
  });
});
