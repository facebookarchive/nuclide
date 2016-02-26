'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Activation} from '../lib/Activation';
import {CwdApi} from '../lib/CwdApi';
import invariant from 'assert';
import {Directory} from 'atom';

describe('current-working-directory', () => {

  beforeEach(() => {
    spyOn(atom.project, 'getDirectories').andReturn([
      new Directory('/a/b/c'),
      new Directory('/d/e/f'),
    ]);
  });

  describe('Activation', () => {

    describe('provideApi', () => {

      it('provides an API with the initial path', () => {
        const activation = new Activation({initialCwdPath: '/a/b/c'});
        const api = activation.provideApi();
        const cwd = api.getCwd();
        invariant(cwd != null);
        expect(cwd.getPath()).toBe('/a/b/c');
      });

    });

  });

  describe('CwdApi', () => {

    it('gets and sets the cwd', () => {
      const api = new CwdApi('/a/b/c');
      let cwd = api.getCwd();
      invariant(cwd != null);
      expect(cwd.getPath()).toBe('/a/b/c');
      api.setCwd('/d/e/f');
      cwd = api.getCwd();
      invariant(cwd != null);
      expect(cwd.getPath()).toBe('/d/e/f');
    });

    it('errors if you set an invalid cwd', () => {
      const api = new CwdApi('/a/b/c');
      const setInvalidCwd = () => { api.setCwd('/x/y/z'); };
      expect(setInvalidCwd).toThrow();
    });

  });

});

describe('CwdApi event handling', () => {

  it('falls back to an existing project when you remove one', () => {
    let projects = [
      new Directory('/a/b/c'),
      new Directory('/d/e/f'),
    ];
    spyOn(atom.project, 'getDirectories').andCallFake(() => projects);

    let callback;
    const onDidChangePaths = cb => callback = cb;
    const originalOnDidChangePaths = atom.project.onDidChangePaths;
    try {
      (atom.project: any).onDidChangePaths = onDidChangePaths;
      const api = new CwdApi('/d/e/f');

      // Simulate the removing of a directory from the project list.
      projects = [new Directory('/a/b/c')];
      expect(callback).toBeDefined();
      invariant(callback);
      callback();

      const cwd = api.getCwd();
      invariant(cwd != null);
      expect(cwd.getPath()).toBe('/a/b/c');
    } finally {
      (atom.project: any).onDidChangePaths = originalOnDidChangePaths;
    }
  });

});
