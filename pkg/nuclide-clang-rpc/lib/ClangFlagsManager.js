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

import type {ClangFlagsHandle} from './ClangFlagsPool';
import type {
  ClangCompilationDatabase,
  ClangFlags,
  ClangCompilationDatabaseEntry,
  ClangRequestSettings,
} from './rpc-types';

import {Observable} from 'rxjs';
import invariant from 'assert';
import nullthrows from 'nullthrows';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {shellParse} from 'nuclide-commons/string';
import {trackTiming} from '../../nuclide-analytics';
import {Cache} from '../../commons-node/cache';
import fsPromise from 'nuclide-commons/fsPromise';
import {getLogger} from 'log4js';
import {
  readCompilationFlags,
  fallbackReadCompilationFlags,
} from './clang-flags-reader';
import {mapPathsInFlags} from './clang-flags-parser';
import ClangFlagsPool from './ClangFlagsPool';
import {
  isHeaderFile,
  isSourceFile,
  commonPrefix,
  guessBuildFile,
  getFileBasename,
} from './utils';
import {
  getRelatedHeaderForSource,
  getRelatedSourceForHeader,
  findIncludingSourceFile,
} from './RelatedFileFinder';

const logger = getLogger('nuclide-clang-rpc');

const INCLUDE_SEARCH_TIMEOUT = 15000;
const COMPILATION_DATABASE_FILE = 'compile_commands.json';
const PROJECT_CLANG_FLAGS_FILE = '.nuclide_clang_config.json';

type ClangProjectFlags = {
  extraCompilerFlags: Array<string>,
  ignoredCompilerFlags: Array<string>,
};

let _customFlags;
function getCustomFlags() {
  if (_customFlags !== undefined) {
    return _customFlags;
  }
  try {
    // $FlowFB
    _customFlags = require('./fb/custom-flags');
  } catch (e) {
    _customFlags = null;
  }
  return _customFlags;
}

function overrideIncludePath(src: string): string {
  const customFlags = getCustomFlags();
  if (customFlags != null) {
    return customFlags.overrideIncludePath(src);
  }
  return src;
}

function getCacheKeyForDb(
  compilationDatabase: ?ClangCompilationDatabase,
): ?string {
  // only requestSettings.compilationDatabase.file is meaningful
  return compilationDatabase == null ? null : compilationDatabase.file;
}

export default class ClangFlagsManager {
  _compilationDatabases: Cache<
    ClangCompilationDatabase,
    Promise<Map<string, ClangFlagsHandle>>,
  > = new Cache({
    keyFactory: db => getCacheKeyForDb(db),
  });

  _flagPool: ClangFlagsPool;

  _realpathCache: Object;

  _clangProjectFlags: Map<string, Promise<?ClangProjectFlags>>;

  constructor() {
    this._realpathCache = {};
    this._clangProjectFlags = new Map();
    this._flagPool = new ClangFlagsPool();
  }

  reset() {
    this._compilationDatabases.clear();
    this._realpathCache = {};
    this._clangProjectFlags.clear();
    this._flagPool.reset();
  }

  getFlags(handle: ClangFlagsHandle): ?ClangFlags {
    return this._flagPool.getFlags(handle);
  }

  /**
   * @return a the normalized compilation flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */
  async getFlagsForSrc(
    src: string,
    requestSettings: ClangRequestSettings,
  ): Promise<?ClangFlags> {
    const data = await this._getFlagsForSrcCached(src, requestSettings);
    if (data != null) {
      const modifiedFlags = await this._getModifiedFlags(src, data);
      return {
        flags: modifiedFlags,
        directory: data.directory,
        flagsFile: data.flagsFile,
      };
    }
    return null;
  }

  async _getFlagsForSrcCached(
    src: string,
    requestSettings: ClangRequestSettings,
  ): Promise<?ClangFlags> {
    const {compilationDatabase} = requestSettings;
    if (compilationDatabase != null) {
      const flagMap = await this._compilationDatabases.get(compilationDatabase);
      if (flagMap != null) {
        const flagsHandle = flagMap.get(src);
        if (flagsHandle != null) {
          return this._flagPool.getFlags(flagsHandle);
        }
      }
    }
    return trackTiming('nuclide-clang.get-flags', () =>
      this._getFlagsForSrcImpl(src, requestSettings),
    );
  }

  _findSourceFileForHeaderFromCompilationDatabase(
    header: string,
    dbFlags: Map<string, ClangFlagsHandle>,
  ): ?string {
    const basename = getFileBasename(header);
    const srcWithSameBasename = [];
    const otherSrcs = [];
    for (const path of dbFlags.keys()) {
      if (getFileBasename(path) === basename && isSourceFile(path)) {
        srcWithSameBasename.push({
          score: commonPrefix(path, header),
          path,
        });
      } else {
        otherSrcs.push({
          score: commonPrefix(path, header),
          path,
        });
      }
    }
    const sortSrcs = srcs => srcs.sort((a, b) => b.score - a.score); // prefer bigger matches
    if (srcWithSameBasename.length > 0) {
      return sortSrcs(srcWithSameBasename)[0].path;
    }
    if (otherSrcs.length > 0) {
      return sortSrcs(otherSrcs)[0].path;
    }
    return null;
  }

  async _getModifiedFlags(
    src: string,
    clangFlags: ClangFlags,
  ): Promise<Array<string>> {
    const originalFlags = clangFlags.flags;
    // Look for the project-wide flags
    const projectFlagsDir = await fsPromise.findNearestFile(
      PROJECT_CLANG_FLAGS_FILE,
      nuclideUri.dirname(src),
    );
    if (projectFlagsDir == null) {
      return originalFlags;
    }
    const projectFlagsFile = nuclideUri.join(
      projectFlagsDir,
      PROJECT_CLANG_FLAGS_FILE,
    );
    const projectFlags = await this._loadProjectCompilerFlags(projectFlagsFile);
    if (projectFlags == null) {
      return originalFlags;
    }
    return originalFlags
      .filter(flag => projectFlags.ignoredCompilerFlags.indexOf(flag) === -1)
      .concat(projectFlags.extraCompilerFlags);
  }

  async _getDBFlagsAndDirForSrc(
    src: string,
    requestSettings: ClangRequestSettings,
  ): Promise<{
    dbFlags: ?Map<string, ClangFlagsHandle>,
    dbDir: ?string,
  }> {
    let dbFlags = null;
    let dbDir = null;
    const compilationDB = requestSettings.compilationDatabase;
    if (compilationDB != null && compilationDB.file != null) {
      // Look for a compilation database provided by the client.
      dbDir = nuclideUri.dirname(compilationDB.file);
      dbFlags = await this.loadFlagsFromCompilationDatabase(requestSettings);
    } else {
      // Look for a manually provided compilation database.
      dbDir = await fsPromise.findNearestFile(
        COMPILATION_DATABASE_FILE,
        nuclideUri.dirname(src),
      );
      if (dbDir != null) {
        const dbFile = nuclideUri.join(dbDir, COMPILATION_DATABASE_FILE);
        const compilationDatabase = {
          file: dbFile,
          flagsFile: null,
          libclangPath: null,
        };
        dbFlags = await this.loadFlagsFromCompilationDatabase({
          compilationDatabase,
          projectRoot: requestSettings.projectRoot,
        });
      }
    }
    return {dbFlags, dbDir};
  }

  async _getRelatedSrcFileForHeader(
    header: string,
    dbFlags: ?Map<string, ClangFlagsHandle>,
    projectRoot: ?string,
  ): Promise<?string> {
    const source = await getRelatedSourceForHeader(header);
    if (source != null) {
      return source;
    }
    if (dbFlags != null) {
      const sourceFile = this._findSourceFileForHeaderFromCompilationDatabase(
        header,
        dbFlags,
      );
      if (sourceFile != null) {
        return sourceFile;
      }
    }
    if (projectRoot != null) {
      // Try searching all subdirectories for source files that include this header.
      // Give up after INCLUDE_SEARCH_TIMEOUT.
      return findIncludingSourceFile(header, projectRoot)
        .timeout(INCLUDE_SEARCH_TIMEOUT)
        .catch(() => Observable.of(null))
        .toPromise();
    }
    return null;
  }

  async getRelatedSourceOrHeader(
    src: string,
    requestSettings: ClangRequestSettings,
  ): Promise<?string> {
    const {dbFlags, dbDir} = await this._getDBFlagsAndDirForSrc(
      src,
      requestSettings,
    );
    const projectRoot =
      requestSettings == null ? null : requestSettings.projectRoot;
    if (isHeaderFile(src)) {
      return this._getRelatedSrcFileForHeader(
        src,
        dbFlags,
        // flowlint-next-line sketchy-null-string:off
        projectRoot || dbDir,
      );
    }
    return getRelatedHeaderForSource(src);
  }

  async _getFlagsForSrcImpl(
    src: string,
    requestSettings: ClangRequestSettings,
  ): Promise<?ClangFlags> {
    const {dbFlags, dbDir} = await this._getDBFlagsAndDirForSrc(
      src,
      requestSettings,
    );
    if (dbFlags != null) {
      const flagsHandle = dbFlags.get(src);
      if (flagsHandle != null) {
        return this._flagPool.getFlags(flagsHandle);
      }
    }

    if (isHeaderFile(src)) {
      const sourceFile = await this._getRelatedSrcFileForHeader(
        src,
        dbFlags,
        // flowlint-next-line sketchy-null-string:off
        requestSettings.projectRoot || dbDir,
      );
      if (sourceFile != null) {
        return this._getFlagsForSrcCached(sourceFile, requestSettings);
      }
    }

    const compilationDB = requestSettings.compilationDatabase;
    // Even if we can't get flags, try to watch the build file in case they get added.
    const buildFile =
      compilationDB != null && compilationDB.flagsFile != null
        ? compilationDB.flagsFile
        : await guessBuildFile(src);
    if (buildFile != null) {
      return {
        flags: [],
        flagsFile: buildFile,
        directory: nuclideUri.dirname(src),
      };
    }

    return null;
  }

  async _loadProjectCompilerFlags(
    flagsFile: string,
  ): Promise<?ClangProjectFlags> {
    let cached = this._clangProjectFlags.get(flagsFile);
    if (cached == null) {
      cached = this._loadProjectCompilerFlagsImpl(flagsFile);
      this._clangProjectFlags.set(flagsFile, cached);
    }
    return cached;
  }

  async _loadProjectCompilerFlagsImpl(
    flagsFile: string,
  ): Promise<?ClangProjectFlags> {
    let result = null;
    try {
      const contents = await fsPromise.readFile(flagsFile, 'utf8');
      const data = JSON.parse(contents);
      invariant(data instanceof Object);
      const {extra_compiler_flags, ignored_compiler_flags} = data;
      const extraCompilerFlags = [];
      const ignoredCompilerFlags = [];

      if (extra_compiler_flags != null) {
        extra_compiler_flags.forEach(flag => extraCompilerFlags.push(flag));
      }
      if (ignored_compiler_flags != null) {
        ignored_compiler_flags.forEach(flag => ignoredCompilerFlags.push(flag));
      }
      result = {extraCompilerFlags, ignoredCompilerFlags};
    } catch (e) {
      logger.error(`Error reading compilation flags from ${flagsFile}`, e);
    }

    return result;
  }

  _assertCompilationDatabaseEntry(entry: Object): void {
    invariant(
      typeof entry.file === 'string' &&
        typeof entry.directory === 'string' &&
        (typeof entry.command === 'string' || Array.isArray(entry.arguments)),
      'The compilation database entry is invalid and does not comply with the spec.',
    );
  }

  async _processCompilationDatabaseEntry(
    entry: Object,
    dbDir: string,
    flagsFile: ?string,
    dbFile: string,
  ): Promise<[string, ClangFlagsHandle]> {
    this._assertCompilationDatabaseEntry(entry);
    const directory = await fsPromise.realpath(
      // Relative directories aren't part of the spec, but resolving them
      // relative to the compile_commands.json location seems reasonable.
      nuclideUri.resolve(dbDir, entry.directory),
      this._realpathCache,
    );
    const filename = nuclideUri.resolve(directory, entry.file);
    const realpath = await fsPromise.realpath(filename, this._realpathCache);
    const clangFlags = ClangFlagsManager.sanitizeEntry(
      entry,
      flagsFile == null ? dbFile : flagsFile,
    );
    return [realpath, this._flagPool.getHandle(clangFlags)];
  }

  async _loadFlagsFromCompilationDatabase(
    dbFile: string,
    flagsFile: ?string,
    requestSettings: ClangRequestSettings,
  ): Promise<Map<string, ClangFlagsHandle>> {
    const flags = new Map();
    const dbDir = nuclideUri.dirname(dbFile);
    // Factor out the common arguments to _processCompilationDatabaseEntry.
    const processEntry = (
      entry: ClangCompilationDatabaseEntry,
    ): Promise<[string, ClangFlagsHandle]> =>
      this._processCompilationDatabaseEntry(entry, dbDir, flagsFile, dbFile);

    const processedEntries = await readCompilationFlags(dbFile)
      .flatMap(processEntry)
      .toArray()
      .toPromise()
      .catch(error => {
        logger.error(
          `Saw error loading ${dbFile}, falling back to JSON.parse.`,
          error,
        );
        return fallbackReadCompilationFlags(dbFile).then(entries =>
          Promise.all(entries.map(entry => processEntry(entry))),
        );
      })
      .catch(error => {
        logger.error(
          `Fallback parser for ${dbFile} encountered error too`,
          error,
        );
        return [];
      });
    for (const [realpath, clangFlagsHandle] of processedEntries) {
      flags.set(realpath, clangFlagsHandle);
    }
    return flags;
  }

  loadFlagsFromCompilationDatabase(
    requestSettings: ClangRequestSettings,
  ): Promise<Map<string, ClangFlagsHandle>> {
    const db = requestSettings.compilationDatabase;
    if (db == null) {
      return Promise.resolve(new Map());
    }
    const dbFile = db.file;
    if (dbFile == null) {
      return Promise.resolve(new Map());
    }
    return this._compilationDatabases.getOrCreate(
      db,
      () =>
        this._loadFlagsFromCompilationDatabase(
          dbFile,
          db.flagsFile,
          requestSettings,
        ) || Promise.resolve(new Map()),
    );
  }

  static _getXFlagForSourceFile(sourceFile: string): string {
    const ext = nuclideUri.extname(sourceFile);
    if (ext === '.mm') {
      return 'objective-c++';
    } else if (ext === '.m') {
      return 'objective-c';
    } else if (ext === '.c') {
      return 'c';
    } else {
      return 'c++';
    }
  }

  static sanitizeEntry(
    entry: ClangCompilationDatabaseEntry,
    flagsFile: string,
  ): ClangFlags {
    const {directory, file} = entry;
    // Nullthrows is safe because of _assertCompilationDatabaseEntry.
    let args =
      entry.arguments !== undefined
        ? entry.arguments
        : shellParse(nullthrows(entry.command));
    // We exclude the path to the file to compile from the compilation database
    // generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.
    const normalizedSourceFile = nuclideUri.normalize(file);
    args = args.filter(
      arg =>
        normalizedSourceFile !== arg &&
        normalizedSourceFile !== nuclideUri.resolve(directory, arg),
    );
    // Add the -x flag if it does not exist.
    if (!args.find(arg => arg === '-x')) {
      const xFlag = ClangFlagsManager._getXFlagForSourceFile(file);
      args.push('-x', xFlag);
    }
    // Resolve relative path arguments against the Buck project root.
    args = mapPathsInFlags(args, path_ => {
      let path = overrideIncludePath(path_);
      if (!nuclideUri.isAbsolute(path)) {
        path = nuclideUri.join(directory, path);
      }
      return path;
    });

    const skipArgs = ['-o', '-MF'];
    // If an output file is specified, remove that argument.
    skipArgs.forEach(arg => {
      const index = args.indexOf(arg);
      if (index !== -1) {
        args.splice(index, 2);
      }
    });
    return {directory, flagsFile, flags: args};
  }
}
