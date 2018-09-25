"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _SimpleCache() {
  const data = require("../../../modules/nuclide-commons/SimpleCache");

  _SimpleCache = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _clangFlagsReader() {
  const data = require("./clang-flags-reader");

  _clangFlagsReader = function () {
    return data;
  };

  return data;
}

function _clangFlagsParser() {
  const data = require("./clang-flags-parser");

  _clangFlagsParser = function () {
    return data;
  };

  return data;
}

function _ClangFlagsPool() {
  const data = _interopRequireDefault(require("./ClangFlagsPool"));

  _ClangFlagsPool = function () {
    return data;
  };

  return data;
}

function _finders() {
  const data = require("./related-file/finders");

  _finders = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-clang-rpc');
const COMPILATION_DATABASE_FILE = 'compile_commands.json';
const PROJECT_CLANG_FLAGS_FILE = '.nuclide_clang_config.json';

let _customFlags;

function getCustomFlags() {
  if (_customFlags !== undefined) {
    return _customFlags;
  }

  try {
    // $FlowFB
    _customFlags = require("./fb/custom-flags");
  } catch (e) {
    _customFlags = null;
  }

  return _customFlags;
}

function overrideIncludePath(src) {
  const customFlags = getCustomFlags();

  if (customFlags != null) {
    return customFlags.overrideIncludePath(src);
  }

  return src;
}

class ClangFlagsManager {
  // Map from the database file to its files -> flags mappings.
  constructor() {
    this._compilationDatabases = new (_SimpleCache().SimpleCache)();
    this._uriResolveCache = new (_SimpleCache().SimpleCache)({
      keyFactory: ([parent, relative]) => relative + parent
    });
    this._relatedFileFinder = new (_finders().RelatedFileFinder)();
    this._realpathCache = {};
    this._clangProjectFlags = new Map();
    this._flagPool = new (_ClangFlagsPool().default)();
  }

  reset() {
    this._compilationDatabases.clear();

    this._realpathCache = {};

    this._clangProjectFlags.clear();

    this._flagPool.reset();
  }

  getFlags(handle) {
    return this._flagPool.getFlags(handle);
  }
  /**
   * @return a the normalized compilation flags or null if nothing is known
   *     about the src file. For example, null will be returned if src is not
   *     under the project root.
   */


  async getFlagsForSrc(src, requestSettings) {
    const data = await this._getFlagsForSrcCached(src, requestSettings);

    if (data != null) {
      const modifiedFlags = await this._getModifiedFlags(src, data);
      return {
        flags: modifiedFlags,
        directory: data.directory,
        flagsFile: data.flagsFile
      };
    }

    return null;
  }

  async _getFlagsForSrcCached(src, requestSettings) {
    const {
      compilationDatabase
    } = requestSettings;

    if (compilationDatabase != null) {
      const {
        file
      } = compilationDatabase;

      if (file != null) {
        const flagMap = await this._compilationDatabases.get(file);

        if (flagMap != null) {
          const flagsHandle = flagMap.get(src);

          if (flagsHandle != null) {
            return this._flagPool.getFlags(flagsHandle);
          }
        }
      }
    }

    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang.get-flags', () => this._getFlagsForSrcImpl(src, requestSettings));
  }

  _findSourceFileForHeaderFromCompilationDatabase(header, dbFlags) {
    const basename = (0, _utils().getFileBasename)(header);
    const srcWithSameBasename = [];
    const otherSrcs = [];

    for (const path of dbFlags.keys()) {
      if ((0, _utils().getFileBasename)(path) === basename && (0, _utils().isSourceFile)(path)) {
        srcWithSameBasename.push({
          score: (0, _utils().commonPrefix)(path, header),
          path
        });
      } else {
        otherSrcs.push({
          score: (0, _utils().commonPrefix)(path, header),
          path
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

  async _getModifiedFlags(src, clangFlags) {
    const originalFlags = clangFlags.flags; // Look for the project-wide flags

    const projectFlagsDir = await _fsPromise().default.findNearestFile(PROJECT_CLANG_FLAGS_FILE, _nuclideUri().default.dirname(src));

    if (projectFlagsDir == null) {
      return originalFlags;
    }

    const projectFlagsFile = _nuclideUri().default.join(projectFlagsDir, PROJECT_CLANG_FLAGS_FILE);

    const projectFlags = await this._loadProjectCompilerFlags(projectFlagsFile);

    if (projectFlags == null) {
      return originalFlags;
    }

    return originalFlags.filter(flag => projectFlags.ignoredCompilerFlags.indexOf(flag) === -1).concat(projectFlags.extraCompilerFlags);
  }

  async _getDBFlagsAndDirForSrc(src, requestSettings) {
    let dbFlags = null;
    let dbDir = null;
    const compilationDB = requestSettings.compilationDatabase;

    if (compilationDB != null && compilationDB.file != null) {
      const {
        file,
        flagsFile
      } = compilationDB; // Look for a compilation database provided by the client.

      dbDir = _nuclideUri().default.dirname(file);
      dbFlags = await this.loadFlagsFromCompilationDatabase(file, flagsFile);
    } else {
      // Look for a manually provided compilation database.
      dbDir = await _fsPromise().default.findNearestFile(COMPILATION_DATABASE_FILE, _nuclideUri().default.dirname(src));

      if (dbDir != null) {
        const dbFile = _nuclideUri().default.join(dbDir, COMPILATION_DATABASE_FILE);

        dbFlags = await this.loadFlagsFromCompilationDatabase(dbFile, null);
      }
    }

    return {
      dbFlags,
      dbDir
    };
  }

  async _getRelatedSrcFileForHeader(header, dbFlags, projectRoot) {
    const source = await this._relatedFileFinder.getRelatedSourceForHeader(header);

    if (source != null) {
      return source;
    }

    if (dbFlags != null) {
      const sourceFile = this._findSourceFileForHeaderFromCompilationDatabase(header, dbFlags);

      if (sourceFile != null) {
        return sourceFile;
      }
    }

    return projectRoot != null ? this._relatedFileFinder.getRelatedSourceForHeader(header, projectRoot) : null;
  }

  async getRelatedSourceOrHeader(src, requestSettings) {
    const {
      dbFlags,
      dbDir
    } = await this._getDBFlagsAndDirForSrc(src, requestSettings);
    const projectRoot = requestSettings == null ? null : requestSettings.projectRoot;

    if ((0, _utils().isHeaderFile)(src)) {
      return this._getRelatedSrcFileForHeader(src, dbFlags, // flowlint-next-line sketchy-null-string:off
      projectRoot || dbDir);
    }

    return this._relatedFileFinder.getRelatedHeaderForSource(src);
  }

  async _getFlagsForSrcImpl(src, requestSettings) {
    const {
      dbFlags,
      dbDir
    } = await this._getDBFlagsAndDirForSrc(src, requestSettings);

    if (dbFlags != null) {
      const flagsHandle = dbFlags.get(src);

      if (flagsHandle != null) {
        return this._flagPool.getFlags(flagsHandle);
      }
    }

    if ((0, _utils().isHeaderFile)(src)) {
      const sourceFile = await this._getRelatedSrcFileForHeader(src, dbFlags, // flowlint-next-line sketchy-null-string:off
      requestSettings.projectRoot || dbDir);

      if (sourceFile != null) {
        return this._getFlagsForSrcCached(sourceFile, requestSettings);
      }
    }

    const compilationDB = requestSettings.compilationDatabase; // Even if we can't get flags, try to watch the build file in case they get added.

    const buildFile = compilationDB != null && compilationDB.flagsFile != null ? compilationDB.flagsFile : await (0, _utils().guessBuildFile)(src);

    if (buildFile != null) {
      return {
        flags: [],
        flagsFile: buildFile,
        directory: _nuclideUri().default.dirname(src)
      };
    }

    return null;
  }

  async _loadProjectCompilerFlags(flagsFile) {
    let cached = this._clangProjectFlags.get(flagsFile);

    if (cached == null) {
      cached = this._loadProjectCompilerFlagsImpl(flagsFile);

      this._clangProjectFlags.set(flagsFile, cached);
    }

    return cached;
  }

  async _loadProjectCompilerFlagsImpl(flagsFile) {
    let result = null;

    try {
      const contents = await _fsPromise().default.readFile(flagsFile, 'utf8');
      const data = JSON.parse(contents);

      if (!(data instanceof Object)) {
        throw new Error("Invariant violation: \"data instanceof Object\"");
      }

      const {
        extra_compiler_flags,
        ignored_compiler_flags
      } = data;
      const extraCompilerFlags = [];
      const ignoredCompilerFlags = [];

      if (extra_compiler_flags != null) {
        extra_compiler_flags.forEach(flag => extraCompilerFlags.push(flag));
      }

      if (ignored_compiler_flags != null) {
        ignored_compiler_flags.forEach(flag => ignoredCompilerFlags.push(flag));
      }

      result = {
        extraCompilerFlags,
        ignoredCompilerFlags
      };
    } catch (e) {
      logger.error(`Error reading compilation flags from ${flagsFile}`, e);
    }

    return result;
  }

  _assertCompilationDatabaseEntry(entry) {
    if (!(typeof entry.file === 'string' && typeof entry.directory === 'string' && (typeof entry.command === 'string' || Array.isArray(entry.arguments)))) {
      throw new Error('The compilation database entry is invalid and does not comply with the spec.');
    }
  }

  async _processCompilationDatabaseEntry(entry, dbDir, flagsFile, dbFile) {
    this._assertCompilationDatabaseEntry(entry);

    const directory = await _fsPromise().default.realpath( // Relative directories aren't part of the spec, but resolving them
    // relative to the compile_commands.json location seems reasonable.
    this._uriResolveCached(dbDir, entry.directory), this._realpathCache);

    const filename = this._uriResolveCached(directory, entry.file);

    const realpath = await _fsPromise().default.realpath(filename, this._realpathCache);
    const clangFlags = this.sanitizeEntry(entry, flagsFile == null ? dbFile : flagsFile);
    return [realpath, this._flagPool.getHandle(clangFlags)];
  }

  async _loadFlagsFromCompilationDatabase(dbFile, flagsFile) {
    const flags = new Map();

    const dbDir = _nuclideUri().default.dirname(dbFile); // Factor out the common arguments to _processCompilationDatabaseEntry.


    const processEntry = entry => this._processCompilationDatabaseEntry(entry, dbDir, flagsFile, dbFile);

    const processedEntries = await (0, _clangFlagsReader().readCompilationFlags)(dbFile).flatMap(processEntry).toArray().toPromise().catch(error => {
      logger.error(`Saw error loading ${dbFile}, falling back to JSON.parse.`, error);
      return (0, _clangFlagsReader().fallbackReadCompilationFlags)(dbFile).then(entries => Promise.all(entries.map(entry => processEntry(entry))));
    }).catch(error => {
      logger.error(`Fallback parser for ${dbFile} encountered error too`, error);
      return [];
    });

    for (const [realpath, clangFlagsHandle] of processedEntries) {
      flags.set(realpath, clangFlagsHandle);
    }

    this._flagPool.trackStats();

    this._uriResolveCache.clear();

    return flags;
  }

  loadFlagsFromCompilationDatabase(dbFile, flagsFile) {
    return this._compilationDatabases.getOrCreate(dbFile, () => this._loadFlagsFromCompilationDatabase(dbFile, flagsFile) || Promise.resolve(new Map()));
  }

  _uriResolveCached(parent, relative) {
    return this._uriResolveCache.getOrCreate([parent, relative], () => _nuclideUri().default.resolve(parent, relative));
  }

  sanitizeEntry(entry, flagsFile) {
    const {
      directory,
      file
    } = entry;

    const ext = _nuclideUri().default.extname(file); // Nullthrows is safe because of _assertCompilationDatabaseEntry.


    let args = entry.arguments !== undefined ? entry.arguments : (0, _string().shellParse)((0, _nullthrows().default)(entry.command)); // We exclude the path to the file to compile from the compilation database
    // generated by Buck. It must be removed from the list of command-line
    // arguments passed to libclang.

    const normalizedSourceFile = _nuclideUri().default.normalize(file);

    args = args.filter(arg => normalizedSourceFile !== arg && (!arg.endsWith(ext) || normalizedSourceFile !== this._uriResolveCached(directory, arg))); // Add the -x flag if it does not exist.

    if (!args.find(arg => arg === '-x')) {
      const xFlag = ClangFlagsManager._getXFlagForSourceFile(file);

      args.push('-x', xFlag);
    } // Resolve relative path arguments against the Buck project root.


    args = (0, _clangFlagsParser().mapPathsInFlags)(args, path_ => {
      let path = overrideIncludePath(path_);

      if (!_nuclideUri().default.isAbsolute(path)) {
        path = _nuclideUri().default.join(directory, path);
      }

      return path;
    });
    const skipArgs = ['-o', '-MF']; // If an output file is specified, remove that argument.

    skipArgs.forEach(arg => {
      const index = args.indexOf(arg);

      if (index !== -1) {
        args.splice(index, 2);
      }
    });
    return {
      directory,
      flagsFile,
      flags: args
    };
  }

  static _getXFlagForSourceFile(sourceFile) {
    const ext = _nuclideUri().default.extname(sourceFile);

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

}

exports.default = ClangFlagsManager;