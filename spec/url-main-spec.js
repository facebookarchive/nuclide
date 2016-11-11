'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import electron from 'electron';
import fs from 'fs';
import invariant from 'invariant';
import url from 'url';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import path from 'path';
import temp from 'temp';
import urlMain from '../lib/url-main';
import * as pkgJson from '../package.json';

const {
  getLoadSettings,
  getApplicationState,
  getAtomInitializerScript,
  acquireLock,
  releaseLock,
} = urlMain.__test__;

const {remote} = electron;
invariant(remote != null);

temp.track();

// Simulates what Atom does when it creates a new BrowserWindow.
function createAtomWindow(urlToOpen: string) {
  const loadSettings = getLoadSettings();
  const newWindow = new remote.BrowserWindow({
    show: false,
    parent: remote.getCurrentWindow(),
  });
  newWindow.loadURL(url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(loadSettings.resourcePath, 'static/index.html'),
    hash: JSON.stringify({
      ...loadSettings,
      windowInitializationScript: require.resolve(path.join('..', pkgJson.urlMain)),
      urlToOpen,
    }),
  }));
  return newWindow;
}

describe('url-main', () => {
  it('sends a signal back to this window', () => {
    const spy = jasmine.createSpy('nuclide-url-open');
    const initialWindowCount = remote.BrowserWindow.getAllWindows().length;

    runs(() => {
      invariant(electron.ipcRenderer);
      electron.ipcRenderer.on('nuclide-url-open', spy);
      createAtomWindow('atom://nuclide/path?param=test');
    });

    waitsFor(() => spy.callCount === 1);

    runs(() => {
      expect(spy.calls[0].args[1]).toEqual({
        message: 'path',
        params: {param: 'test'},
      });
      // The URL-opening window should have destroyed itself.
      expect(remote.BrowserWindow.getAllWindows().length)
        .toBe(initialWindowCount);
    });
  });
});

describe('getApplicationState', () => {
  it('retrieves window state from storage/application.json', () => {
    const tmpdir = temp.mkdirSync();
    const storageDir = path.join(tmpdir, 'storage');
    fs.mkdirSync(storageDir);
    const mockState = [{initialPaths: ['test']}];
    fs.writeFileSync(path.join(storageDir, 'application.json'), JSON.stringify(mockState));
    expect(getApplicationState(tmpdir)).toEqual(mockState);
  });
});

describe('getAtomInitializerScript', () => {
  it('points to a valid and existing JS function', () => {
    // $FlowIgnore
    expect(typeof require(getAtomInitializerScript())).toBe('function');
  });
});

describe('acquireLock/releaseLock', () => {
  beforeEach(() => {
    releaseLock();
  });

  afterEach(() => {
    releaseLock();
  });

  it('acts as a mutex', () => {
    expect(acquireLock()).toBe(true);
    expect(acquireLock()).toBe(false);
    releaseLock();
    expect(acquireLock()).toBe(true);
  });

  it('expires after a timeout', () => {
    const dateSpy = spyOn(Date, 'now').andReturn(0);
    expect(acquireLock()).toBe(true);
    dateSpy.andReturn(10000);
    expect(acquireLock()).toBe(true);
  });
});
