'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {asyncExecute} from '../../../commons-node/process';
import featureConfig from '../../../commons-atom/featureConfig';

/**
 * Commands that SourceKitten implements and nuclide-swift supports, such as
 * "complete" for autocompletion.
 */
export type SourceKittenCommand = 'complete';

/**
 * Returns the path to SourceKitten, based on the user's Nuclide config.
 */
export function getSourceKittenPath(): string {
  return (featureConfig.get('nuclide-swift.sourceKittenPath'): any);
}

/**
 * Executes a SourceKitten request asyncrhonously.
 * If an error occurs, displays an error and returns null.
 * Otherwise, returns the stdout from SourceKitten.
 */
export async function asyncExecuteSourceKitten(
  command: SourceKittenCommand,
  args: Array<string>,
): Promise<?string> {
  // SourceKitten does not yet support any platform besides macOS.
  // It may soon support Linux; see: https://github.com/jpsim/SourceKitten/pull/223.
  if (process.platform !== 'darwin') {
    return null;
  }

  const sourceKittenPath = getSourceKittenPath();
  const result = await asyncExecute(sourceKittenPath, [command].concat(args));
  if (result.exitCode == null) {
    const errorCode = result.errorCode ? result.errorCode : '';
    const errorMessage = result.errorMessage ? result.errorMessage : '';
    atom.notifications.addError(`Could not invoke SourceKitten at path \`${sourceKittenPath}\``, {
      description:
        'Please double-check that the path you have set for the ' +
        '`nuclide-swift.sourceKittenPath` config setting is correct.<br>' +
        `**Error code:** \`${errorCode}\`<br>` +
        `**Error message:** <pre>${errorMessage}</pre>`,
    });
    return null;
  } else if (result.exitCode !== 0 || result.stdout.length === 0) {
    atom.notifications.addError('An error occured when invoking SourceKitten', {
      description:
        'Please file a bug.<br>' +
        `**exit code:** \`${String(result.exitCode)}\`<br>` +
        `**stdout:** <pre>${String(result.stdout)}</pre><br>` +
        `**stderr:** <pre>${String(result.stderr)}</pre><br>` +
        `**command:** <pre>${String(result.command ? result.command : '')}</pre><br>`,
    });
    return null;
  }

  return result.stdout;
}
