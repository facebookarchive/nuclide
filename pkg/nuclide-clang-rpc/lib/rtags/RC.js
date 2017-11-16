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

import type {Observable} from 'rxjs';
import type {
  ClangCompletion,
  ClangRequestSettings,
  ClangCompileResult,
  ClangDiagnostic,
  ClangDiagnosticChild,
} from '../rpc-types';

import {runCommand} from 'nuclide-commons/process';
import {Range as atom$Range, Point as atom$Point} from 'simple-text-buffer';

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

export class RC {
  _rcCommand(args: string[], input?: string): Observable<string> {
    return runCommand('rc', args, {encoding: 'utf8', input});
  }

  _toRtagsLocationFormat(src: string, line: number, column: number): string {
    return `${src}:${line + 1}:${column + 1}`;
  }

  getCompletions(
    src: string,
    contents: string,
    line: number,
    column: number,
    tokenStartColumn: number,
    prefix: string,
    requestSettings: ?ClangRequestSettings,
    defaultFlags?: ?Array<string>,
  ): Promise<?Array<ClangCompletion>> {
    return this._rcCommand(
      [
        `--current-file=${src}`,
        '-b',
        `--unsaved-file=${src}:${contents.length}`,
        '--code-complete-at',
        this._toRtagsLocationFormat(src, line, column),
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

  getDiagnostics(
    src: string,
    requestSettings: ?ClangRequestSettings,
    defaultFlags?: ?Array<string>,
  ): Observable<?ClangCompileResult> {
    return this._rcCommand([
      '--diagnose',
      src,
      '--synchronous-diagnostics',
      '--json',
    ]).map(stdout => {
      const result = (JSON.parse(stdout): RCDiagnostics);
      const file = Object.keys(result.checkStyle)[0];
      const items = result.checkStyle[file];
      if (items == null) {
        return null;
      }
      const diagnostics = items.map(item =>
        this._parseRCDiagnosticsItem(item, file),
      );
      return {diagnostics, accurateFlags: true};
    });
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
