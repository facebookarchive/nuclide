"use strict";

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

var fs = _interopRequireWildcard(require("fs"));

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _RpcMethodError() {
  const data = require("../RpcMethodError");

  _RpcMethodError = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
const BUFFER_ENCODING = 'utf-8';
const {
  O_WRONLY,
  O_TRUNC,
  O_CREAT,
  O_EXCL
} = fs.constants;
describe('FsRpcMethods', () => {
  let rpc;
  let FsRpcMethods;
  describe('fs/write', () => {
    const fsPromise = {
      writeFile: jest.fn((path, data, options) => {})
    };
    beforeAll(async () => {
      FsRpcMethods = require("../FsRpcMethods").FsRpcMethods;
      jest.mock("../../nuclide-commons/fsPromise", () => fsPromise);
    });
    afterAll(async () => {
      jest.resetModules();
    });
    beforeEach(async () => {
      rpc = new FsRpcMethods(undefined);
    });
    afterEach(async () => {
      jest.resetAllMocks();
    });
    it('create & overwrite', async () => {
      const wr = rpc._write({
        path: 'foo',
        content: 'abc123',
        create: true,
        overwrite: true
      });

      expect(wr).resolves.toEqual({});
      await wr;
      expect(fsPromise.writeFile.mock.calls.length).toBe(1);
      const call0 = fsPromise.writeFile.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toEqual(Buffer.from('abc123', BUFFER_ENCODING)); // eslint-disable-next-line no-bitwise

      expect(call0[2]).toEqual({
        flags: O_WRONLY | O_TRUNC | O_CREAT
      });
    });
    it('create & !overwrite', async () => {
      const wr = rpc._write({
        path: 'foo',
        content: 'abc123',
        create: true,
        overwrite: false
      });

      expect(wr).resolves.toEqual({});
      await wr;
      expect(fsPromise.writeFile.mock.calls.length).toBe(1);
      const call0 = fsPromise.writeFile.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toEqual(Buffer.from('abc123', BUFFER_ENCODING)); // eslint-disable-next-line no-bitwise

      expect(call0[2]).toEqual({
        flags: O_WRONLY | O_TRUNC | O_CREAT | O_EXCL
      });
    });
    it('!create & overwrite', async () => {
      const wr = rpc._write({
        path: 'foo',
        content: 'abc123',
        create: false,
        overwrite: true
      });

      expect(wr).resolves.toEqual({});
      await wr;
      expect(fsPromise.writeFile.mock.calls.length).toBe(1);
      const call0 = fsPromise.writeFile.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toEqual(Buffer.from('abc123', BUFFER_ENCODING)); // eslint-disable-next-line no-bitwise

      expect(call0[2]).toEqual({
        flags: O_WRONLY | O_TRUNC
      });
    });
    it('!create & !overwrite', async () => {
      const wr = rpc._write({
        path: 'foo',
        content: 'abc123',
        create: false,
        overwrite: false
      });

      expect(wr).resolves.toEqual({});
      await wr;
      expect(fsPromise.writeFile.mock.calls.length).toBe(1);
      const call0 = fsPromise.writeFile.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toEqual(Buffer.from('abc123', BUFFER_ENCODING)); // eslint-disable-next-line no-bitwise

      expect(call0[2]).toEqual({
        flags: O_WRONLY | O_TRUNC
      });
    });
  });
  describe('fs/move', () => {
    const fsPromise = {
      mv: jest.fn((path, data, options) => {})
    };
    beforeAll(async () => {
      FsRpcMethods = require("../FsRpcMethods").FsRpcMethods;
      jest.mock("../../nuclide-commons/fsPromise", () => fsPromise);
    });
    afterAll(async () => {
      jest.resetModules();
    });
    beforeEach(async () => {
      rpc = new FsRpcMethods(undefined);
    });
    afterEach(async () => {
      jest.resetAllMocks();
    });
    it('move; !overwrite', async () => {
      const mv = rpc._move({
        source: 'foo',
        destination: 'abc',
        overwrite: false
      });

      expect(mv).resolves.toEqual({});
      await mv;
      expect(fsPromise.mv.mock.calls.length).toBe(1);
      const call0 = fsPromise.mv.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toBe('abc');
      expect(call0[2]).toEqual({
        clobber: false
      });
    });
    it('move; overwrite', async () => {
      const mv = rpc._move({
        source: 'foo',
        destination: 'abc',
        overwrite: true
      });

      expect(mv).resolves.toEqual({});
      await mv;
      expect(fsPromise.mv.mock.calls.length).toBe(1);
      const call0 = fsPromise.mv.mock.calls[0];
      expect(call0[0]).toBe('foo');
      expect(call0[1]).toBe('abc');
      expect(call0[2]).toEqual({
        clobber: true
      });
    });
  });
  describe('fs/delete', () => {
    const fsPromise = {
      rmdir: jest.fn(),
      unlink: jest.fn(),
      lstat: jest.fn()
    };
    const rimraf = jest.fn();
    beforeAll(async () => {
      FsRpcMethods = require("../FsRpcMethods").FsRpcMethods;
      jest.mock('rimraf', () => rimraf);
      jest.mock("../../nuclide-commons/fsPromise", () => fsPromise);
    });
    afterAll(async () => {
      jest.resetModules();
    });
    beforeEach(async () => {
      rpc = new FsRpcMethods(undefined);
    });
    afterEach(async () => {
      jest.resetAllMocks();
    });
    it('recursive - rimraf', async () => {
      rimraf.mockImplementation((path, options, callback) => callback());

      const rm = rpc._delete({
        path: 'foo',
        recursive: true
      });

      expect(rm).resolves.toEqual({});
      await rm;
      expect(rimraf.mock.calls.length).toBe(1);
      expect(rimraf.mock.calls[0][0]).toEqual('foo');
      expect(rimraf.mock.calls[0][1]).toEqual({
        disableGlobs: true
      });
      expect(fsPromise.lstat.mock.calls.length).toBe(0);
      expect(fsPromise.rmdir.mock.calls.length).toBe(0);
      expect(fsPromise.unlink.mock.calls.length).toBe(0);
    });
    it('recursive - rimraf - error', async () => {
      const error = new Error('eek!');
      rimraf.mockImplementation((path, options, callback) => callback(error));

      const rm = rpc._delete({
        path: 'foo',
        recursive: true
      });

      expect(rm).rejects.toBe(error);
    });
    it('nonrecursive - dir', async () => {
      fsPromise.rmdir.mockImplementation(async path => {});
      fsPromise.lstat.mockImplementation(async path => ({
        isDirectory: () => true
      }));

      const rm = rpc._delete({
        path: 'foo',
        recursive: false
      });

      expect(rm).resolves.toEqual({});
      await rm;
      expect(fsPromise.lstat.mock.calls.length).toBe(1);
      expect(fsPromise.lstat.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.rmdir.mock.calls.length).toBe(1);
      expect(fsPromise.rmdir.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.unlink.mock.calls.length).toBe(0);
    });
    it('nonrecursive - file', async () => {
      fsPromise.rmdir.mockImplementation(async path => {});
      fsPromise.lstat.mockImplementation(async path => ({
        isDirectory: () => false
      }));

      const rm = rpc._delete({
        path: 'foo',
        recursive: false
      });

      expect(rm).resolves.toEqual({});
      await rm;
      expect(fsPromise.lstat.mock.calls.length).toBe(1);
      expect(fsPromise.lstat.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.unlink.mock.calls.length).toBe(1);
      expect(fsPromise.unlink.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.rmdir.mock.calls.length).toBe(0);
    });
  });
  describe('fs/copy', () => {
    const fsPromise = {
      copy: jest.fn(),
      exists: jest.fn()
    };
    beforeAll(async () => {
      FsRpcMethods = require("../FsRpcMethods").FsRpcMethods;
      jest.mock("../../nuclide-commons/fsPromise", () => fsPromise);
    });
    afterAll(async () => {
      jest.resetModules();
    });
    beforeEach(async () => {
      rpc = new FsRpcMethods(undefined);
    });
    afterEach(async () => {
      jest.resetAllMocks();
    });
    it('basic', async () => {
      fsPromise.copy.mockReturnValueOnce(Promise.resolve());

      const cp = rpc._copy({
        source: 'foo',
        destination: 'bar',
        overwrite: true
      });

      expect(cp).resolves.toEqual({});
      await cp;
      expect(fsPromise.exists.mock.calls.length).toBe(0);
      expect(fsPromise.copy.mock.calls.length).toBe(1);
      expect(fsPromise.copy.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.copy.mock.calls[0][1]).toEqual('bar');
    });
    it('basic fail', async () => {
      fsPromise.copy.mockReturnValueOnce(Promise.reject(new Error('eek!')));

      const cp = rpc._copy({
        source: 'foo',
        destination: 'bar',
        overwrite: true
      });

      expect(cp).rejects.toBeInstanceOf(Error);
      expect(cp).rejects.toHaveProperty('message', 'eek!');

      try {
        await cp;
      } catch (error) {}

      expect(fsPromise.copy.mock.calls.length).toBe(1);
      expect(fsPromise.copy.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.copy.mock.calls[0][1]).toEqual('bar');
    });
    it('overwrite succeed', async () => {
      fsPromise.copy.mockReturnValueOnce(Promise.resolve());
      fsPromise.exists.mockReturnValueOnce(Promise.resolve(false));

      const cp = rpc._copy({
        source: 'foo',
        destination: 'bar',
        overwrite: false
      });

      expect(cp).resolves.toEqual({});
      await cp;
      expect(fsPromise.exists.mock.calls.length).toBe(1);
      expect(fsPromise.exists.mock.calls[0][0]).toEqual('bar');
      expect(fsPromise.copy.mock.calls.length).toBe(1);
      expect(fsPromise.copy.mock.calls[0][0]).toEqual('foo');
      expect(fsPromise.copy.mock.calls[0][1]).toEqual('bar');
    });
    it('overwrite fail', async () => {
      fsPromise.copy.mockReturnValueOnce(Promise.resolve());
      fsPromise.exists.mockReturnValueOnce(Promise.resolve(true));

      const cp = rpc._copy({
        source: 'foo',
        destination: 'bar',
        overwrite: false
      });

      expect(cp).rejects.toBeInstanceOf(_RpcMethodError().RpcMethodError);
      expect(cp).rejects.toHaveProperty('parameters', {
        code: 'EEXIST'
      });

      try {
        await cp;
      } catch (error) {}

      expect(fsPromise.exists.mock.calls.length).toBe(1);
      expect(fsPromise.exists.mock.calls[0][0]).toEqual('bar');
      expect(fsPromise.copy.mock.calls.length).toBe(0);
    });
  });
  describe('fs/watch', () => {
    let watchmanSub;
    let onChangeEventRegistered;
    let watchmanClient;
    beforeAll(() => {
      FsRpcMethods = require("../FsRpcMethods").FsRpcMethods;
    });
    beforeEach(async () => {
      onChangeEventRegistered = new (_promise().Deferred)();
      watchmanSub = new class extends _eventKit().Emitter {
        on(event, listener) {
          super.on(event, listener); // We want to wait for this event to be registered before emitting
          // changes.

          if (event === 'change') {
            onChangeEventRegistered.resolve();
          }

          return this;
        }

      }();
      watchmanClient = {
        watchDirectoryRecursive: jest.fn(),
        unwatch: jest.fn()
      };
      watchmanClient.watchDirectoryRecursive.mockReturnValueOnce(Promise.resolve(watchmanSub));
      rpc = new FsRpcMethods(watchmanClient);
    });
    afterEach(async () => {
      watchmanSub.dispose();
    });
    it('empty - basic', async () => {
      const changes = [];

      const changesSub = rpc._watch({
        path: 'foo',
        recursive: true,
        exclude: []
      }).subscribe(c => changes.push(c));

      await onChangeEventRegistered.promise; // Are basic watch parameters correct?

      const call0 = watchmanClient.watchDirectoryRecursive.mock.calls[0];
      expect(call0[0]).toEqual('foo');
      expect(call0[1]).toEqual('big-dig-filewatcher-foo');
      expect(call0[2]).toBeUndefined();
      expect(watchmanClient.unwatch.mock.calls.length).toBe(0); // Is `unwatch` called when unsubscribed?

      await changesSub.unsubscribe();
      expect(watchmanClient.unwatch.mock.calls.length).toBe(1);
      expect(watchmanClient.unwatch.mock.calls[0][0]).toEqual('big-dig-filewatcher-foo'); // empty:

      expect(changes).toEqual([]);
    });
    it('empty - non-recursive', async () => {
      rpc._watch({
        path: 'foo',
        recursive: false,
        exclude: []
      }).subscribe(c => {});

      await onChangeEventRegistered.promise; // Watch expression should exclude recursive files:

      const call0 = watchmanClient.watchDirectoryRecursive.mock.calls[0];
      expect(call0[2]).toBeDefined();
      const excls = call0[2].expression[1].slice(1);
      expect(call0[2]).toEqual({
        expression: ['not', ['anyof', ...excls]]
      });
      expect(excls).toEqual([['dirname', '', ['depth', 'ge', 2]]]);
    });
    it('exclude', async () => {
      rpc._watch({
        path: 'foo',
        recursive: true,
        exclude: ['**/.hg/**/*', 'bar']
      }).subscribe(c => {});

      await onChangeEventRegistered.promise; // Watch expression should have excludes:

      const call0 = watchmanClient.watchDirectoryRecursive.mock.calls[0];
      expect(call0[2]).toBeDefined();
      const excls = call0[2].expression[1].slice(1);
      expect(call0[2]).toEqual({
        expression: ['not', ['anyof', ...excls]]
      });
      expect(excls.length).toBe(2);
      expect(excls).toContainEqual(['match', '**/.hg/**/*', 'wholename']);
      expect(excls).toContainEqual(['match', 'bar', 'wholename']);
    });
    it('non-recursive & exclude', async () => {
      rpc._watch({
        path: 'foo',
        recursive: false,
        exclude: ['**/.hg/**/*', 'bar']
      }).subscribe(c => {});

      await onChangeEventRegistered.promise; // Watch expression should have excludes (and exclude recursive results):

      const call0 = watchmanClient.watchDirectoryRecursive.mock.calls[0];
      expect(call0[2]).toBeDefined();
      const excls = call0[2].expression[1].slice(1);
      expect(call0[2]).toEqual({
        expression: ['not', ['anyof', ...excls]]
      });
      expect(excls.length).toBe(3);
      expect(excls).toContainEqual(['match', '**/.hg/**/*', 'wholename']);
      expect(excls).toContainEqual(['match', 'bar', 'wholename']);
      expect(excls).toContainEqual(['dirname', '', ['depth', 'ge', 2]]);
    });
    it('changes', async () => {
      const changesPromise = rpc._watch({
        path: 'abc',
        recursive: true,
        exclude: []
      }).take(4).toArray().toPromise();

      await onChangeEventRegistered.promise; // Create some watch results:

      watchmanSub.emit('change', [{
        name: 'aaa',
        exists: false,
        new: false
      }]);
      watchmanSub.emit('change', [{
        name: 'bbb',
        exists: false,
        new: true
      }]);
      watchmanSub.emit('change', [{
        name: 'ccc',
        exists: true,
        new: false
      }, {
        name: 'ddd',
        exists: false,
        new: false
      }]);
      watchmanSub.emit('change', [{
        name: 'eee',
        exists: true,
        new: true
      }]); // Check encoding of watch results:

      const changes = await changesPromise;
      expect(changes.length).toBe(4);
      expect(changes).toContainEqual([{
        path: 'aaa',
        type: 'd'
      }]);
      expect(changes).toContainEqual([{
        path: 'bbb',
        type: 'd'
      }]);
      expect(changes).toContainEqual([{
        path: 'ccc',
        type: 'u'
      }, {
        path: 'ddd',
        type: 'd'
      }]);
      expect(changes).toContainEqual([{
        path: 'eee',
        type: 'a'
      }]);
    });
  });
});