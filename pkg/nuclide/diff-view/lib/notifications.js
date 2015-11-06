'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getLogger} from 'nuclide-logging';
const logger = getLogger();

export function notifyInternalError(error: Error) {
  const errorMessage = `Diff View Internal Error - ${error.message}`;
  logger.error(errorMessage, error);
  atom.notifications.addError(errorMessage);
}
