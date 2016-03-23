'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {BuckUtils} from '../../nuclide-buck-base/lib/BuckUtils';
import ClangFlagsManager from '../lib/ClangFlagsManager';

describe('ClangFlagsManager', () => {

  let flagsManager: ClangFlagsManager;
  let buckProject;
  beforeEach(() => {
    flagsManager = new ClangFlagsManager(new BuckUtils());
    buckProject = {
      getOwner(src) {
        // Default header targets should be ignored.
        return ['//test:__default_headers__', '//test'];
      },
      getPath() {
        return path.join(__dirname, 'fixtures');
      },
      build() {
        return {
          success: true,
          results: {
            '//test#compilation-database,iphonesimulator-x86_64': {
              output: 'compile_commands.json',
            },
            // For testing on non-Mac machines.
            '//test#compilation-database,default': {
              output: 'compile_commands.json',
            },
          },
        };
      },
    };
    spyOn(flagsManager, '_getBuckProject').andReturn(buckProject);
  });

  it('sanitizeCommand()', () => {
    const {sanitizeCommand} = ClangFlagsManager;

    const originalArgs = [
      '/usr/bin/clang',
      '-mios-simulator-version-min=7.0',
      '-c',
      '-x',
      'objective-c',
      '-std=gnu11',
      '-Wno-deprecated',
      '-Wno-conversion',
      '-fobjc-arc',

      '-F',
      'local/path',
      '-F',
      '/absolute/path',
      '-Flocal/path',
      '-F/absolute/path',

      '-I',
      'local/path',
      '-I',
      '/absolute/path',
      '-Ilocal/path',
      '-I/absolute/path',

      '-include',
      'local/path',
      '-include',
      '/absolute/path',

      // This is nonsensical, but should not be transformed.
      '-include/absolute/path',

      '-iquote',
      'local/path',
      '-iquote',
      '/absolute/path',

      '-isysroot',
      'local/path',
      '-isysroot',
      '/absolute/path',

      '-isystem',
      'local/path',
      '-isystem',
      '/absolute/path',

      '-o',
      'buck-out/local/path/EXExample.o',
      'local/path/EXExample.m',
    ];
    const buckProjectRoot = '/Users/whoami/project/';
    const sanitizedCommandArgs = sanitizeCommand(
        '/Users/whoami/project/local/path/EXExample.m', originalArgs, buckProjectRoot);

    const expectedArgs = [
      '/usr/bin/clang',
      '-mios-simulator-version-min=7.0',
      '-c',
      '-x',
      'objective-c',
      '-std=gnu11',
      '-Wno-deprecated',
      '-Wno-conversion',
      '-fobjc-arc',

      '-F',
      buckProjectRoot + 'local/path',
      '-F',
      '/absolute/path',
      '-F' + buckProjectRoot + 'local/path',
      '-F/absolute/path',

      '-I',
      buckProjectRoot + 'local/path',
      '-I',
      '/absolute/path',
      '-I' + buckProjectRoot + 'local/path',
      '-I/absolute/path',

      '-include',
      buckProjectRoot + 'local/path',
      '-include',
      '/absolute/path',

      '-include/absolute/path',

      '-iquote',
      buckProjectRoot + 'local/path',
      '-iquote',
      '/absolute/path',

      '-isysroot',
      buckProjectRoot + 'local/path',
      '-isysroot',
      '/absolute/path',

      '-isystem',
      buckProjectRoot + 'local/path',
      '-isystem',
      '/absolute/path',
    ];
    expect(sanitizedCommandArgs).toEqual(expectedArgs);
  });

  it('gets flags for a source file', () => {
    waitsForPromise(async () => {
      let flags = await flagsManager.getFlagsForSrc('test.cpp');
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      // Make sure this is cached.
      spyOn(buckProject, 'build').andCallThrough();
      flags = await flagsManager.getFlagsForSrc('test.cpp');
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);
      expect(buckProject.build).not.toHaveBeenCalled();

      // Make sure cache gets reset.
      flagsManager.reset();
      flags = await flagsManager.getFlagsForSrc('test.cpp');
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);
      expect(buckProject.build).toHaveBeenCalled();
    });
  });

  it('supports negative caching', () => {
    waitsForPromise(async () => {
      // Unowned projects shouldn't invoke Buck again.
      buckProject.getOwner = () => [];
      let flags = await flagsManager.getFlagsForSrc('test');
      expect(flags).toBe(null);

      spyOn(buckProject, 'getOwner').andCallThrough();
      flags = await flagsManager.getFlagsForSrc('test');
      expect(flags).toBe(null);
      expect(buckProject.getOwner).not.toHaveBeenCalled();
    });
  });

  it('gets flags for header files', () => {
    waitsForPromise(async () => {
      let flags = await flagsManager.getFlagsForSrc('header.h');
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      flags = await flagsManager.getFlagsForSrc('header.hpp');
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      // When headers are not properly owned, we should look for source files
      // in the same directory.
      const spy = spyOn(buckProject, 'getOwner').andReturn(['//test:__default_headers__']);
      const dir = path.join(__dirname, 'fixtures');
      flags = await flagsManager.getFlagsForSrc(path.join(dir, 'testInternal.h'));
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      flags = await flagsManager.getFlagsForSrc(path.join(dir, 'test-inl.h'));
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      flags = await flagsManager.getFlagsForSrc(path.join(dir, 'test2.h'));
      expect(flags).toBeNull();

      // Make sure we don't try get flags for non-source files.
      flags = await flagsManager.getFlagsForSrc(path.join(dir, 'compile_commands.h'));
      expect(flags).toBeNull();
      expect(spy).not.toHaveBeenCalledWith(path.join(dir, 'compile_commands.json'));
    });
  });

  it('gets flags from the compilation database', () => {
    waitsForPromise(async () => {
      spyOn(buckProject, 'build').andCallThrough();
      let testFile = path.join(__dirname, 'fixtures', 'test.cpp');
      let flags = await flagsManager.getFlagsForSrc(testFile);
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);
      expect(buckProject.build).not.toHaveBeenCalled();

      testFile = path.join(__dirname, 'fixtures', 'test.h');
      flags = await flagsManager.getFlagsForSrc(testFile);
      expect(flags).toEqual(['g++', '-fPIC', '-O3']);

      // Fall back to Buck if it's not in the compilation DB.
      testFile = path.join(__dirname, 'fixtures', 'test2.cpp');
      flags = await flagsManager.getFlagsForSrc(testFile);
      expect(buckProject.build).toHaveBeenCalled();
      expect(flags).toEqual(null);
    });
  });

  it('correctly parses arguments from raw commands', () => {
    // shell-quote is pretty safe; just make sure we ignore unexpected Objects like operators.
    expect(ClangFlagsManager.parseArgumentsFromCommand('test "a\\" b c" \'a b\' || x'))
      .toEqual(['test', 'a" b c', 'a b']);
  });

});
