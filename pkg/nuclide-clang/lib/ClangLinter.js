'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  ClangCompileResult,
  ClangSourceRange,
} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {LinterMessage} from '../../nuclide-diagnostics-common';

import {track, trackTiming} from '../../nuclide-analytics';
import featureConfig from '../../commons-atom/featureConfig';
import {wordAtPosition} from '../../commons-atom/range';
import {getLogger} from '../../nuclide-logging';
import {getDiagnostics} from './libclang';
import {Point, Range} from 'atom';

const IDENTIFIER_REGEX = /[a-z0-9_]+/gi;
const DEFAULT_FLAGS_WARNING =
  'Diagnostics are disabled due to lack of compilation flags. ' +
  'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(
  editor: atom$TextEditor,
  clangRange: ClangSourceRange,
): atom$Range {
  // Some ranges are unbounded/invalid (end with -1) or empty.
  // Treat these as point diagnostics.
  if (
    clangRange.end.line === -1 || (
      clangRange.start.line === clangRange.end.line &&
        clangRange.start.column === clangRange.end.column
    )
  ) {
    return atomRangeFromLocation(editor, clangRange.start);
  }

  return new Range(
    [clangRange.start.line, clangRange.start.column],
    [clangRange.end.line, clangRange.end.column],
  );
}

function atomRangeFromLocation(
  editor: atom$TextEditor,
  location: {line: number, column: number},
): atom$Range {
  if (location.line < 0) {
    return editor.getBuffer().rangeForRow(0);
  }
  // Attempt to match a C/C++ identifier at the given location.
  const word = wordAtPosition(
    editor,
    new Point(location.line, location.column),
    IDENTIFIER_REGEX,
  );
  if (word != null) {
    return word.range;
  }
  return editor.getBuffer().rangeForRow(location.line);
}

export default class ClangLinter {

  @trackTiming('nuclide-clang-atom.fetch-diagnostics')
  static async lint(textEditor: atom$TextEditor): Promise<Array<LinterMessage>> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return [];
    }

    try {
      const diagnostics = await getDiagnostics(textEditor);
      // Editor may have been destroyed during the fetch.
      if (diagnostics == null || textEditor.isDestroyed()) {
        return [];
      }

      track('nuclide-clang-atom.fetch-diagnostics', {
        filePath,
        count: String(diagnostics.diagnostics.length),
        accurateFlags: String(diagnostics.accurateFlags),
      });
      return ClangLinter._processDiagnostics(diagnostics, textEditor);
    } catch (error) {
      getLogger().error(`ClangLinter: error linting ${filePath}`, error);
      return [];
    }
  }

  static _processDiagnostics(
    data: ClangCompileResult,
    editor: atom$TextEditor,
  ): Array<LinterMessage> {
    const result = [];
    const buffer = editor.getBuffer();
    if (data.accurateFlags || featureConfig.get('nuclide-clang.defaultDiagnostics')) {
      data.diagnostics.forEach(diagnostic => {
        // We show only warnings, errors and fatals (2, 3 and 4, respectively).
        if (diagnostic.severity < 2) {
          return;
        }

        let range;
        if (diagnostic.ranges) {
          // Use the first range from the diagnostic as the range for Linter.
          range = atomRangeFromSourceRange(editor, diagnostic.ranges[0]);
        } else {
          range = atomRangeFromLocation(editor, diagnostic.location);
        }

        const filePath = diagnostic.location.file || buffer.getPath();

        let trace;
        if (diagnostic.children != null) {
          trace = diagnostic.children.map(child => {
            return {
              type: 'Trace',
              text: child.spelling,
              filePath: child.location.file || buffer.getPath(),
              range: atomRangeFromLocation(editor, child.location),
            };
          });
        }

        let fix;
        if (diagnostic.fixits != null) {
          // TODO: support multiple fixits (if it's ever used at all)
          const fixit = diagnostic.fixits[0];
          if (fixit != null) {
            fix = {
              range: atomRangeFromSourceRange(editor, fixit.range),
              newText: fixit.value,
            };
          }
        }

        result.push({
          scope: 'file',
          providerName: 'Clang',
          type: diagnostic.severity === 2 ? 'Warning' : 'Error',
          filePath,
          text: diagnostic.spelling,
          range,
          trace,
          fix,
        });
      });
    } else {
      result.push({
        scope: 'file',
        providerName: 'Clang',
        type: 'Warning',
        filePath: buffer.getPath(),
        text: DEFAULT_FLAGS_WARNING,
        range: buffer.rangeForRow(0),
      });
    }

    return result;
  }

}
