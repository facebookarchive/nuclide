"use strict";

var _url = _interopRequireDefault(require("url"));

function _nuclideTerminalUri() {
  const data = require("../lib/nuclide-terminal-uri");

  _nuclideTerminalUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
const defaultInfo = {
  remainOnCleanExit: false,
  defaultLocation: _nuclideTerminalUri().TERMINAL_DEFAULT_LOCATION,
  icon: _nuclideTerminalUri().TERMINAL_DEFAULT_ICON
};

function uriFromCwd(cwd) {
  return (0, _nuclideTerminalUri().uriFromInfo)(cwd != null ? {
    cwd
  } : {});
}

describe('main', () => {
  describe('infoFromUri', () => {// This is verified via round-tripping below
  });
  describe('uriFromCwd', () => {
    it('creates a default uri', () => {
      const uri = uriFromCwd(null);
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with local cwd', () => {
      const uri = uriFromCwd('/home/username');
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('/home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with remote cwd', () => {
      const uri = uriFromCwd('nuclide://home/username');
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('nuclide://home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
  });
  describe('uriFromInfo', () => {
    it('creates a default uri', () => {
      const uri = (0, _nuclideTerminalUri().uriFromInfo)(defaultInfo);
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with remote cwd only', () => {
      const uri = (0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
        cwd: 'nuclide://home/username'
      }));
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('nuclide://home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with command only', () => {
      const command = {
        file: '/usr/bin/env',
        args: ['cowsay', 'hi']
      };
      const uri = (0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
        command
      }));
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).toEqual(command);
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with a title only', () => {
      const title = 'The Brothers Karamazov';
      const uri = (0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
        title
      }));
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).toEqual(title);
    });
    it('creates a uri with everything defined', () => {
      const cwd = 'nuclide://home/username';
      const command = {
        file: '/usr/bin/env',
        args: ['cowsay', 'hi']
      };
      const title = 'The Hymn of Acxiom';
      const uri = (0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
        cwd,
        command,
        title
      }));
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual(cwd);
      expect(info.command).toEqual(command);
      expect(info.title).toEqual(title);
    });
    it('ignores cwd with incorrect trustToken', () => {
      const cwd = 'nuclide://unexpected/directory';
      const uri = breakTrustToken((0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
        cwd
      })));
      const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('');
    });
  });
  it('ignores command with incorrect trustToken', () => {
    const command = {
      file: '/bin/bash',
      args: ['-c', 'echo rm -rf /']
    };
    const uri = breakTrustToken((0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
      command
    })));
    const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
    expect(info).not.toBeNull();
    expect(info.command).toBeUndefined();
  });
  it('ignores environment with incorrect trustToken', () => {
    const environmentVariables = new Map([['PATH', '/unexpected/path']]);
    const uri = breakTrustToken((0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
      environmentVariables
    })));
    const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
    expect(info).not.toBeNull();
    expect(info.environmentVariables).toBeUndefined();
  });
  it('ignores preservedCommands with incorrect trustToken', () => {
    const preservedCommands = ['unexpected:key-binding'];
    const uri = breakTrustToken((0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
      preservedCommands
    })));
    const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
    expect(info).not.toBeNull();
    expect(info.preservedCommands).toEqual([]);
  });
  it('ignores initialInput with incorrect trustToken', () => {
    const initialInput = 'echo rm -rf /';
    const uri = breakTrustToken((0, _nuclideTerminalUri().uriFromInfo)(Object.assign({}, defaultInfo, {
      initialInput
    })));
    const info = (0, _nuclideTerminalUri().infoFromUri)(uri);
    expect(info).not.toBeNull();
    expect(info.initialInput).toEqual('');
  });

  function breakTrustToken(uri) {
    const {
      protocol,
      host,
      slashes,
      query
    } = _url.default.parse(uri, true);

    return _url.default.format({
      protocol,
      host,
      slashes,
      query: Object.assign({}, query, {
        trustToken: 'invalid'
      })
    });
  }
});