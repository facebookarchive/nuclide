'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {checkOutput} from 'nuclide-commons';

const PATH_TO_HH_CLIENT = 'hh_client';

async function isClientAvailable(): Promise<boolean> {
  var {stdout} = await checkOutput('which', [PATH_TO_HH_CLIENT]);
  // The `stdout` would be empty if there is no such command.
  return stdout.trim().length > 0;
}

module.exports = {
  services: {
    '/hack/isClientAvailable': {handler: isClientAvailable, method: 'post'},
  }
};
