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
import type {ClangCompletion, ClangRequestSettings} from '../rpc-types';

import {runCommand} from 'nuclide-commons/process';

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

export class RC {
  _rcCommand(args: string[], input: string): Observable<string> {
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
