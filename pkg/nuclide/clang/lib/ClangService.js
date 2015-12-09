'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

const {checkOutput, fsPromise, safeSpawn} = require('../../commons');
const logger = require('../../logging').getLogger();
const path = require('path');
const split = require('split');
const {EventEmitter} = require('events');
const ClangFlagsManager = require('./ClangFlagsManager');

import {BuckUtils} from '../../buck/base/lib/BuckUtils';

const {keyMirror} = require('../../commons').object;

// Maps clang's cursor types to the actual declaration types: for a full list see
// https://github.com/llvm-mirror/clang/blob/master/include/clang/Basic/DeclNodes.td
//
// Keep in sync with the clang Python binding (../fb/lib/python/clang/cindex.py)
// The order of the keys matches the ordering in cindex.py.
export const ClangCursorToDeclarationTypes = {
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
};

// TODO: Support enums in rpc3 framework.
// export type ClangCursorType = $Enum<typeof ClangCursorToDeclarationTypes>;
export type ClangCursorType = string;

export type ClangCursorExtent = {
  start: {line: number; column: number};
  end: {line: number; column: number};
};

export type ClangCompileResult = {
  diagnostics: Array<{
    spelling: string;
    severity: number;
    location: {
      column: number;
      file: NuclideUri;
      line: number;
    };
    ranges: any;
  }>
};

export type ClangCompletion = {
  chunks: Array<{spelling: string, isPlaceHolder: boolean}>,
  first_token?: ?string,
  result_type?: string,
  spelling?: string,
};

export type ClangCompletionsResult = {
  file: string,
  completions: Array<ClangCompletion>,
  line: number,
  column: number,
  prefix: string,
};

export type ClangDeclarationResult = {
  file: NuclideUri;
  line: number;
  column: number;
  spelling: ?string;
  extent: ClangCursorExtent;
};

export type ClangDeclaration = {
  name: string,
  type: ClangCursorType,
  cursor_usr: ?string,
  file: ?NuclideUri,
};

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
export type ClangDeclarationInfoResult = {
  src: NuclideUri,
  line: number,
  column: number,
  info?: Array<ClangDeclaration>,
};

export const ClangCursorTypes: {[key: ClangCursorType]: ClangCursorType} =
  keyMirror(ClangCursorToDeclarationTypes);

async function _findClangServerArgs(): Promise<{
  libClangLibraryFile: ?string;
  pythonExecutable: string;
  pythonPathEnv: ?string;
}> {
  let findClangServerArgs;
  try {
    findClangServerArgs = require('./fb/find-clang-server-args');
  } catch (e) {
    // Ignore.
  }

  let libClangLibraryFile;
  if (process.platform === 'darwin') {
    const result = await checkOutput('xcode-select', ['--print-path']);
    if (result.exitCode === 0) {
      libClangLibraryFile = result.stdout.trim() +
        '/Toolchains/XcodeDefault.xctoolchain/usr/lib/libclang.dylib';
    }
  }

  const clangServerArgs = {
    libClangLibraryFile,
    pythonExecutable: 'python',
    pythonPathEnv: path.join(__dirname, '../pythonpath'),
  };
  if (typeof findClangServerArgs === 'function') {
    const clangServerArgsOverrides = await findClangServerArgs();
    return {...clangServerArgs, ...clangServerArgsOverrides};
  } else {
    return clangServerArgs;
  }
}

type Connection = {
  readableStream: any,
  writableStream: any,
}

async function createAsyncConnection(pathToLibClangServer: string): Promise<Connection> {
  return await new Promise(async (resolve, reject) => {
    const {libClangLibraryFile, pythonPathEnv, pythonExecutable} = await _findClangServerArgs();
    const options = {
      cwd: path.dirname(pathToLibClangServer),
      // The process should use its ordinary stderr for errors.
      stdio: ['pipe', null, 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
      env: {
        // On Mac OSX El Capitan, bash seems to wipe out the `LD_LIBRARY_PATH` and
        // `DYLD_LIBRARY_PATH` environment letiables. So, set this env let which is read by
        // clang_server.py to explicitly set the file path to load.
        LIB_CLANG_LIBRARY_FILE: libClangLibraryFile,
        PYTHONPATH: pythonPathEnv,
      },
    };

    // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
    // options.env is undefined (which is not the case here). This will only be an issue if the
    // system cannot find `pythonExecutable`.
    const child = await safeSpawn(pythonExecutable, /* args */ [pathToLibClangServer], options);
    child.on('close', function(exitCode) {
      logger.error('%s exited with code %s', pathToLibClangServer, exitCode);
    });
    child.stderr.on('data', function(error) {
      if (error instanceof Buffer) {
        error = error.toString('utf8');
      }
      logger.error('Error receiving data', error);
    });
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const writableStream = child.stdio[3];

    // Make sure the bidirectional communication channel is set up before
    // resolving this Promise.
    child.stdout.once('data', function(data: Buffer) {
      if (data.toString() === 'ack\n') {
        const result = {
          readableStream: child.stdout,
          writableStream: writableStream,
        };
        resolve(result);
      } else {
        reject(data);
      }
    });
    writableStream.write('init\n');
  });
}

let asyncConnection: ?Promise<void> = null;
const clangFlagsManager: ClangFlagsManager = new ClangFlagsManager(new BuckUtils());
let readableStream: ?stream$Readable = null;
let writableStream: ?stream$Writable = null;
let nextRequestId: number = 1;
const pathToLibClangServer: string = path.join(__dirname, '../python/clang_server.py');
const emitter: EventEmitter = new EventEmitter();

function connect(): Promise<void> {
  if (asyncConnection == null) {
    asyncConnection = createAsyncConnection(pathToLibClangServer).then(
      (connection: Connection) => {
        readableStream = connection.readableStream;
        writableStream = connection.writableStream;
        readableStream.pipe(split(JSON.parse)).on('data', (response) => {
          const id = response['reqid'];
          emitter.emit(id, response);
        });
      },
      error => {
        // If an error occurs, clear out `asyncConnection`, so that if `_connect()` is
        // called again, we make a new attempt to create a connection,
        // rather than holding onto a rejected Promise indefinitely.
        asyncConnection = null;
      }
    );
  }
  asyncConnection = asyncConnection;
  return asyncConnection;
}

async function _makeRequest(request: Object): Promise {
  await connect();

  const id = request['reqid'] = _getNextRequestId();
  const logData = JSON.stringify(request, (key, value) => {
    // File contents are too large and clutter up the logs, so exclude them.
    if (key === 'contents') {
      return undefined;
    } else {
      return value;
    }
  });
  logger.debug('LibClang request: ' + logData);
  if (writableStream == null) {
    return;
  }
  // Because Node uses an event-loop, we do not have to worry about a call to
  // write() coming in from another thread between our two calls here.
  writableStream.write(JSON.stringify(request));
  writableStream.write('\n');

  return new Promise((resolve, reject) => {
    emitter.once(id, (response) => {
      logger.debug('LibClang response: ' + JSON.stringify(response));
      const isError = 'error' in response;
      if (isError) {
        logger.error('error received from clang_server.py for request:\n%o\nError:%s',
          logData,
          response['error']);
      }
      (isError ? reject : resolve)(response);
    });
  });
}

function _getNextRequestId(): string {
  return (nextRequestId++).toString(16);
}

export async function compile(
  src: NuclideUri,
  contents: string
): Promise<ClangCompileResult> {
  const flags = await clangFlagsManager.getFlagsForSrc(src);
  return _makeRequest({
    method: 'compile',
    src,
    contents,
    flags,
  });
}

export async function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  tokenStartColumn: number,
  prefix: string,
): Promise<ClangCompletionsResult> {
  const flags = await clangFlagsManager.getFlagsForSrc(src);
  return _makeRequest({
    method: 'get_completions',
    src,
    contents,
    line,
    column,
    tokenStartColumn,
    prefix,
    flags,
  });
}

/**
 * @return An Object with the following fields:
 *   file: NuclideUri of the source file where the declaration is.
 *   line: The line number of the declaration within `file`.
 *   column: The column number of the declaration within `file`.
 *   spelling: The spelling of the entity.
 */
export async function getDeclaration(src: NuclideUri, contents: string, line: number, column: number
): Promise<?ClangDeclarationResult> {
  const flags = await clangFlagsManager.getFlagsForSrc(src);
  const data = await _makeRequest({
    method: 'get_declaration',
    src,
    contents,
    line,
    column,
    flags,
  });

  const {locationAndSpelling} = data;

  if (!locationAndSpelling) {
    return null;
  }

  const state = await fsPromise.lstat(locationAndSpelling.file);
  if (state.isSymbolicLink()) {
    locationAndSpelling.file = await fsPromise.readlink(locationAndSpelling.file);
  }

  return locationAndSpelling;
}

export async function getDeclarationInfo(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number
): Promise<ClangDeclarationInfoResult> {
  const flags = await clangFlagsManager.getFlagsForSrc(src);
  return _makeRequest({
    method: 'get_declaration_info',
    src,
    contents,
    line,
    column,
    flags,
  });
}
