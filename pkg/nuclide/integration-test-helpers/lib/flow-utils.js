'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {asyncExecute} from '../../commons';

/**
 * Start the flow server in the specified directory, projectPath.
 */
export async function startFlowServer(projectPath: string): Promise<void> {
  await asyncExecute('flow', [projectPath]);
}

/**
 * Stop the flow server in the specified directory, projectPath.
 */
export async function stopFlowServer(projectPath: string): Promise<void> {
  await asyncExecute('flow', ['stop', projectPath]);
}
