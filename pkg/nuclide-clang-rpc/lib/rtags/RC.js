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

import type {
  ClangCompletion,
  ClangCompileResult,
  ClangDiagnostic,
  ClangDiagnosticChild,
  ClangOutlineTree,
  ClangLocalReferences,
  ClangCursor,
  ClangDeclaration,
} from '../rpc-types';

import {Range as atom$Range, Point as atom$Point} from 'simple-text-buffer';
import {rcCommand} from './utils';

type RCCompletionItem = {
  annotation: string,
  brief_comment: string,
  completion: string,
  kind: string, // TODO: type this
  parent: string,
  signature: string,
  priority: number,
};

type RCCompletion = {
  completions: Array<RCCompletionItem>,
};

type RCDiagnosticsChild = {
  column: number,
  file: string,
  line: number,
  message: string,
  type: string,
};

type RCDiagnosticsItem = {
  children?: Array<RCDiagnosticsChild>,
  column: number,
  length?: number,
  line: number,
  message: string,
  type: 'fixit' | 'error' | 'warning' | 'skipped',
};

type RCDiagnostics = {
  checkStyle: {
    [file: string]: Array<RCDiagnosticsItem>,
  },
};

function toRTagsLocationFormat(
  src: string,
  line: number,
  column: number,
): string {
  return `${src}:${line + 1}:${column + 1}`;
}

export class RC {
  _src: string;

  // Make the RPC-exported methods invariant (see ClangProcessService.js).
  compile: string => Promise<ClangCompileResult>;

  get_completions: (
    string,
    number,
    number,
    number,
    string,
  ) => Promise<?Array<ClangCompletion>>;

  get_declaration: (
    contents: string,
    line: number,
    column: number,
  ) => Promise<?ClangDeclaration>;

  get_declaration_info: (
    contents: string,
    line: number,
    column: number,
  ) => Promise<?Array<ClangCursor>>;

  get_outline: (contents: string) => Promise<?Array<ClangOutlineTree>>;

  get_local_references: (
    contents: string,
    line: number,
    column: number,
  ) => Promise<?ClangLocalReferences>;

  constructor(srcPath: string) {
    this._src = srcPath;
  }

  get_completions(
    contents: string,
    line: number,
    column: number,
    tokenStartColumn: number,
    prefix: string,
  ): Promise<?Array<ClangCompletion>> {
    return rcCommand(
      [
        `--current-file=${this._src}`,
        '-b',
        `--unsaved-file=${this._src}:${contents.length}`,
        '--code-complete-at',
        toRTagsLocationFormat(this._src, line, column),
        '--synchronous-completions',
        `--code-complete-prefix=${prefix}`,
        '--json',
      ],
      contents,
    )
      .map(stdout => {
        const result = (JSON.parse(stdout): RCCompletion);
        return result.completions.map(item => this._parseRCComletionItem(item));
      })
      .toPromise();
  }

  compile(contents: string): Promise<ClangCompileResult> {
    return rcCommand([
      '--diagnose',
      this._src,
      '--synchronous-diagnostics',
      '--json',
    ])
      .map(stdout => {
        const result = (JSON.parse(stdout): RCDiagnostics);
        const file = Object.keys(result.checkStyle)[0];
        const items = result.checkStyle[file];
        if (items == null) {
          return {diagnostics: []};
        }
        const diagnostics = items
          .filter(item => item.type !== 'skipped')
          .map(item => this._parseRCDiagnosticsItem(item, file));
        return {diagnostics, accurateFlags: true};
      })
      .toPromise();
  }

  _parseRCDiagnosticsItem(
    item: RCDiagnosticsItem,
    file: string,
  ): ClangDiagnostic {
    const diagnostic = {
      location: {
        file,
        point: new atom$Point(item.line - 1, item.column - 1),
      },
      spelling: item.message,
      severity: 3, // item.type === 'error' ? 3 : 2,
      children: [],
      // (item.children || []).map(child => this._parseRCDiagnosticsChild(child))
      ranges: null,
      // {file, range: new atom$Range([item.line - 1, 0], [item.line, 0])},
    };
    return diagnostic;
  }

  _parseRCDiagnosticsChild(child: RCDiagnosticsChild): ClangDiagnosticChild {
    return {
      spelling: child.message,
      location: {
        file: child.file,
        point: new atom$Point(child.line - 1, child.column - 1),
      },
      ranges: [
        {
          file: child.file,
          range: new atom$Range([child.line - 1, 0], [child.line, 0]),
        },
      ],
    };
  }

  get_declaration(
    contents: string,
    line: number,
    column: number,
  ): Promise<?ClangDeclaration> {
    throw new Error('TODO pelmers');
  }

  get_declaration_info(
    contents: string,
    line: number,
    column: number,
  ): Promise<?Array<ClangCursor>> {
    throw new Error('TODO pelmers');
  }

  get_outline(contents: string): Promise<?Array<ClangOutlineTree>> {
    throw new Error('TODO pelmers');
  }

  get_local_references(
    contents: string,
    line: number,
    column: number,
  ): Promise<?ClangLocalReferences> {
    throw new Error('TODO pelmers');
  }

  _parseRCComletionItem(item: RCCompletionItem): ClangCompletion {
    return {
      chunks: [
        {
          spelling: item.signature,
        },
      ],
      brief_comment: item.brief_comment,
      cursor_kind: this._convertRCCompletionKind(item.kind),
      typed_name: item.signature,
      spelling: item.completion,
      result_type: '', // not provided by rtags
    };
  }

  _toUnderscore(s: string): string {
    let res = '';
    for (const c of s) {
      const u = c.toUpperCase();
      if (c === u && s.length !== 0) {
        res += '_';
      }
      res += u;
    }
    return res;
  }

  _convertRCCompletionKind(kind: string): string {
    // return kind;
    switch (kind) {
      case 'CXXConstructor':
        return 'CONSTRUCTOR';
      case 'CXXDestructor':
        return 'DESTRUCTOR';
      default:
        return this._toUnderscore(kind);
    }
  }
}
