'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {getLogger} from '../../nuclide-logging';

const logger = getLogger();

export function notifyInternalError(error: Error, dismissable?: boolean = false) {
  const errorMessage = 'Diff View Internal Error';
  logger.error(errorMessage, error);
  atom.notifications.addError(errorMessage, {detail: error.message, dismissable});
}

export function notifyFilesystemOverrideUserEdits(filePath: NuclideUri) {
  const message = `Diff View Override<br/>
The filesystem contents of the active file have changed, overriding user changes for file:<br/>
\`${filePath}\`
`;
  logger.warn(message);
  atom.notifications.addWarning(message);
}
