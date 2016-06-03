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

import {Observable} from 'rxjs';
import {checkOutput} from '../../commons-node/process';
import {keyMirror} from '../../commons-node/collection';
import ClangServerManager from './ClangServerManager';

const serverManager = new ClangServerManager();

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

export type ClangDeclaration = {
  file: NuclideUri;
  line: number;
  column: number;
  spelling: ?string;
  type: ?string;
  extent: ClangCursorExtent;
};

export type ClangCursor = {
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

export const ClangCursorTypes = keyMirror(ClangCursorToDeclarationTypes);

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
  if (clean) {
    serverManager.reset(src);
  }
  const doCompile = async () => {
    // Note: restarts the server if the flags changed.
    const server = await serverManager.getClangServer(src, contents, defaultFlags, true);
    if (server != null) {
      return server.call('compile', {contents})
        .then(result => ({
          ...result,
          accurateFlags: !server.usesDefaultFlags(),
        }));
    }
  };
  return Observable.fromPromise(doCompile());
}

export async function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  tokenStartColumn: number,
  prefix: string,
  defaultFlags?: Array<string>,
): Promise<?Array<ClangCompletion>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_completions', {
      contents,
      line,
      column,
      tokenStartColumn,
      prefix,
    });
  }
}

export async function getDeclaration(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags?: Array<string>,
): Promise<?ClangDeclaration> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_declaration', {
      contents,
      line,
      column,
    });
  }
}

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
export async function getDeclarationInfo(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags: ?Array<string>,
): Promise<?Array<ClangCursor>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_declaration_info', {
      contents,
      line,
      column,
    });
  }
}

export async function getOutline(
  src: NuclideUri,
  contents: string,
  defaultFlags: ?Array<string>,
): Promise<?Array<ClangOutlineTree>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_outline', {
      contents,
    }, /* blocking */ true);
  }
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
  serverManager.reset(src);
}

export function dispose(): void {
  serverManager.dispose();
}
