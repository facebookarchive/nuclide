'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileDiagnosticMessage, Trace} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Point, Range} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-remote-connection';

const DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):([0-9]+): (.*)$/gm;

// An intermediate step towards creating real diagnostics.
type ParsedDiagnostic = {
  level: string,
  filePath: string,
  text: string,
  line: number,
  column: number,
};

function makeDiagnostic(result: ParsedDiagnostic): FileDiagnosticMessage {
  return {
    scope: 'file',
    providerName: 'Buck',
    type: result.level === 'error' ? 'Error' : 'Warning',
    filePath: result.filePath,
    text: result.text,
    range: new Range([result.line - 1, 0], [result.line, 0]),
  };
}

function makeTrace(result: ParsedDiagnostic): Trace {
  const point = new Point(result.line - 1, result.column - 1);
  return {
    type: 'Trace',
    text: result.text,
    filePath: result.filePath,
    // Display trace locations more precisely, since they don't show in the editor.
    range: new Range(point, point),
  };
}

/**
 * Consumes Buck console output and emits a set of file-level diagnostic messages.
 * Ideally Buck should do this for us, but let's parse the messages manually for now.
 * This only (officially) handles Clang/g++ output.
 */
export default async function getDiagnostics(
  message: string,
  level: string,
  root: string,
): Promise<Array<FileDiagnosticMessage>> {
  // Only fetch the file system service if we need it.
  let fileSystemService;
  // Global regexps need to be reset before use.
  DIAGNOSTIC_REGEX.lastIndex = 0;
  // Collect promises and check all matches at once.
  const promises = [];
  let match;
  while ((match = DIAGNOSTIC_REGEX.exec(message))) {
    const [, file, strLine, strCol, text] = match;
    if (fileSystemService == null) {
      fileSystemService = getFileSystemServiceByNuclideUri(root);
    }
    if (fileSystemService != null) {
      const filePath = nuclideUri.join(root, file);
      const localPath = nuclideUri.getPath(filePath);
      promises.push(fileSystemService.exists(localPath).then(
        exists => (!exists ? null : {
          level,
          filePath,
          text,
          line: parseInt(strLine, 10),
          column: parseInt(strCol, 10),
        }),
        // Silently ignore files resulting in an error.
        () => null,
      ));
    }
  }
  const results: Array<?ParsedDiagnostic> = await Promise.all(promises);
  // Merge 'note' level messages into diagnostics as traces.
  const diagnostics = [];
  for (const result of results.filter(Boolean)) {
    if (result.text.startsWith('note: ') && diagnostics.length > 0) {
      const previous = diagnostics[diagnostics.length - 1];
      if (previous.trace == null) {
        previous.trace = [];
      }
      previous.trace.push(makeTrace(result));
    } else {
      diagnostics.push(makeDiagnostic(result));
    }
  }
  return diagnostics;
}
