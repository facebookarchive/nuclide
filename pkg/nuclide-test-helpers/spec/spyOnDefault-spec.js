'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {spyOnDefault, unspyOnDefault} from '../lib/main';

describe('spyOnDefault and unspyOnDefault', () => {
  beforeEach(() => {
    // Remove the fixture and it's children from the cache.
    delete require.cache[require.resolve('./fixtures/module-importing-defaults')];
    delete require.cache[require.resolve('./fixtures/module-cjs-function')];
    delete require.cache[require.resolve('./fixtures/module-default-and-members')];
    delete require.cache[require.resolve('./fixtures/module-one-default')];
  });

  describe('spyOnDefault', () => {
    it('should spy on modules that have never been loaded', () => {
      const cjsFunctionSpy =
        spyOnDefault(require.resolve('./fixtures/module-cjs-function'));
      const defaultAndMembersSpy =
        spyOnDefault(require.resolve('./fixtures/module-default-and-members'));
      const oneDefaultSpy =
        spyOnDefault(require.resolve('./fixtures/module-one-default'));

      const moduleImportingDefaults = require('./fixtures/module-importing-defaults');

      moduleImportingDefaults.cjsFunction('foo');
      expect(cjsFunctionSpy).toHaveBeenCalledWith('foo');

      moduleImportingDefaults.defaultAndMembers('bar');
      expect(defaultAndMembersSpy).toHaveBeenCalledWith('bar');

      moduleImportingDefaults.oneDefault('baz');
      expect(oneDefaultSpy).toHaveBeenCalledWith('baz');
    });

    it('should spy on modules that were already loaded', () => {
      require('./fixtures/module-cjs-function');
      require('./fixtures/module-default-and-members');
      require('./fixtures/module-one-default');

      const cjsFunctionSpy =
        spyOnDefault(require.resolve('./fixtures/module-cjs-function'));
      const defaultAndMembersSpy =
        spyOnDefault(require.resolve('./fixtures/module-default-and-members'));
      const oneDefaultSpy =
        spyOnDefault(require.resolve('./fixtures/module-one-default'));

      const moduleImportingDefaults = require('./fixtures/module-importing-defaults');

      moduleImportingDefaults.cjsFunction('foo');
      expect(cjsFunctionSpy).toHaveBeenCalledWith('foo');

      moduleImportingDefaults.defaultAndMembers('bar');
      expect(defaultAndMembersSpy).toHaveBeenCalledWith('bar');

      moduleImportingDefaults.oneDefault('baz');
      expect(oneDefaultSpy).toHaveBeenCalledWith('baz');
    });
  });

  describe('unspyOnDefault', () => {
    it('should unspy', () => {
      const originalFunctions = require('./fixtures/module-importing-defaults');

      const cjsFunctionSpy =
        spyOnDefault(require.resolve('./fixtures/module-cjs-function'));
      const defaultAndMembersSpy =
        spyOnDefault(require.resolve('./fixtures/module-default-and-members'));
      const oneDefaultSpy =
        spyOnDefault(require.resolve('./fixtures/module-one-default'));

      delete require.cache[require.resolve('./fixtures/module-importing-defaults')];
      const moduleImportingDefaults1 = require('./fixtures/module-importing-defaults');

      expect(moduleImportingDefaults1.cjsFunction)
        .toBe(cjsFunctionSpy);
      expect(moduleImportingDefaults1.cjsFunction)
        .not.toBe(originalFunctions.cjsFunction);

      expect(moduleImportingDefaults1.defaultAndMembers)
        .toBe(defaultAndMembersSpy);
      expect(moduleImportingDefaults1.defaultAndMembers)
        .not.toBe(originalFunctions.defaultAndMembers);

      expect(moduleImportingDefaults1.oneDefault)
        .toBe(oneDefaultSpy);
      expect(moduleImportingDefaults1.oneDefault)
        .not.toBe(originalFunctions.oneDefault);

      unspyOnDefault(require.resolve('./fixtures/module-cjs-function'));
      unspyOnDefault(require.resolve('./fixtures/module-default-and-members'));
      unspyOnDefault(require.resolve('./fixtures/module-one-default'));

      delete require.cache[require.resolve('./fixtures/module-importing-defaults')];
      const moduleImportingDefaults2 = require('./fixtures/module-importing-defaults');

      expect(moduleImportingDefaults2.cjsFunction)
        .toBe(originalFunctions.cjsFunction);

      expect(moduleImportingDefaults2.defaultAndMembers)
        .toBe(originalFunctions.defaultAndMembers);

      expect(moduleImportingDefaults2.oneDefault)
        .toBe(originalFunctions.oneDefault);
    });
  });
});
