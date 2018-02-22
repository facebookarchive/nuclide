/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import Projectionist from '../lib/main';

describe('Projectionist', () => {
  describe('getAlternates', () => {
    it('returns an empty list when nothing matches', () => {
      const projectionist = new Projectionist({
        'src/main/java/*.java': {
          alternate: 'src/test/java/{}.java',
        },
      });
      expect(
        projectionist.getAlternates(
          'src/main/does-not-exist/java/FooAbstractServiceFactoryImpl.java',
        ),
      ).toEqual([]);
    });

    it('returns an empty list when it matches but there arent alternates', () => {
      const projectionist = new Projectionist({
        'src/main/java/*.java': {
          make: 'build',
        },
      });
      expect(
        projectionist.getAlternates(
          'src/main/does-not-exist/java/FooAbstractServiceFactoryImpl.java',
        ),
      ).toEqual([]);
    });

    it('treats * as a generous glob', () => {
      const projectionist = new Projectionist({
        'pkg/*/*.js': {
          alternate: 'pkg/{}/spec/{}-spec.js',
        },
      });
      expect(
        projectionist.getAlternates('pkg/commons-node/foo/bar/baz/cache.js'),
      ).toEqual(['pkg/commons-node/spec/foo/bar/baz/cache-spec.js']);
    });

    it('returns a single matching alternate', () => {
      const projectionist = new Projectionist({
        'pkg/*/*.js': {
          alternate: 'pkg/{}/spec/{}-spec.js',
        },
      });
      expect(projectionist.getAlternates('pkg/commons-node/cache.js')).toEqual([
        'pkg/commons-node/spec/cache-spec.js',
      ]);
    });

    it('recurses with a global glob', () => {
      const projectionist = new Projectionist({
        '*': {
          '*.c': {
            alternate: '{}.h',
            type: 'source',
          },
        },
      });
      expect(projectionist.getAlternates('/foo/bar/baz.c')).toEqual([
        '/foo/bar/baz.h',
      ]);
    });

    it('recurses with a directory glob', () => {
      const projectionist = new Projectionist({
        'bin/scripts/': {
          'bin/scripts/*.js': {
            alternate: 'bin/scripts/{}-test.js',
          },
        },
      });
      expect(projectionist.getAlternates('bin/scripts/foo.js')).toEqual([
        'bin/scripts/foo-test.js',
      ]);
    });
  });

  describe('getType', () => {
    it('returns the type of a given file', () => {
      const projectionist = new Projectionist({
        'bin/scripts/': {
          'bin/scripts/*.js': {
            type: 'script',
          },
        },
      });
      expect(projectionist.getType('bin/scripts/foo.js')).toEqual('script');
    });
  });
});
