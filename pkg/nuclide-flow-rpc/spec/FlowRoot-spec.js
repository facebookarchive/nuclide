'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowRoot as FlowRootType} from '../lib/FlowRoot';

import {FlowExecInfoContainer} from '../lib/FlowExecInfoContainer';

describe('FlowRoot', () => {
  const file = '/path/to/test.js';
  const root = '/path/to';
  const currentContents = '/* @flow */\nvar x = "this_is_a_string"\nvar y;';
  const line = 2;
  const column = 12;

  let flowRoot: FlowRootType = (null: any);

  let fakeExecFlow: any;

  function newFlowService() {
    // We do a require here instead of just importing at the top of the file because the describe
    // block below needs to mock things, and has to use uncachedRequire.
    const {FlowRoot} = require('../lib/FlowRoot');
    return new FlowRoot(root, new FlowExecInfoContainer());
  }

  beforeEach(() => {
    flowRoot = newFlowService();
    spyOn(flowRoot._process, 'execFlow').andCallFake(() => fakeExecFlow());
  });

  function mockExec(outputString) {
    fakeExecFlow = () => ({stdout: outputString, exitCode: 0});
  }

  describe('flowFindDefinition', () => {
    function runWith(location) {
      mockExec(JSON.stringify(location));
      return flowRoot.flowFindDefinition(file, currentContents, line, column);
    }

    it('should return the location', () => {
      waitsForPromise(async () => {
        // Flow uses 1-based indexing, Atom uses 0-based.
        expect(await runWith({path: file, line: 5, start: 8}))
          .toEqual({file, point: {line: 4, column: 7}});
      });
    });

    it('should return null if no location is found', () => {
      waitsForPromise(async () => {
        expect(await runWith({})).toBe(null);
      });
    });
  });

  describe('flowFindDiagnostics', () => {
    function runWith(errors, filePath, contents) {
      mockExec(JSON.stringify({errors}));
      return flowRoot.flowFindDiagnostics(filePath, contents);
    }

    it('should call flow status when currentContents is null', () => {
      waitsForPromise(async () => {
        await runWith([], file, null);
        const flowArgs = flowRoot._process.execFlow.mostRecentCall.args[0];
        expect(flowArgs[0]).toBe('status');
      });
    });

    it('should call flow check-contents with currentContents when it is not null', () => {
      waitsForPromise(async () => {
        await runWith([], file, currentContents);
        const execArgs = flowRoot._process.execFlow.mostRecentCall.args;
        const flowArgs = execArgs[0];
        const stdin = execArgs[1].stdin;
        expect(flowArgs[0]).toBe('check-contents');
        expect(stdin).toBe(currentContents);
      });
    });
  });

  describe('flowGetType', () => {
    function runWithString(outputString) {
      mockExec(outputString);
      return flowRoot.flowGetType(file, currentContents, line, column, false);
    }
    function runWith(outputType) {
      return runWithString(JSON.stringify({type: outputType}));
    }

    it('should return the type on success', () => {
      waitsForPromise(async () => {
        expect(await runWith('thisIsAType')).toEqual({type: 'thisIsAType', rawType: undefined});
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
        expect(await runWithString('invalid json')).toBe(null);
      });
    });

    it('should return null if the flow process fails', () => {
      waitsForPromise(async () => {
        fakeExecFlow = () => { throw 'error'; };
        // this causes some errors to get logged, but I don't think it's a big
        // deal and I don't know how to mock a module
        expect(
          await flowRoot.flowGetType(file, currentContents, line, column, false),
        ).toBe(null);
      });
    });
  });
});
