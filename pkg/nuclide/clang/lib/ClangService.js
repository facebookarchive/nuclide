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

import {fsPromise, object} from '../../commons';
import {BuckUtils} from '../../buck/base/lib/BuckUtils';
import ClangFlagsManager from './ClangFlagsManager';
import ClangServer from './ClangServer';

const clangFlagsManager = new ClangFlagsManager(new BuckUtils());
const clangServers: Map<NuclideUri, ClangServer> = new Map();

/**
 * Spawn one Clang server per translation unit (i.e. source file).
 * This allows working on multiple files at once, and simplifies per-file state handling.
 *
 * TODO(hansonw): Implement some sort of cleanup mechanism to kill idle servers.
 */
function getClangServer(src: NuclideUri): ClangServer {
  let server = clangServers.get(src);
  if (server != null) {
    return server;
  }
  server = new ClangServer(clangFlagsManager, src);
  clangServers.set(src, server);
  return server;
}

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
  cursor_kind?: string,
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
  object.keyMirror(ClangCursorToDeclarationTypes);

export function compile(
  src: NuclideUri,
  contents: string
): Promise<?ClangCompileResult> {
  return getClangServer(src).makeRequest('compile', {contents});
}

export function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  tokenStartColumn: number,
  prefix: string,
): Promise<?ClangCompletionsResult> {
  return getClangServer(src).makeRequest('get_completions', {
    contents,
    line,
    column,
    tokenStartColumn,
    prefix,
  });
}

export async function getDeclaration(src: NuclideUri, contents: string, line: number, column: number
): Promise<?ClangDeclarationResult> {
  const result = await getClangServer(src).makeRequest('get_declaration', {
    contents,
    line,
    column,
  });
  if (result == null) {
    return null;
  }

  const {locationAndSpelling} = result;
  if (locationAndSpelling == null) {
    return null;
  }

  const state = await fsPromise.lstat(locationAndSpelling.file);
  if (state.isSymbolicLink()) {
    locationAndSpelling.file = await fsPromise.readlink(locationAndSpelling.file);
  }

  return locationAndSpelling;
}

export function getDeclarationInfo(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number
): Promise<?ClangDeclarationInfoResult> {
  return getClangServer(src).makeRequest('get_declaration_info', {
    contents,
    line,
    column,
  });
}

export function dispose(): void {
  clangServers.forEach(server => server.dispose());
  clangServers.clear();
}
