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

import {TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import * as React from 'react';

type Props = {
  process: IProcess,
  service: IDebugService,
  childItems: Array<React.Element<any>>,
  title: string,
};

type State = {
  isCollapsed: boolean,
};

export default class ProcessTreeNode extends React.Component<Props, State> {
  isFocused: boolean;

  constructor(props: Props) {
    super(props);
    this.updateFocused();
    this.state = {
      isCollapsed: !this.isFocused,
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  updateFocused() {
    const {service, process} = this.props;
    const focusedProcess = service.viewModel.focusedProcess;
    this.isFocused = process === focusedProcess;
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Handle the scenario when the user stepped or continued running.
    this.updateFocused;
    if (prevState === this.state) {
      this.setState({
        isCollapsed: !(this.isFocused || !prevState.isCollapsed),
      });
    }
  }

  handleSelect = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed,
    }));
  };

  render() {
    const {service, title, childItems} = this.props;
    this.updateFocused();

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
        className={
          this.isFocused ? 'debugger-tree-process-thread-selected' : ''
        }
        title={tooltipTitle}>
        {title}
      </span>
    );

    return childItems == null || childItems.length === 0 ? (
      <TreeItem>{formattedTitle}</TreeItem>
    ) : (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {childItems}
      </NestedTreeItem>
    );
  }
}
