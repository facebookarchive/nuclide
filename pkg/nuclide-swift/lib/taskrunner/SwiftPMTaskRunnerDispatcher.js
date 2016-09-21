'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Dispatcher from '../../../commons-node/Dispatcher';

type SwiftPMTaskRunnerAction =
  {
    actionType: 'UPDATE_CHDIR',
    chdir: string,
  } |
  {
    actionType: 'UPDATE_BUILD_SETTINGS',
    configuration: string,
    Xcc: string,
    Xlinker: string,
    Xswiftc: string,
    buildPath: string,
  } |
  {
    actionType: 'UPDATE_TEST_SETTINGS',
    buildPath: string
  } |
  {
    actionType: 'UPDATE_COMPILE_COMMANDS',
    compileCommands: Map<string, string>,
  };

export default class SwiftPMTaskRunnerDispatcher extends Dispatcher<SwiftPMTaskRunnerAction> {}
