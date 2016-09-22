'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileDiagnosticMessage} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Range} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-remote-connection';

const DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):[0-9]+: (.*)$/gm;

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
    const [, file, strLine, text] = match;
    if (fileSystemService == null) {
      fileSystemService = getFileSystemServiceByNuclideUri(root);
    }
    if (fileSystemService != null) {
      const filePath = nuclideUri.join(root, file);
      const localPath = nuclideUri.getPath(filePath);
      promises.push(fileSystemService.exists(localPath).then(
        exists => {
          if (!exists) {
            return null;
          }
          const line = parseInt(strLine, 10);
          return !exists ? null : {
            scope: 'file',
            providerName: 'Buck',
            type: level === 'error' ? 'Error' : 'Warning',
            filePath,
            text,
            range: new Range([line - 1, 0], [line, 0]),
          };
        },
        // Silently ignore files resulting in an error.
        () => null,
      ));
    }
  }
  const diagnostics = await Promise.all(promises);
  return diagnostics.filter(Boolean);
}
