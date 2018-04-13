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
/* global localStorage */

import type {
  DebuggerConfigAction,
  DebuggerLaunchAttachProvider,
} from 'nuclide-debugger-common';

import * as React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Dropdown} from 'nuclide-commons-ui/Dropdown';
import Tabs from 'nuclide-commons-ui/Tabs';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {isNuclideEnvironment} from '../AtomServiceContainer';

type Props = {|
  +dialogMode: DebuggerConfigAction,
  +connection: string,
  +connectionChanged: (newValue: ?string) => void,
  // $FlowFixMe
  +connectionOptions: Array<{value: string, label: string}>,
  +providers: Map<string, Array<DebuggerLaunchAttachProvider>>,
  +dialogCloser: () => void,
|};

type State = {
  selectedProviderTab: ?string,
  configIsValid: boolean,
  enabledProviders: Array<{
    provider: DebuggerLaunchAttachProvider,
    debuggerName: string,
  }>,
};

// TODO those should be managed by the debugger store state
function setLastUsedDebugger(
  host: string,
  action: DebuggerConfigAction,
  debuggerDisplayName: string,
): void {
  const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;
  localStorage.setItem(key, debuggerDisplayName);
}

function getLastUsedDebugger(
  host: string,
  action: DebuggerConfigAction,
): ?string {
  const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;
  return localStorage.getItem(key);
}

export default class DebuggerLaunchAttachUI extends React.Component<
  Props,
  State,
> {
  props: Props;
  state: State;
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this.state.configIsValid) {
            this._rememberTab();

            // Close the dialog, but do it on the next tick so that the child
            // component gets to handle the event first (and start the debugger).
            process.nextTick(this.props.dialogCloser);
          }
        },
      }),
      atom.commands.add('atom-workspace', {
        'core:cancel': () => {
          this._rememberTab();
          this.props.dialogCloser();
        },
      }),
    );

    this.state = {
      selectedProviderTab: null,
      configIsValid: false,
      enabledProviders: [],
    };
  }

  _rememberTab(): void {
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
  }

  componentWillMount() {
    const host = nuclideUri.isRemote(this.props.connection)
      ? nuclideUri.getHostname(this.props.connection)
      : 'local';

    this._filterProviders(host);
    this.setState({
      selectedProviderTab: getLastUsedDebugger(host, this.props.dialogMode),
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const host = nuclideUri.isRemote(nextProps.connection)
      ? nuclideUri.getHostname(nextProps.connection)
      : 'local';

    this._filterProviders(host);
    this.setState({
      selectedProviderTab: getLastUsedDebugger(host, nextProps.dialogMode),
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _getProviderIfEnabled(
    provider: DebuggerLaunchAttachProvider,
  ): Promise<?DebuggerLaunchAttachProvider> {
    const enabled = await provider
      .getCallbacksForAction(this.props.dialogMode)
      .isEnabled();
    return enabled ? provider : null;
  }

  _filterProviders(key: string): void {
    this.setState({
      enabledProviders: [],
    });

    Observable.merge(
      ...(this.props.providers.get(key) || []).map(provider =>
        Observable.fromPromise(this._getProviderIfEnabled(provider)),
      ),
    )
      .filter(provider => provider != null)
      .subscribe(provider => {
        invariant(provider != null);
        const enabledProviders = this.state.enabledProviders.concat(
          ...provider
            .getCallbacksForAction(this.props.dialogMode)
            .getDebuggerTypeNames()
            .map(debuggerName => {
              return {
                provider,
                debuggerName,
              };
            }),
        );

        this.setState({
          enabledProviders,
        });
      });
  }

  _setConfigValid = (valid: boolean): void => {
    this.setState({
      configIsValid: valid,
    });
  };

  render(): React.Node {
    const tabs = this.state.enabledProviders
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
      let selectedTab =
        this.state.selectedProviderTab != null
          ? this.state.selectedProviderTab
          : this.state.enabledProviders[0].debuggerName;
      let provider = this.state.enabledProviders.find(
        p => p.debuggerName === selectedTab,
      );
      if (provider == null) {
        provider = this.state.enabledProviders[0];
        selectedTab = provider.debuggerName;
      }

      const debuggerConfigPage = provider.provider
        .getCallbacksForAction(this.props.dialogMode)
        .getComponent(selectedTab, valid => this._setConfigValid(valid));

      providerContent = (
        <div>
          <Tabs
            className="debugger-launch-attach-tabs"
            tabs={tabs}
            activeTabName={this.state.selectedProviderTab}
            triggeringEvent="onClick"
            onActiveTabChange={newTab => {
              this._setConfigValid(false);
              this.setState({selectedProviderTab: newTab.name});
            }}
          />
          <div className="debugger-launch-attach-tabcontent">
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
        <div className="debugger-launch-attach-tabcontent">
          No debuggers installed, look for available debuggers on{' '}
          <a href="https://atom.io/packages/search?q=atom-ide-debugger-">
            atom.io/packages
          </a>
        </div>
      );
    }

    return (
      <div className="padded debugger-launch-attach-container">
        {isNuclideEnvironment() ? (
          <h1 className="debugger-launch-attach-header">
            <span className="padded">
              {this.props.dialogMode === 'attach'
                ? 'Attach debugger to '
                : 'Launch debugger on '}
            </span>
            <Dropdown
              className="inline"
              options={this.props.connectionOptions}
              onChange={(value: ?string) => this.props.connectionChanged(value)}
              size="xs"
              value={this.props.connection}
            />
          </h1>
        ) : null}
        {providerContent}
        <div className="debugger-launch-attach-actions">
          <ButtonGroup>
            <Button
              onClick={() =>
                atom.commands.dispatch(
                  atom.views.getView(atom.workspace),
                  'core:cancel',
                )
              }>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              disabled={!this.state.configIsValid}
              onClick={() =>
                atom.commands.dispatch(
                  atom.views.getView(atom.workspace),
                  'core:confirm',
                )
              }>
              {this.props.dialogMode === 'attach' ? 'Attach' : 'Launch'}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
