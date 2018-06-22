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

import addTooltip from 'nuclide-commons-ui/addTooltip';
import {TreeItem} from 'nuclide-commons-ui/Tree';
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

  const isFocused = process === focusedProcess;

  const tooltipTitle =
    service.viewModel.focusedProcess == null ||
    service.viewModel.focusedProcess.configuration.adapterExecutable == null
      ? 'Unknown Command'
      : service.viewModel.focusedProcess.configuration.adapterExecutable
          .command +
        service.viewModel.focusedProcess.configuration.adapterExecutable.args.join(
          ' ',
        );

  const formattedTitle = (
    <span
      className={isFocused ? 'debugger-tree-frame-selected' : ''}
      // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ref={addTooltip({
        title: tooltipTitle,
        delay: 0,
      })}>
      {title}
    </span>
  );

  return childItems == null || childItems.length === 0 ? (
    <TreeItem>{formattedTitle}</TreeItem>
  ) : (
    <DebuggerProcessTreeNode
      formattedTitle={formattedTitle}
      childItems={childItems}
    />
  );
}
