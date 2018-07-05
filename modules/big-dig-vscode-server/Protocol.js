/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

// TODO(T27539544): This is really bad as we are using "string" throughout, even
// when we mean "bytes", which could butcher binary data. I think we can get
// away with it for now, but we need a proper solution for this. Apparently
// Nuclide-RPC base64 encodes fields of type "Buffer" over the wire, but that's
// not great from an efficiency perspective.
/**
 * To avoid a dependency just for this one value, this is a type instead.
 * Usage example:
 *
 *   const BUFFER_ENCODING: BufferEncoding = 'utf-8';
 */
export type BufferEncoding = 'utf-8';

export type SpawnResponse = {kind: 'spawn', pid: number, isTty: boolean};
type StdoutResponse = {kind: 'stdout', data: string};
type StderrResponse = {kind: 'stderr', data: string};
type StdoutEndResponse = {kind: 'stdout-end'};
type StderrEndResponse = {kind: 'stderr-end'};
type StdinErrorResponse = {kind: 'stdin-error', message: string};
type ErrorResponse = {kind: 'error', message: string};
type CloseResponse = {kind: 'close'};
type ExitResponse = {kind: 'exit', code?: number, signal?: string | number};

export type ExecResponse =
  | SpawnResponse
  | StdoutResponse
  | StderrResponse
  | StdoutEndResponse
  | StderrEndResponse
  | StdinErrorResponse
  | ErrorResponse
  | CloseResponse
  | ExitResponse;

/** Position in a text document. The first character is at line 0, column 0. */
export type Position = {
  line: number,
  column: number,
};

/** Range of text in a document. */
export type Range = {
  start: Position,
  end: Position,
};

/**
 * Create a remote process.
 */
export type ExecSpawnParams = {
  /** The command to run. */
  cmd: string,
  /** Arguments passed to the command. */
  args: Array<string>,
  /** Current working directory. */
  cwd?: string,
  /**
   * If true, the the process will inherit the environment variables of this server.
   */
  inheritEnv?: boolean,
  /**
   * See `child_process.spawn`. If true, then use the system's default shell. A different shell may
   * be specified by a string. If false, the process won't be run in a shell.
   */
  shell?: string | boolean,
  /** Key-value map for environment variables. */
  env: Object,
  /**
   * If true, attempt to create a tty process. Otherwise, the process will be connected via plain
   * pipes. Tty support allows use of escape sequences to change the color, curosr position, window
   * size, etc. Tty is not compatible with binary communication; e.g. language server providers. */
  usePty?: boolean,
  /**
   * Make the server's bin path available in the process' environment. I.e. this makes the `code`
   * script available to processes. (default false)
   */
  addBigDigToPath?: boolean,
};
/** The first message will be a `SpawnResponse` */
export type ExecSpawnData = ExecResponse;

export type ExecStdinParams = {
  pid: number,
  data: string,
};
export type ExecStdinResult = {};

export type ExecObserveParams = {
  pid: number,
};
export type ExecObserveData = ExecResponse;

export type ExecKillParams = {
  pid: number,
  signal: string,
};
export type ExecKillResult = {};

export type ExecResizeParams = {
  pid: number,
  columns: number,
  rows: number,
};
export type ExecResizeResult = {};

export type FsGetFileContentsParams = {
  path: string,
};
export type FsGetFileContentsResult = {
  contents: string,
};

export type FsStatParams = {
  path: string,
};
export type FsStatResult = {
  /** Access timestamp in milliseconds since the POSIX Epoch. */
  atime: number,
  /** Modified timestamp in milliseconds since the POSIX Epoch. */
  mtime: number,
  /** Creation timestamp in milliseconds since the POSIX Epoch. */
  ctime: number,
  size: number,
  mode: number,
  isFile?: boolean,
  isDirectory?: boolean,
  isSymlink?: boolean,
};

export type FsReadParams = {
  path: string,
  offset: number,
  length: number,
};
export type FsReadData = string;

export type FsWriteParams = {
  path: string,
  content: string,
  create: boolean,
  overwrite: boolean,
};
export type FsWriteResult = {};

export type FsMoveParams = {
  source: string,
  destination: string,
  overwrite: boolean,
};
export type FsMoveResult = {};

export type FsCopyParams = {
  source: string,
  destination: string,
  overwrite: boolean,
};
export type FsCopyResult = {};

export type FsMkdirParams = {
  path: string,
};
export type FsMkdirResult = {};

export type FsReaddirParams = {
  path: string,
};
export type FsReaddirResult = Array<[string, FsStatResult]>;

export type FsDeleteParams = {
  path: string,
  recursive: boolean,
};
export type FsDeleteResult = {};

export type FsWatchParams = {
  path: string,
  /** If false, then only watch files immediately within the given path. */
  recursive: boolean,
  /** List of paths/files to exclude from watching. */
  exclude: Array<string>,
};
export type FsWatchEntry = {
  /** The path of the file (relative to the watched path) */
  path: string,
  /** Types of change: updated, added, deleted */
  type: 'u' | 'a' | 'd',
};
export type FsWatchData = Array<FsWatchEntry>;

export type SearchForFilesParams = {
  directory: string,
  query: string,
};
export type SearchForFilesResult = {
  results: Array<string>,
};

/** Specifies a path to search from recursively. */
export type SearchBase = {
  /** Directory to search (absolute path). */
  path: string,
  /** Glob patterns of files to exclude from the search. */
  excludes: Array<string>,
  /** Glob patterns of files to include in the search. */
  includes: Array<string>,
};

export type SearchForTextQueryOptions = {
  isRegExp: boolean,
  isCaseSensitive: boolean,
  isWordMatch: boolean,
};

/**
 * Search for the query text within files of each base path. Results are merged
 * together in arbitrary order.
 */
export type SearchForTextParams = {
  /** The text to search for. It is a regular expression if `isRegExp` is set. */
  query: string,
  /** A list of base-paths to recursively search within. */
  basePaths: Array<SearchBase>,
  options: SearchForTextQueryOptions,
};

export type SearchForTextDatum = {|
  path: string,
  range: Range,
  preview: {
    leading: string,
    matching: string,
    trailing: string,
  },
|};

/** A chunk of results; there is no ordering guarantee. */
export type SearchForTextData = Array<SearchForTextDatum>;

/**
 * For remote ssh sessions, we provide a remote command to edit files. E.g. `code ...files`. This
 * message passes the list of files back to the local vscode for editing.
 */
export type CliListenParams = {session: string};
export type CliListenData = {
  cwd: string,
  /**
   * A list of files for the client to edit.
   */
  files: Array<string>,
};

export type ServerShutdownParams = {};
export type ServerShutdownResult = {};
export type ServerGetStatusParams = {};
export type ServerGetStatusResult = {
  /** The version reported in package.json of the server. */
  version: string,
  /** Result of `process.platform`. */
  platform: string,
  /** Result of `process.pid`. */
  pid: number,
  /** Result of `process.uptime`. */
  uptime: number,
  /** Result of `process.memoryUsage()`. */
  memoryUsage: {
    rss: number,
    heapTotal: number,
    heapUsed: number,
    external: number,
  },
};

/**
 * List the LSPs available for the specified directory. These will be based on
 * what is listed in the nearest .bigdig.toml file when looking upwards from
 * `directory`.
 */
export type LspListParams = {
  directory: string,
};

/**
 * At a minimum, this should have all of the information needed to launch the
 * LSP on the server. We would also like to have the ability to provide enough
 * information so that the Big Dig server can install any tools necessary for
 * the LSP, as well as any tools necessary on the client, such as recommended
 * grammars/extensions for the user's local editor.
 */
export type LspConfig = {
  /**
   * A list of strings whose values (must/should?) be taken from this list of
   * "known language identifiers":
   * https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
   */
  language: Array<string>,
  command: string,
  args: Array<string>,
  cwd: string,
  rootPath?: string,
  // TODO(mbolin): Recommended grammars/extensions/tools, though those will have
  // to be keyed by editor.
};

/**
 * If a .bigdig.toml file is found, then it will be returned as the value of
 * `configFile` and the list of LSP configs therein will be returned as the
 * `lspConfigs` array. If no such file is found, then `configFile` will be
 * `null` and `lspConfigs` will be an empty array.
 */
export type LspListResult = {
  configFile: ?string,
  lspConfigs: {[name: string]: LspConfig},
};

export type DebuggerListParams = {
  directory: string,
};

export type DebuggerConfig = {
  language: Array<string>,
  command: string,
  args: Array<string>,
  cwd: string,
  request: 'attach' | 'launch',
  // TODO(mbolin): Recommended grammars/extensions/tools, though those will have
  // to be keyed by editor. For VS Code, ideally there is a specific extension
  // for the debugger that declares the appropriate "breakpoints" and
  // "debuggers" in its package.json. Currently, we declare these in the
  // package.json for the Big Dig extension, which is not the right place.
};

export type DebuggerListResult = {
  configFile: ?string,
  debuggerConfigs: {[name: string]: DebuggerConfig},
};

/** Query whether the specified directory is part of an Hg repo. */
export type HgIsRepoParams = {
  directory: string,
};

/** The root of the Hg repo, if it exists. */
export type HgIsRepoResult = {
  root: ?string,
};

export type HgObserveStatusParams = {
  root: string,
};

/** We omit 'C' and 'I' for now. */
export type HgStatusCode = 'M' | 'A' | 'R' | '!' | '?';

/**
 * The current value of `hg status`. Note this currently excludes copy/move
 * information.
 */
export type HgObserveStatusData = {
  status: {[relativePath: string]: HgStatusCode},
};

export type HgGetContentsParams = {
  path: string,
  ref: string,
};

export type HgGetContentsResult = {
  contents: string,
};
