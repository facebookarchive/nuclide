/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {DebuggerProviderStore} from './DebuggerProviderStore';
import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type DebuggerActions from './DebuggerActions';

import {Dropdown} from '../../nuclide-ui/Dropdown';
import React from 'react';
import nuclideUri from '../../commons-node/nuclideUri';
import {asyncFilter} from '../../commons-node/promise';

import type EventEmitter from 'events';

type PropsType = {
  store: DebuggerProviderStore,
  debuggerActions: DebuggerActions,
  emitter: EventEmitter,
};

type StateType = {
  connectionsUpdatedDisposable: IDisposable,
  // Current available Nuclide connections.
  connections: Array<string>,
  // Availble and enabled launch/attach providers for current selected connection.
  availableProviders: Array<DebuggerLaunchAttachProvider>,
  // Customized launch/attach actions supported by this (connection + provider) combination.
  providerActions: Array<string>,
  connectionsDropdownIndex: number,
  debuggingTypeDropdownIndex: number,
  providerActionsDropdownIndex: number,
  element: ?React.Element<any>,
};

export class DebuggerLaunchAttachUI extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);

    (this: any)._resetConnections = this._resetConnections.bind(this);
    (this: any)._handleConnectionDropdownChange = this._handleConnectionDropdownChange.bind(this);
    (this: any)._handleDebuggingTypeDropdownChange =
      this._handleDebuggingTypeDropdownChange.bind(this);
    (this: any)._handleProviderActionsDropdownChange =
      this._handleProviderActionsDropdownChange.bind(this);

    this.state = {
      connectionsUpdatedDisposable: this.props.store.onConnectionsUpdated(this._resetConnections),
      connections: [],
      availableProviders: [],
      providerActions: [],
      connectionsDropdownIndex: 0,
      debuggingTypeDropdownIndex: 0,
      providerActionsDropdownIndex: 0,
      element: null,
    };
  }

  componentWillMount() {
    this.props.debuggerActions.updateConnections();
  }

  componentWillUnmount() {
    this.state.connectionsUpdatedDisposable.dispose();
  }

  render(): React.Element<any> {
    const connectionItems = this.state.connections.map((connection, index) => ({
      label: nuclideUri.isRemote(connection) ? nuclideUri.getHostname(connection) : connection,
      value: index,
    }));

    const debuggingTypeItems = this.state.availableProviders.map((provider, index) => ({
      label: provider.getDebuggingTypeName(),
      value: index,
    }));

    const providerActions = this.state.providerActions.map((action, index) => ({
      label: action,
      value: index,
    }));

    return (
      <div className="padded nuclide-debugger-launch-attach-container">
        <div className="nuclide-debugger-launch-attach-header">
          <label className="inline-block">Connection: </label>
          <Dropdown
            className="inline-block"
            options={connectionItems}
            onChange={this._handleConnectionDropdownChange}
            value={this.state.connectionsDropdownIndex}
            size="sm"
          />
          <label className="inline-block">Type: </label>
          <Dropdown
            className="inline-block"
            options={debuggingTypeItems}
            onChange={this._handleDebuggingTypeDropdownChange}
            value={this.state.debuggingTypeDropdownIndex}
            size="sm"
          />
          <label className="inline-block">Action: </label>
          <Dropdown
            className="inline-block"
            options={providerActions}
            onChange={this._handleProviderActionsDropdownChange}
            value={this.state.providerActionsDropdownIndex}
            size="sm"
          />
        </div>
        <div>
          {this.state.element}
        </div>
      </div>
    );
  }

  // Reset connections dropdown with latest connections.
  _resetConnections(): void {
    const connections = this.props.store.getConnections();
    this.setState({
      connections,
      connectionsDropdownIndex: 0,
    });
    // Continue fill debugging types dropdown for new connection.
    this._resetAvailableDebuggingTypes(connections[0]);
  }

  _handleConnectionDropdownChange(newIndex: number): void {
    this.setState({
      connectionsDropdownIndex: newIndex,
    });
    const selectedConnection = this.state.connections[newIndex];
    // Fire and forget.
    this._resetAvailableDebuggingTypes(selectedConnection);
  }

  // Reset debugging types dropdown for input connection.
  async _resetAvailableDebuggingTypes(connection: string): Promise<void> {
    this._clearPreviousProviders();
    const availableProviders = await asyncFilter(
      this.props.store.getLaunchAttachProvidersForConnection(connection),
      provider => provider.isEnabled(),
    );

    this.setState({
      availableProviders,
      debuggingTypeDropdownIndex: 0,
    });
    // Continue fill actions dropdown for new provider.
    this._resetProviderActions(availableProviders[0]);
  }

  _clearPreviousProviders(): void {
    for (const provider of this.state.availableProviders) {
      provider.dispose();
    }
  }

  _handleDebuggingTypeDropdownChange(newIndex: number): void {
    this.setState({
      debuggingTypeDropdownIndex: newIndex,
    });
    this._resetProviderActions(this.state.availableProviders[newIndex]);
  }

  // Reset actions dropdown for input DebuggerLaunchAttachProvider.
  _resetProviderActions(provider: DebuggerLaunchAttachProvider): void {
    provider.getActions().then(providerActions => {
      this.setState({
        providerActions,
        providerActionsDropdownIndex: 0,
      });
      this._resetElement(provider, providerActions[0]);
    });
  }

  _handleProviderActionsDropdownChange(newIndex: number): void {
    this.setState({
      providerActionsDropdownIndex: newIndex,
    });
    const selectedProviderIndex = this.state.debuggingTypeDropdownIndex;
    const provider = this.state.availableProviders[selectedProviderIndex];
    const selectedAction = this.state.providerActions[newIndex];
    // Continue use new UI element for new provider + action.
    this._resetElement(provider, selectedAction);
  }

  // Display new customized element UI from input provider and action.
  _resetElement(provider: DebuggerLaunchAttachProvider, action: string): void {
    let element = provider.getComponent(action, this.props.emitter);
    // Assign an unique key to element so that react treats it as a new element.
    if (element != null) {
      element = React.cloneElement(element, {key: provider.getUniqueKey()});
    }
    this.setState({
      element,
    });
  }
}
