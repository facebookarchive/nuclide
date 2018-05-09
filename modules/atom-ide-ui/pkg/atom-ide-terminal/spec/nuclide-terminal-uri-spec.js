/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import url from 'url';

import {
  infoFromUri,
  uriFromInfo,
  TERMINAL_DEFAULT_LOCATION,
  TERMINAL_DEFAULT_ICON,
} from '../lib/nuclide-terminal-uri';

const defaultInfo = {
  remainOnCleanExit: false,
  defaultLocation: TERMINAL_DEFAULT_LOCATION,
  icon: TERMINAL_DEFAULT_ICON,
};

function uriFromCwd(cwd: ?string) {
  return uriFromInfo(cwd != null ? {cwd} : {});
}

describe('main', () => {
  describe('infoFromUri', () => {
    // This is verified via round-tripping below
  });
  describe('uriFromCwd', () => {
    it('creates a default uri', () => {
      const uri = uriFromCwd(null);
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with local cwd', () => {
      const uri = uriFromCwd('/home/username');
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('/home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with remote cwd', () => {
      const uri = uriFromCwd('nuclide://home/username');
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('nuclide://home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
  });
  describe('uriFromInfo', () => {
    it('creates a default uri', () => {
      const uri = uriFromInfo(defaultInfo);
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with remote cwd only', () => {
      const uri = uriFromInfo({...defaultInfo, cwd: 'nuclide://home/username'});
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('nuclide://home/username');
      expect(info.command).not.toBeDefined();
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with command only', () => {
      const command = {file: '/usr/bin/env', args: ['cowsay', 'hi']};
      const uri = uriFromInfo({...defaultInfo, command});
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).toEqual(command);
      expect(info.title).not.toBeDefined();
    });
    it('creates a uri with a title only', () => {
      const title = 'The Brothers Karamazov';
      const uri = uriFromInfo({...defaultInfo, title});
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).not.toBeDefined();
      expect(info.command).not.toBeDefined();
      expect(info.title).toEqual(title);
    });
    it('creates a uri with everything defined', () => {
      const cwd = 'nuclide://home/username';
      const command = {file: '/usr/bin/env', args: ['cowsay', 'hi']};
      const title = 'The Hymn of Acxiom';
      const uri = uriFromInfo({...defaultInfo, cwd, command, title});
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual(cwd);
      expect(info.command).toEqual(command);
      expect(info.title).toEqual(title);
    });
    it('ignores cwd with incorrect trustToken', () => {
      const cwd = 'nuclide://unexpected/directory';
      const uri = breakTrustToken(
        uriFromInfo({
          ...defaultInfo,
          cwd,
        }),
      );
      const info = infoFromUri(uri);
      expect(info).not.toBeNull();
      expect(info.cwd).toEqual('');
    });
  });
  it('ignores command with incorrect trustToken', () => {
    const command = {file: '/bin/bash', args: ['-c', 'echo rm -rf /']};
    const uri = breakTrustToken(
      uriFromInfo({
        ...defaultInfo,
        command,
      }),
    );
    const info = infoFromUri(uri);
    expect(info).not.toBeNull();
    expect(info.command).toBeUndefined();
  });
  it('ignores environment with incorrect trustToken', () => {
    const environmentVariables = new Map([['PATH', '/unexpected/path']]);
    const uri = breakTrustToken(
      uriFromInfo({
        ...defaultInfo,
        environmentVariables,
      }),
    );
    const info = infoFromUri(uri);
    expect(info).not.toBeNull();
    expect(info.environmentVariables).toBeUndefined();
  });
  it('ignores preservedCommands with incorrect trustToken', () => {
    const preservedCommands = ['unexpected:key-binding'];
    const uri = breakTrustToken(
      uriFromInfo({
        ...defaultInfo,
        preservedCommands,
      }),
    );
    const info = infoFromUri(uri);
    expect(info).not.toBeNull();
    expect(info.preservedCommands).toEqual([]);
  });
  it('ignores initialInput with incorrect trustToken', () => {
    const initialInput = 'echo rm -rf /';
    const uri = breakTrustToken(
      uriFromInfo({
        ...defaultInfo,
        initialInput,
      }),
    );
    const info = infoFromUri(uri);
    expect(info).not.toBeNull();
    expect(info.initialInput).toEqual('');
  });

  function breakTrustToken(uri: string): string {
    const {protocol, host, slashes, query} = url.parse(uri, true);
    return url.format({
      protocol,
      host,
      slashes,
      query: {...query, ...{trustToken: 'invalid'}},
    });
  }
});
