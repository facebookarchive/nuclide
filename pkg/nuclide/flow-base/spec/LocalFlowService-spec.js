'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('LocalFlowService::getType', () => {
  var file = 'test.js';
  var currentContents = '/* @flow */\nvar x = "this_is_a_string"';
  var line = 2;
  var column = 12;

  var flowService;

  function runWith(outputString) {
    spyOn(flowService, '_execFlow').andReturn({stdout: outputString});
    return flowService.getType(file, currentContents, line, column);
  }

  beforeEach(() => {
    spyOn(require('../lib/FlowHelpers'), 'getFlowExecOptions').andReturn({});
    flowService = new (require('../lib/LocalFlowService'))();
  });

  afterEach(() => {
    unspy(require('../lib/FlowHelpers'), 'getFlowExecOptions');
  });

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
