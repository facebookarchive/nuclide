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
  ClangLocation,
} from '../../nuclide-clang/lib/rpc-types';
import type {LinterMessage} from '../../nuclide-diagnostics-base';

import {track, trackTiming} from '../../nuclide-analytics';
import featureConfig from '../../commons-atom/featureConfig';
import {getLogger} from '../../nuclide-logging';
import {getDiagnostics} from './libclang';
import {Range} from 'atom';

const DEFAULT_FLAGS_WARNING =
  'Diagnostics are disabled due to lack of compilation flags. ' +
  'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(clangRange: ClangSourceRange): atom$Range {
  return new Range(
    [clangRange.start.line, clangRange.start.column],
    [clangRange.end.line, clangRange.end.column],
  );
}

function atomRangeFromLocation(location: ClangLocation): atom$Range {
  const line = Math.max(0, location.line);
  return new Range([line, 0], [line + 1, 0]);
}

export default class ClangLinter {

  @trackTiming('nuclide-clang-atom.fetch-diagnostics')
  static async lint(textEditor: atom$TextEditor): Promise<Array<LinterMessage>> {
    const filePath = textEditor.getPath();
    if (!filePath) {
      return;
    }

    try {
      const diagnostics = await getDiagnostics(textEditor);
      if (diagnostics == null) {
        return [];
      }

      track('nuclide-clang-atom.fetch-diagnostics', {
        filePath,
        count: String(diagnostics.diagnostics.length),
        accurateFlags: String(diagnostics.accurateFlags),
      });
      return ClangLinter._processDiagnostics(diagnostics, filePath);
    } catch (error) {
      getLogger().error(`ClangLinter: error linting ${filePath}`, error);
      return [];
    }
  }

  static _processDiagnostics(
    data: ClangCompileResult,
    editorPath: string,
  ): Array<LinterMessage> {
    const result = [];
    if (data.accurateFlags || featureConfig.get('nuclide-clang-atom.defaultDiagnostics')) {
      data.diagnostics.forEach(diagnostic => {
        // We show only warnings, errors and fatals (2, 3 and 4, respectively).
        if (diagnostic.severity < 2) {
          return;
        }

        // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
        // The usual file-wide error is 'too many errors emitted, stopping now'.
        let range;
        if (diagnostic.ranges) {
          // Use the first range from the diagnostic as the range for Linter.
          range = atomRangeFromSourceRange(diagnostic.ranges[0]);
        } else {
          range = atomRangeFromLocation(diagnostic.location);
        }

        const filePath = diagnostic.location.file || editorPath;

        let trace;
        if (diagnostic.children != null) {
          trace = diagnostic.children.map(child => {
            return {
              type: 'Trace',
              text: child.spelling,
              filePath: child.location.file || editorPath,
              range: atomRangeFromLocation(child.location),
            };
          });
        }

        let fix;
        if (diagnostic.fixits != null) {
          // TODO: support multiple fixits (if it's ever used at all)
          const fixit = diagnostic.fixits[0];
          if (fixit != null) {
            fix = {
              range: atomRangeFromSourceRange(fixit.range),
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
        filePath: editorPath,
        text: DEFAULT_FLAGS_WARNING,
        range: new Range([0, 0], [1, 0]),
      });
    }

    return result;
  }

}
