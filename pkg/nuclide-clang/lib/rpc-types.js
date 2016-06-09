/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import type {NuclideUri} from '../../nuclide-remote-uri';

import {keyMirror} from '../../commons-node/collection';

// NOTE that the definitions in this file are shared between
// the ClangService and ClangProcessService.


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
  accurateFlags?: boolean;
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
