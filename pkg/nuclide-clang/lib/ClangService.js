'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {checkOutput, object, promises} from '../../nuclide-commons';
import {BuckUtils} from '../../nuclide-buck-base/lib/BuckUtils';
import LRUCache from 'lru-cache';
import os from 'os';
import {Observable} from 'rxjs';
import ClangFlagsManager from './ClangFlagsManager';
import ClangServer from './ClangServer';

const clangFlagsManager = new ClangFlagsManager(new BuckUtils());

// Limit the number of active Clang servers.
const clangServers = new LRUCache({
  max: 10,
  dispose(key: NuclideUri, val: ClangServer) {
    val.dispose();
  },
});

// Limit the total memory usage of all Clang servers.
const MEMORY_LIMIT = Math.round(os.totalmem() * 15 / 100);

// It's important that only one instance of this function runs at any time.
const checkMemoryUsage = promises.serializeAsyncCall(async () => {
  const usage = new Map();
  await Promise.all(clangServers.values().map(async server => {
    const mem = await server.getMemoryUsage();
    usage.set(server, mem);
  }));

  // Servers may have been deleted in the meantime, so calculate the total now.
  let total = 0;
  let count = 0;
  clangServers.forEach(server => {
    const mem = usage.get(server);
    if (mem) {
      total += mem;
      count++;
    }
  });

  // Remove servers until we're under the memory limit.
  // Make sure we allow at least one server to stay alive.
  if (count > 1 && total > MEMORY_LIMIT) {
    const toDispose = [];
    clangServers.rforEach((server, key) => {
      const mem = usage.get(server);
      if (mem && count > 1 && total > MEMORY_LIMIT) {
        total -= mem;
        count--;
        toDispose.push(key);
      }
    });
    toDispose.forEach(key => clangServers.del(key));
  }
});

/**
 * Spawn one Clang server per translation unit (i.e. source file).
 * This allows working on multiple files at once, and simplifies per-file state handling.
 */
function getClangServer(
  src: NuclideUri,
  contents?: string,
  defaultFlags?: ?Array<string>,
): ClangServer {
  let server = clangServers.get(src);
  if (server != null) {
    return server;
  }
  server = new ClangServer(clangFlagsManager, src);
  // Seed with a compile request to ensure fast responses.
  if (contents != null) {
    server.makeRequest('compile', defaultFlags, {contents})
      .then(checkMemoryUsage);
  }
  clangServers.set(src, server);
  return server;
}

// Maps clang's cursor types to the actual declaration types: for a full list see
// https://github.com/llvm-mirror/clang/blob/master/include/clang/Basic/DeclNodes.td
//
// Keep in sync with the clang Python binding (../fb/lib/python/clang/cindex.py)
// The order of the keys matches the ordering in cindex.py.
export const ClangCursorToDeclarationTypes = Object.freeze({
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
  MACRO_DEFINITION: 'Macro',
});

// TODO: Support enums in rpc3 framework.
// export type ClangCursorType = $Enum<typeof ClangCursorToDeclarationTypes>;
export type ClangCursorType = string;

export type ClangCursorExtent = {
  start: {line: number; column: number};
  end: {line: number; column: number};
};

export type ClangLocation = {
  column: number;
  file: ?NuclideUri;
  line: number;
};

export type ClangSourceRange = {
  file: NuclideUri;
  start: {line: number; column: number};
  end: {line: number; column: number};
};

export type ClangCompileResult = {
  diagnostics: Array<{
    spelling: string;
    severity: number;
    location: ClangLocation;
    ranges: ?Array<ClangSourceRange>;
    fixits?: Array<{
      range: ClangSourceRange;
      value: string;
    }>;
    // Diagnostics often have children. This happens for errors like bad function args.
    // Clang emits one diagnostic saying "matching invocation of function f not found"
    // with one or more child diagnostics listing the reasons.
    // (e.g. mismatched types, wrong number of arguments)
    //
    // These technically contain all the fields listed above, but we don't really have a good
    // use for them so they are omitted.
    // In theory, these can also have child diagnostics! Unclear if this ever occurs in practice.
    children?: Array<{
      spelling: string;
      location: ClangLocation;
      ranges: Array<ClangSourceRange>;
    }>;
  }>;
  // If defaultFlags was provided and used, this will be set to true.
  // `diagnostics` is likely to be inaccurate if this was the case.
  accurateFlags: boolean;
};

export type ClangCompletion = {
  chunks: Array<{
    spelling: string;
    isPlaceHolder: boolean;
    kind?: string;
  }>;
  result_type: string;
  spelling: string;
  cursor_kind: string;
  brief_comment: ?string;
};

export type ClangCompletionsResult = {
  completions: Array<ClangCompletion>;
  line: number;
  column: number;
  prefix: string;
};

export type ClangDeclarationResult = {
  file: NuclideUri;
  line: number;
  column: number;
  spelling: ?string;
  type: ?string;
  extent: ClangCursorExtent;
};

export type ClangDeclaration = {
  name: string;
  type: ClangCursorType;
  cursor_usr: ?string;
  file: ?NuclideUri;
};

export type ClangOutlineTree = {
  name: string;
  extent: ClangCursorExtent;
  cursor_kind: ClangCursorType;
  // Will be non-null for variables/typedefs only.
  cursor_type?: string;
  // Will be non-null for functions and methods only.
  // Contains a list of the names of parameters.
  params?: Array<string>;
  // List of template parameters (functions/methods only).
  tparams?: Array<string>;
  // Will be non-null for class-like containers only.
  children?: Array<ClangOutlineTree>;
};

export type ClangOutline = {
  outline: Array<ClangOutlineTree>;
};

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
export type ClangDeclarationInfoResult = {
  line: number;
  column: number;
  info?: Array<ClangDeclaration>;
};

export const ClangCursorTypes = object.keyMirror(ClangCursorToDeclarationTypes);

/**
 * Compiles the specified source file (automatically determining the correct compilation flags).
 * It currently returns an Observable just to circumvent the 60s service timeout for Promises.
 * TODO(9519963): Stream back more detailed compile status message.
 *
 * If `clean` is provided, any existing Clang server for the file is restarted.
 */
export function compile(
  src: NuclideUri,
  contents: string,
  clean: boolean,
  defaultFlags?: Array<string>,
): Observable<?ClangCompileResult> {
  const server = clangServers.get(src);
  // A restart is also required when compilation flags have changed.
  if (server != null && (clean || server.getFlagsChanged())) {
    reset(src);
  }

  return Observable.fromPromise(
    getClangServer(src)
      .makeRequest('compile', defaultFlags, {contents})
      .then(value => {
        // Trigger the memory usage check but do not wait for it.
        checkMemoryUsage();
        return value;
      })
  );
}

export function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  tokenStartColumn: number,
  prefix: string,
  defaultFlags?: Array<string>,
): Promise<?ClangCompletionsResult> {
  return getClangServer(src, contents, defaultFlags).makeRequest('get_completions', defaultFlags, {
    contents,
    line,
    column,
    tokenStartColumn,
    prefix,
  });
}

export async function getDeclaration(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags?: Array<string>,
): Promise<?ClangDeclarationResult> {
  const result = await getClangServer(src, contents, defaultFlags)
    .makeRequest('get_declaration', defaultFlags, {
      contents,
      line,
      column,
    });
  if (result == null) {
    return null;
  }
  return result.locationAndSpelling;
}

export function getDeclarationInfo(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags: ?Array<string>,
): Promise<?ClangDeclarationInfoResult> {
  return getClangServer(src, contents, defaultFlags)
    .makeRequest('get_declaration_info', defaultFlags, {
      contents,
      line,
      column,
    });
}

export async function getOutline(
  src: NuclideUri,
  contents: string,
  defaultFlags: ?Array<string>,
): Promise<?ClangOutline> {
  return getClangServer(src, contents, defaultFlags)
    .makeRequest('get_outline', defaultFlags, {contents}, /* blocking */ true);
}

export async function formatCode(
  src: NuclideUri,
  contents: string,
  cursor: number,
  offset?: number,
  length?: number,
): Promise<{newCursor: number; formatted: string}> {
  const args = [
    '-style=file',
    `-assume-filename=${src}`,
    `-cursor=${cursor}`,
  ];
  if (offset != null) {
    args.push(`-offset=${offset}`);
  }
  if (length != null) {
    args.push(`-length=${length}`);
  }
  const {stdout} = await checkOutput('clang-format', args, {stdin: contents});

  // The first line is a JSON blob indicating the new cursor position.
  const newLine = stdout.indexOf('\n');
  return {
    newCursor: JSON.parse(stdout.substring(0, newLine)).Cursor,
    formatted: stdout.substring(newLine + 1),
  };
}

/**
 * Kill the Clang server for a particular source file,
 * as well as all the cached compilation flags.
 */
export function reset(src: NuclideUri): void {
  clangServers.del(src);
  clangFlagsManager.reset();
}

export function dispose(): void {
  clangServers.reset();
}
