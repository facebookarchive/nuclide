'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RC = undefined;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function toRTagsLocationFormat(src, line, column) {
  return `${src}:${line + 1}:${column + 1}`;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class RC {

  // Make the RPC-exported methods invariant (see ClangProcessService.js).
  constructor(srcPath) {
    this._src = srcPath;
  }

  get_completions(contents, line, column, tokenStartColumn, prefix) {
    return (0, (_utils || _load_utils()).rcCommand)([`--current-file=${this._src}`, '-b', `--unsaved-file=${this._src}:${contents.length}`, '--code-complete-at', toRTagsLocationFormat(this._src, line, column), '--synchronous-completions', `--code-complete-prefix=${prefix}`, '--json'], contents).map(stdout => {
      const result = JSON.parse(stdout);
      return result.completions.map(item => this._parseRCComletionItem(item));
    }).toPromise();
  }

  compile(contents) {
    return (0, (_utils || _load_utils()).rcCommand)(['--diagnose', this._src, '--synchronous-diagnostics', '--json']).map(stdout => {
      const result = JSON.parse(stdout);
      const file = Object.keys(result.checkStyle)[0];
      const items = result.checkStyle[file];
      if (items == null) {
        return { diagnostics: [] };
      }
      const diagnostics = items.filter(item => item.type !== 'skipped').map(item => this._parseRCDiagnosticsItem(item, file));
      return { diagnostics, accurateFlags: true };
    }).toPromise();
  }

  _parseRCDiagnosticsItem(item, file) {
    const diagnostic = {
      location: {
        file,
        point: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(item.line - 1, item.column - 1)
      },
      spelling: item.message,
      severity: 3, // item.type === 'error' ? 3 : 2,
      children: [],
      // (item.children || []).map(child => this._parseRCDiagnosticsChild(child))
      ranges: null
      // {file, range: new atom$Range([item.line - 1, 0], [item.line, 0])},
    };
    return diagnostic;
  }

  _parseRCDiagnosticsChild(child) {
    return {
      spelling: child.message,
      location: {
        file: child.file,
        point: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(child.line - 1, child.column - 1)
      },
      ranges: [{
        file: child.file,
        range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([child.line - 1, 0], [child.line, 0])
      }]
    };
  }

  get_declaration(contents, line, column) {
    throw new Error('TODO pelmers');
  }

  get_declaration_info(contents, line, column) {
    throw new Error('TODO pelmers');
  }

  get_outline(contents) {
    throw new Error('TODO pelmers');
  }

  get_local_references(contents, line, column) {
    throw new Error('TODO pelmers');
  }

  _parseRCComletionItem(item) {
    return {
      chunks: [{
        spelling: item.signature
      }],
      brief_comment: item.brief_comment,
      cursor_kind: this._convertRCCompletionKind(item.kind),
      typed_name: item.signature,
      spelling: item.completion,
      result_type: '' // not provided by rtags
    };
  }

  _toUnderscore(s) {
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

  _convertRCCompletionKind(kind) {
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
exports.RC = RC;