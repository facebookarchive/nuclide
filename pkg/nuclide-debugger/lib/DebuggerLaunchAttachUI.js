/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DebuggerProviderStore} from './DebuggerProviderStore';
import type {
  DebuggerLaunchAttachProvider,
  DebuggerConfigAction,
} from '../../nuclide-debugger-base';
import type DebuggerActions from './DebuggerActions';

import React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  getLastUsedDebugger,
  setLastUsedDebugger,
} from '../../nuclide-debugger-base';
import {asyncFilter} from 'nuclide-commons/promise';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import Tabs from '../../nuclide-ui/Tabs';
import invariant from 'invariant';

type PropsType = {
  dialogMode: DebuggerConfigAction,
  store: DebuggerProviderStore,
  debuggerActions: DebuggerActions,
  connection: string,
  providers: Array<DebuggerLaunchAttachProvider>,
  chooseConnection: () => void,
  dialogCloser: () => void,
};

type StateType = {
  selectedProviderTab: ?string,
  configIsValid: boolean,
};

export class DebuggerLaunchAttachUI
  extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;
  _disposables: UniversalDisposable;

  constructor(props: PropsType) {
    super(props);

    (this: any)._setConfigValid = this._setConfigValid.bind(this);

    this._disposables = new UniversalDisposable();
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this.state.configIsValid) {
            // Remember the last tab the user used for this connection when the "launch/attach"
            // button is clicked.
            const host = nuclideUri.isRemote(this.props.connection)
              ? nuclideUri.getHostname(this.props.connection)
              : 'local';
            if (this.state.selectedProviderTab != null) {
              setLastUsedDebugger(
                host,
                this.props.dialogMode,
                this.state.selectedProviderTab || '',
              );
            }

            // Close the dialog, but do it on the next tick so that the child
            // component gets to handle the event first (and start the debugger).
            process.nextTick(this.props.dialogCloser);
          }
        },
      }),
      atom.commands.add('atom-workspace', {
        'core:cancel': () => {
          this.props.dialogCloser();
        },
      }),
    );

    this.state = {
      selectedProviderTab: null,
      configIsValid: false,
    };
  }

  componentWillMount() {
    const host = nuclideUri.isRemote(this.props.connection)
      ? nuclideUri.getHostname(this.props.connection)
      : 'local';

    this.setState({
      selectedProviderTab: getLastUsedDebugger(host, this.props.dialogMode),
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _setConfigValid(valid: boolean): void {
    this.setState({
      configIsValid: valid,
    });
  }

  render(): React.Element<any> {
    const displayName = nuclideUri.isRemote(this.props.connection)
      ? nuclideUri.getHostname(this.props.connection)
      : 'localhost';

    const providedDebuggers = [].concat(
      ...this.props.providers
        .filter(provider => provider.isEnabled(this.props.dialogMode))
        .map(provider => {
          return provider
            .getDebuggerTypeNames(this.props.dialogMode)
            .map(debuggerName => {
              return {
                provider,
                debuggerName,
              };
            });
        }),
    );

    const tabs = providedDebuggers
      .map(debuggerType => ({
        name: debuggerType.debuggerName,
        tabContent: (
          <span title={debuggerType.debuggerName}>
            {debuggerType.debuggerName}
          </span>
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    let providerContent = null;
    if (tabs.length > 0) {
      const selectedTab = this.state.selectedProviderTab != null
        ? this.state.selectedProviderTab
        : tabs[0].name;
      const provider = providedDebuggers.find(
        p => p.debuggerName === selectedTab,
      );
      invariant(provider != null);

      const debuggerConfigPage = provider.provider.getComponent(
        selectedTab,
        this.props.dialogMode,
        valid => this._setConfigValid(valid),
      );

      providerContent = (
        <div>
          <Tabs
            className="nuclide-debugger-launch-attach-tabs"
            tabs={tabs}
            activeTabName={this.state.selectedProviderTab}
            triggeringEvent="onClick"
            onActiveTabChange={newTab => {
              this._setConfigValid(false);
              this.setState({selectedProviderTab: newTab.name});
            }}
          />
          <div className="nuclide-debugger-launch-attach-tabcontent">
            {debuggerConfigPage}
          </div>
        </div>
      );

      if (this.state.selectedProviderTab == null) {
        // Select the first tab.
        this.setState({selectedProviderTab: tabs[0].name});
      }
    } else {
      // No debugging providers available.
      providerContent = (
        <div className="nuclide-debugger-launch-attach-tabcontent">
          There are no debuggers available.
        </div>
      );
    }

    return (
      <div className="padded nuclide-debugger-launch-attach-container">
        <h1 className="nuclide-debugger-launch-attach-header">
          {this.props.dialogMode === 'attach'
            ? 'Attach debugger to '
            : 'Launch debugger on '}
          <span
            className="nuclide-debugger-launch-connection"
            title="Click to change the connection to be used for debugging."
            onClick={() => this.props.chooseConnection()}>
            {displayName}
          </span>
          <span>:</span>
        </h1>
        {providerContent}
        <div className="nuclide-debugger-launch-attach-actions">
          <ButtonGroup>
            <Button
              onClick={() =>
                atom.commands.dispatch(
                  atom.views.getView(atom.workspace),
                  'core:cancel',
                )}>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              disabled={!this.state.configIsValid}
              onClick={() =>
                atom.commands.dispatch(
                  atom.views.getView(atom.workspace),
                  'core:confirm',
                )}>
              {this.props.dialogMode === 'attach' ? 'Attach' : 'Launch'}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
