'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* $FlowFixMe - module paths aren't supported */
import type BuckUtils from 'nuclide-buck-base/lib/BuckUtils';
/* $FlowFixMe - module paths aren't supported */
import type BuckProject from 'nuclide-buck-base/lib/BuckProject';

var logger = require('nuclide-logging').getLogger();
var path = require('path');
var buckProjectModule = require('nuclide-buck-base').BuckProject;

var CLANG_FLAGS_THAT_TAKE_PATHS = new Set([
  '-F',
  '-I',
  '-include',
  '-iquote',
  '-isysroot',
  '-isystem',
]);

var {from} = require('nuclide-commons').array;
var clangArgs = from(CLANG_FLAGS_THAT_TAKE_PATHS, item => item.length === 2 ? item : null)
    .filter(item => item !== null);
var SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS = new Set(clangArgs);

/**
  * Implementation of `path.isAbsolute`.
  * TODO(chenshen) use `path.isAbsolute` once we switch to node 0.12.x.
  */
function isAbsolutePath(filePath: string): boolean {
  return path.resolve(filePath) === path.normalize(filePath);
}


class ClangFlagsManager {
  _buckUtils: BuckUtils;
  _cachedBuckProjects: Map<string, BuckProject>;
  pathToFlags: {[path: string]: Array<string>};

  constructor(buckUtils: BuckUtils) {
    /**
     * Keys are absolute paths. Values are space-delimited strings of flags.
     */
    this.pathToFlags = {};
    this._buckUtils = buckUtils;
    this._cachedBuckProjects = new Map();
  }

  reset() {
    // TODO(mbolin): Message clang_server.py to clear its cache.
    this.pathToFlags = {};
  }

  async _getBuckProject(src: string): Promise<?BuckProject> {
    // For now, if a user requests the flags for a path outside of a Buck project,
    // such as /Applications/Xcode.app/Contents/Developer/Platforms/..., then
    // return null. Going forward, we probably want to special-case some of the
    // paths under /Applications/Xcode.app so that click-to-symbol works in
    // files like Frameworks/UIKit.framework/Headers/UIImage.h.
    var buckProjectRoot = await this._buckUtils.getBuckProjectRoot(src);
    if (buckProjectRoot === null) {
      logger.info(
          'Did not try to attempt to get flags from Buck because ' +
          'source file %s does not appear to be part of a Buck project.',
          src);
      return null;
    }

    if (this._cachedBuckProjects.has(buckProjectRoot)) {
      return this._cachedBuckProjects.get(buckProjectRoot);
    }

    var buckProject = new buckProjectModule.BuckProject({rootPath: buckProjectRoot});
    this._cachedBuckProjects.set(buckProjectRoot, buckProject);
    return buckProject;
  }

  /**
   * @return a space-delimited string of flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  async getFlagsForSrc(src: string): Promise<?Array<string>> {
    var flags = this.pathToFlags[src];
    if (flags) {
      return flags;
    }

    var buckProject = await this._getBuckProject(src);
    if (!buckProject) {
      return null;
    }

    var targets = await buckProject.getOwner(src);
    if (targets.length === 0) {
      return null;
    }

    // TODO(mbolin): The architecture should be chosen from a dropdown menu like
    // it is in Xcode rather than hardcoding things to iphonesimulator-x86_64.
    if (process.platform === 'darwin') {
      var arch = 'iphonesimulator-x86_64';
    } else {
      var arch = 'default';
    }
    // TODO(mbolin): Need logic to make sure results are restricted to
    // apple_library or apple_binary rules. In practice, this should be OK for
    // now. Though once we start supporting ordinary .cpp files, then we
    // likely need to be even more careful about choosing the architecture
    // flavor.
    var buildTarget = targets[0] + '#compilation-database,' + arch;

    var buildReport = await buckProject.build([buildTarget]);
    if (!buildReport.success) {
      // TODO(mbolin): Frequently failing due to 'Daemon is busy' errors.
      // Ultimately, Buck should queue things up, but for now, Nuclide should.
      var error = `Failed to build ${buildTarget}`;
      logger.error(error);
      throw error;
    }
    var buckProjectRoot = await buckProject.getPath();
    var pathToCompilationDatabase = buildReport['results'][buildTarget]['output'];
    pathToCompilationDatabase = path.join(
        buckProjectRoot,
        pathToCompilationDatabase);

    /* $FlowFixMe - module paths aren't supported */
    var {readFile} = require('nuclide-commons/lib/filesystem');

    var compilationDatabaseJsonBuffer = await readFile(pathToCompilationDatabase);
    var compilationDatabaseJson = compilationDatabaseJsonBuffer.toString('utf8');
    var compilationDatabase = JSON.parse(compilationDatabaseJson);
    compilationDatabase.forEach((item) => {
      var {file, args} = item;
      this.pathToFlags[file] = ClangFlagsManager.sanitizeCommand(
          file,
          args,
          buckProjectRoot);
    });

    // TODO(mbolin): Currently, src will not be in the map if it corresponds to
    // a header file. Use heuristics or whatever means necessary to fix this.
    return this.pathToFlags[src] || null;
  }

  static sanitizeCommand(sourceFile: string, args: Array<string>, buckProjectRoot: string): Array<string> {
    // For safety, create a new copy of the array. We exclude the path to the file to compile from
    // compilation database generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.
    var normalizedSourceFile = path.normalize(sourceFile);
    args = args.filter((arg) => normalizedSourceFile != path.resolve(buckProjectRoot, arg));

    // Resolve relative path arguments against the Buck project root.
    args.forEach((arg, argIndex) => {
      if (CLANG_FLAGS_THAT_TAKE_PATHS.has(arg)) {
        var nextIndex = argIndex + 1;
        var filePath = args[nextIndex];
        if (!isAbsolutePath(filePath)) {
          filePath = path.join(buckProjectRoot, filePath);
          args[nextIndex] = filePath;
        }
      } else if (SINGLE_LETTER_CLANG_FLAGS_THAT_TAKE_PATHS.has(arg.substring(0, 2))) {
        var filePath = arg.substring(2);
        if (!isAbsolutePath(filePath)) {
          filePath = path.join(buckProjectRoot, filePath);
          args[argIndex] = arg.substring(0, 2) + filePath;
        }
      }
    });

    // If an output file is specified, remove that argument.
    var index = args.indexOf('-o');
    if (index !== -1) {
      args.splice(index, 2);
    }

    return args;
  }
}

module.exports = ClangFlagsManager;
