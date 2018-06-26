'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClangCursorTypes = exports.ClangCursorToDeclarationTypes = undefined;
exports.compile = compile;
exports.getCompletions = getCompletions;
exports.getDeclaration = getDeclaration;
exports.getDeclarationInfo = getDeclarationInfo;
exports.getRelatedSourceOrHeader = getRelatedSourceOrHeader;
exports.getOutline = getOutline;
exports.getLocalReferences = getLocalReferences;
exports.formatCode = formatCode;
exports.loadFilesFromCompilationDatabaseAndCacheThem = loadFilesFromCompilationDatabaseAndCacheThem;
exports.loadFlagsFromCompilationDatabaseAndCacheThem = loadFlagsFromCompilationDatabaseAndCacheThem;
exports.resetForSource = resetForSource;
exports.reset = reset;
exports.dispose = dispose;
exports.setMemoryLimit = setMemoryLimit;

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _ClangServerManager;

function _load_ClangServerManager() {
  return _ClangServerManager = _interopRequireDefault(require('./ClangServerManager'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
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

const serverManager = new (_ClangServerManager || _load_ClangServerManager()).default();

// Maps clang's cursor types to the actual declaration types: for a full list see
// https://github.com/llvm-mirror/clang/blob/master/include/clang/Basic/DeclNodes.td
//
// Keep in sync with the clang Python binding (../fb/lib/python/clang/cindex.py)
// The order of the keys matches the ordering in cindex.py.
const ClangCursorToDeclarationTypes = exports.ClangCursorToDeclarationTypes = Object.freeze({
  UNEXPOSED_DECL: '',
  STRUCT_DECL: 'Record',
  UNION_DECL: 'Record',
  CLASS_DECL: 'CXXRecord',
  ENUM_DECL: 'Enum',
  FIELD_DECL: 'Field',
  ENUM_CONSTANT_DECL: 'EnumConstant',
  FUNCTION_DECL: 'Function',
  VAR_DECL: 'Var',
  PARM_DECL: 'ParmVar',
  OBJC_INTERFACE_DECL: 'ObjCInterface',
  OBJC_CATEGORY_DECL: 'ObjCCategory',
  OBJC_PROTOCOL_DECL: 'ObjCProtocol',
  OBJC_PROPERTY_DECL: 'ObjCProperty',
  OBJC_IVAR_DECL: 'ObjCIVar',
  OBJC_INSTANCE_METHOD_DECL: 'ObjCMethod',
  OBJC_CLASS_METHOD_DECL: 'ObjCMethod',
  OBJC_IMPLEMENTATION_DECL: 'ObjCImplementation',
  OBJC_CATEGORY_IMPL_DECL: 'ObjCCategoryImpl',
  TYPEDEF_DECL: 'Typedef',
  CXX_METHOD: 'CXXMethod',
  NAMESPACE: 'Namespace',
  LINKAGE_SPEC: 'LinkageSpec',
  CONSTRUCTOR: 'CXXConstructor',
  DESTRUCTOR: 'CXXDestructor',
  CONVERSION_FUNCTION: 'CXXConversion',
  TEMPLATE_TYPE_PARAMETER: 'TemplateTypeParm',
  TEMPLATE_NON_TYPE_PARAMETER: 'NonTypeTemplateParm',
  TEMPLATE_TEMPLATE_PARAMETER: 'TemplateTemplateParm',
  FUNCTION_TEMPLATE: 'FunctionTemplate',
  CLASS_TEMPLATE: 'ClassTemplate',
  CLASS_TEMPLATE_PARTIAL_SPECIALIZATION: 'ClassTemplatePartialSpecialization',
  NAMESPACE_ALIAS: 'NamespaceAlias',
  USING_DIRECTIVE: 'UsingDirective',
  USING_DECLARATION: 'Using',
  TYPE_ALIAS_DECL: 'TypeAlias',
  OBJC_SYNTHESIZE_DECL: 'ObjCSynthesize',
  OBJC_DYNAMIC_DECL: 'ObjCDynamic',
  CXX_ACCESS_SPEC_DECL: 'AccessSpec',
  OVERLOAD_CANDIDATE: 'Function',
  MACRO_DEFINITION: 'Macro'
});

const ClangCursorTypes = exports.ClangCursorTypes = (0, (_collection || _load_collection()).keyMirror)(ClangCursorToDeclarationTypes);

async function getClangService(src, contents, requestSettings, defaultSettings, blocking) {
  const server = serverManager.getClangServer(src, contents, requestSettings, defaultSettings);
  if (!server.isReady()) {
    if (blocking) {
      await server.waitForReady();
    } else {
      return null;
    }
  }
  // It's possible that the server got disposed while waiting.
  if (server.isDisposed()) {
    return null;
  }
  return server.getService();
}

/**
 * Compiles the specified source file (automatically determining the correct compilation flags).
 * It currently returns an Observable just to circumvent the 60s service timeout for Promises.
 * TODO(9519963): Stream back more detailed compile status message.
 */
function compile(src, contents, requestSettings, defaultSettings) {
  const doCompile = async () => {
    // Note: restarts the server if the flags changed.
    const server = serverManager.getClangServer(src, contents, requestSettings, defaultSettings, true);
    if (!server.isDisposed()) {
      return server.compile(contents);
    }
  };
  return _rxjsBundlesRxMinJs.Observable.fromPromise(doCompile()).publish();
}

async function getCompletions(src, contents, line, column, tokenStartColumn, prefix, requestSettings, defaultSettings) {
  const service = await getClangService(src, contents, requestSettings, defaultSettings);
  if (service != null) {
    return service.get_completions(contents, line, column, tokenStartColumn, prefix);
  }
}

async function getDeclaration(src, contents, line, column, requestSettings, defaultSettings) {
  const service = await getClangService(src, contents, requestSettings, defaultSettings);
  if (service != null) {
    return service.get_declaration(contents, line, column);
  }
}

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
async function getDeclarationInfo(src, contents, line, column, requestSettings, defaultSettings) {
  const service = await getClangService(src, contents, requestSettings, defaultSettings);
  if (service != null) {
    return service.get_declaration_info(contents, line, column);
  }
}

async function getRelatedSourceOrHeader(src, requestSettings) {
  return serverManager.getClangFlagsManager().getRelatedSourceOrHeader(src, requestSettings || { compilationDatabase: null, projectRoot: null });
}

async function getOutline(src, contents, requestSettings, defaultSettings) {
  const service = await getClangService(src, contents, requestSettings, defaultSettings, true);
  if (service != null) {
    return service.get_outline(contents);
  }
}

async function getLocalReferences(src, contents, line, column, requestSettings, defaultSettings) {
  const service = await getClangService(src, contents, requestSettings, defaultSettings, true);
  if (service != null) {
    return service.get_local_references(contents, line, column);
  }
}

async function formatCode(src, contents, cursor, offset, length) {
  const args = ['-style=file', `-assume-filename=${src}`, `-cursor=${cursor}`];
  if (offset != null) {
    args.push(`-offset=${offset}`);
  }
  if (length != null) {
    args.push(`-length=${length}`);
  }
  const binary = await getArcanistClangFormatBinary(src);
  const command = binary == null ? 'clang-format' : binary;
  const stdout = await (0, (_process || _load_process()).runCommand)(command, args, {
    input: contents
  }).toPromise();

  // The first line is a JSON blob indicating the new cursor position.
  const newLine = stdout.indexOf('\n');
  return {
    newCursor: JSON.parse(stdout.substring(0, newLine)).Cursor,
    formatted: stdout.substring(newLine + 1)
  };
}

async function getArcanistClangFormatBinary(src) {
  try {
    // $FlowFB
    const arcService = require('../../fb-arcanist-rpc/lib/ArcanistService');
    const [arcConfigDirectory, arcConfig] = await Promise.all([arcService.findArcConfigDirectory(src), arcService.readArcConfig(src)]);
    if (arcConfigDirectory == null || arcConfig == null) {
      return null;
    }
    const lintClangFormatBinary = arcConfig['lint.clang-format.binary'];
    if (lintClangFormatBinary == null) {
      return null;
    }
    return (_nuclideUri || _load_nuclideUri()).default.join((await (_fsPromise || _load_fsPromise()).default.realpath(arcConfigDirectory)), lintClangFormatBinary);
  } catch (err) {
    return null;
  }
}

// Read the provided database file, optionally associate it with the provided
// flags file, and return an observable of the filenames it contains.
function loadFilesFromCompilationDatabaseAndCacheThem(dbFile, flagsFile) {
  const flagsManager = serverManager.getClangFlagsManager();
  return _rxjsBundlesRxMinJs.Observable.from(flagsManager.loadFlagsFromCompilationDatabase(dbFile, flagsFile)).flatMap(flagsMap => flagsMap.keys()).publish();
}

// Remark: this isn't really rpc-safe, the big databases can be > 1 GB.
async function loadFlagsFromCompilationDatabaseAndCacheThem(dbFile, flagsFile) {
  const flagsManager = serverManager.getClangFlagsManager();
  const flagHandles = await flagsManager.loadFlagsFromCompilationDatabase(dbFile, flagsFile);
  const compilationFlags = new Map();
  for (const [src, handle] of flagHandles) {
    const flags = flagsManager.getFlags(handle);
    if (flags != null) {
      compilationFlags.set(src, flags);
    }
  }
  return compilationFlags;
}

/**
 * Kill the Clang server for a particular source file,
 * as well as all the cached compilation flags.
 */
function resetForSource(src) {
  serverManager.reset(src);
}

/**
 * Reset all servers
 */
function reset() {
  serverManager.reset();
}

function dispose() {
  serverManager.dispose();
}

function setMemoryLimit(percent) {
  serverManager.setMemoryLimit(percent);
}