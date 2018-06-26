'use strict';

var _Activation;

function _load_Activation() {
  return _Activation = _interopRequireDefault(require('../lib/Activation'));
}

var _CwdApi;

function _load_CwdApi() {
  return _CwdApi = _interopRequireDefault(require('../lib/CwdApi'));
}

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('current-working-directory', () => {
  beforeEach(() => {
    jest.spyOn(atom.project, 'getDirectories').mockReturnValue([new _atom.Directory('/a/b/c'), new _atom.Directory('/d/e/f')]);
  });

  describe('Activation', () => {
    describe('provideApi', () => {
      it('provides an API with the initial path', () => {
        const activation = new (_Activation || _load_Activation()).default({ initialCwdPath: '/a/b/c' });
        const api = activation.provideApi();
        const cwd = api.getCwd();

        if (!(cwd != null)) {
          throw new Error('Invariant violation: "cwd != null"');
        }

        expect(cwd).toBe('/a/b/c');
      });
    });
  });

  describe('CwdApi', () => {
    it('gets and sets the cwd', () => {
      const api = new (_CwdApi || _load_CwdApi()).default('/a/b/c');
      let cwd = api.getCwd();

      if (!(cwd != null)) {
        throw new Error('Invariant violation: "cwd != null"');
      }

      expect(cwd).toBe('/a/b/c');
      api.setCwd('/d/e/f');
      cwd = api.getCwd();

      if (!(cwd != null)) {
        throw new Error('Invariant violation: "cwd != null"');
      }

      expect(cwd).toBe('/d/e/f');
    });

    it('errors if you set an invalid cwd', () => {
      const api = new (_CwdApi || _load_CwdApi()).default('/a/b/c');
      const setInvalidCwd = () => {
        api.setCwd('/x/y/z');
      };
      expect(setInvalidCwd).toThrow();
    });

    it('allows subdirectories to be the CWD', () => {
      const api = new (_CwdApi || _load_CwdApi()).default('/a/b/c');
      api.setCwd('/a/b/c/d');
      const cwd = api.getCwd();

      if (!(cwd != null)) {
        throw new Error('Invariant violation: "cwd != null"');
      }

      expect(cwd).toBe('/a/b/c/d');
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

describe('CwdApi event handling', () => {
  it('falls back to an existing project when you remove one', () => {
    let projects = [new _atom.Directory('/a/b/c'), new _atom.Directory('/d/e/f')];
    jest.spyOn(atom.project, 'getDirectories').mockImplementation(() => projects);

    const api = new (_CwdApi || _load_CwdApi()).default('/d/e/f');
    let cwd = api.getCwd();

    if (!(cwd != null)) {
      throw new Error('Invariant violation: "cwd != null"');
    }

    expect(cwd).toBe('/d/e/f');

    // Simulate the removing of a directory from the project list.
    projects = [new _atom.Directory('/a/b/c')];

    cwd = api.getCwd();

    if (!(cwd != null)) {
      throw new Error('Invariant violation: "cwd != null"');
    }

    expect(cwd).toBe('/a/b/c');
  });

  it('uses the initial directory once it becomes valid', () => {
    let projects = [];
    jest.spyOn(atom.project, 'getDirectories').mockImplementation(() => projects);

    let callback;
    const onDidChangePaths = cb => {
      callback = cb;
    };
    jest.spyOn(atom.project, 'onDidChangePaths').mockImplementation(onDidChangePaths);

    // The initial path does not exist, so observeCwd is initially undefined.
    const api = new (_CwdApi || _load_CwdApi()).default('/a/b/c');

    const spy = jest.fn();
    api.observeCwd(spy);
    expect(spy).toHaveBeenCalledWith(null);

    projects = [new _atom.Directory('/a/b/c')];

    // Once the list of projects is updated, the initial path should become active again.
    expect(callback).toBeDefined();

    if (!callback) {
      throw new Error('Invariant violation: "callback"');
    }

    callback();

    expect(spy.mock.calls.length).toBe(2);
    const arg = spy.mock.calls[1][0];
    expect(arg).not.toBeNull();
    expect(arg).toBe('/a/b/c');
  });
});