/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IProcess, IDebugService} from '../types';

import * as React from 'react';
import DebuggerProcessTreeNode from './DebuggerProcessTreeNode';

type Props = {
  process: IProcess,
  service: IDebugService,
  childItems: Array<React.Element<any>>,
  title: string,
};

export default function ProcessTreeNode(props: Props): React.Node {
  const {process, service, title, childItems} = props;
  const focusedProcess = service.viewModel.focusedProcess;

  // For now, simply check if command and adapter types are the same.
  // Later, when process names are added to debuggers, we will use those instead.
  const isFocused =
    focusedProcess == null ||
    focusedProcess.configuration.adapterExecutable == null ||
    process.configuration.adapterExecutable == null
      ? false
      : process.configuration.adapterType ===
          focusedProcess.configuration.adapterType &&
        process.configuration.adapterExecutable.command ===
          focusedProcess.configuration.adapterExecutable.command;

  return (
    <DebuggerProcessTreeNode
      isFocused={isFocused}
      title={title}
      childItems={childItems}
    />
  );
}
