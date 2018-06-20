'use strict';

var _main;

function _load_main() {
  return _main = _interopRequireDefault(require('../lib/main'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Projectionist', () => {
  describe('getAlternates', () => {
    it('returns an empty list when nothing matches', () => {
      const projectionist = new (_main || _load_main()).default({
        'src/main/java/*.java': {
          alternate: 'src/test/java/{}.java'
        }
      });
      expect(projectionist.getAlternates('src/main/does-not-exist/java/FooAbstractServiceFactoryImpl.java')).toEqual([]);
    });

    it('returns an empty list when it matches but there arent alternates', () => {
      const projectionist = new (_main || _load_main()).default({
        'src/main/java/*.java': {
          make: 'build'
        }
      });
      expect(projectionist.getAlternates('src/main/does-not-exist/java/FooAbstractServiceFactoryImpl.java')).toEqual([]);
    });

    it('treats * as a generous glob', () => {
      const projectionist = new (_main || _load_main()).default({
        'pkg/*/*.js': {
          alternate: 'pkg/{}/spec/{}-spec.js'
        }
      });
      expect(projectionist.getAlternates('pkg/commons-node/foo/bar/baz/cache.js')).toEqual(['pkg/commons-node/spec/foo/bar/baz/cache-spec.js']);
    });

    it('returns a single matching alternate', () => {
      const projectionist = new (_main || _load_main()).default({
        'pkg/*/*.js': {
          alternate: 'pkg/{}/spec/{}-spec.js'
        }
      });
      expect(projectionist.getAlternates('pkg/commons-node/cache.js')).toEqual(['pkg/commons-node/spec/cache-spec.js']);
    });

    it('recurses with a global glob', () => {
      const projectionist = new (_main || _load_main()).default({
        '*': {
          '*.c': {
            alternate: '{}.h',
            type: 'source'
          }
        }
      });
      expect(projectionist.getAlternates('/foo/bar/baz.c')).toEqual(['/foo/bar/baz.h']);
    });

    it('recurses with a directory glob', () => {
      const projectionist = new (_main || _load_main()).default({
        'bin/scripts/': {
          'bin/scripts/*.js': {
            alternate: 'bin/scripts/{}-test.js'
          }
        }
      });
      expect(projectionist.getAlternates('bin/scripts/foo.js')).toEqual(['bin/scripts/foo-test.js']);
    });

    it('returns all possible alternates', () => {
      const projectionist = new (_main || _load_main()).default({
        'pkg/*/spec/*-spec.js': {
          alternate: 'pkg/{}/lib/{}.js',
          type: 'test'
        },
        'pkg/*/*.js': {
          alternate: 'pkg/{}/spec/{}-spec.js'
        }
      });

      expect(projectionist.getAlternates('pkg/foo/spec/bar-spec.js')).toEqual(['pkg/foo/lib/bar.js', 'pkg/foo/spec/spec/bar-spec-spec.js']);
    });

    it('expands dirname and basename', () => {
      const projectionist = new (_main || _load_main()).default({
        '**/__tests__/*-test.js': {
          alternate: '{dirname}/{basename}.js',
          type: 'test'
        }
      });

      expect(projectionist.getAlternates('bin/scripts/__tests__/foo-test.js')).toEqual(['bin/scripts/foo.js']);
    });

    it('expands many dirname and basename', () => {
      const projectionist = new (_main || _load_main()).default({
        '*.js': {
          alternate: ['{dirname}/{basename}.test.js', '{dirname}/__tests__/{basename}-test.js', '{dirname}/__tests__/{basename}-mocha.js'],
          type: 'source'
        }
      });

      expect(projectionist.getAlternates('bin/scripts/foo.js')).toEqual(['bin/scripts/foo.test.js', 'bin/scripts/__tests__/foo-test.js', 'bin/scripts/__tests__/foo-mocha.js']);
    });
  });

  describe('getType', () => {
    it('returns the type of a given file', () => {
      const projectionist = new (_main || _load_main()).default({
        'bin/scripts/': {
          'bin/scripts/*.js': {
            type: 'script'
          }
        }
      });
      expect(projectionist.getType('bin/scripts/foo.js')).toEqual('script');
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