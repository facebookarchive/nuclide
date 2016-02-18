'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Item from '../../../remote-connection/lib/ServiceLogger';

import AtomInput from '../../../ui/atom-input';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

const {PropTypes} = React;

type State = {
  serviceFilter: string,
};

export default class ServiceMonitor extends React.Component {
  state: State;

  static propTypes = {
    serviceLogger: PropTypes.object.isRequired,
  };

  _subscriptions: CompositeDisposable;

  _nextKey: number;
  _itemToKey: WeakMap<Item, string>;

  constructor(props: Object) {
    super(props);
    this._subscriptions = new CompositeDisposable();
    this._nextKey = 0;
    this._itemToKey = new WeakMap();
    this.state = {
      serviceFilter: '',
    };
    (this: any)._onFilterDidChange = this._onFilterDidChange.bind(this);
  }

  componentDidMount() {
    this._subscriptions.add(
      this.props.serviceLogger.onNewItem((item: Item) => this.forceUpdate()),
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  _onFilterDidChange(filterText: string): void {
    this.setState({
      serviceFilter: filterText,
    });
  }

  // TODO(t8579654): Use FixedDataTable.
  // TODO(t8579695): Make it possible to click on a row and console.dir() the arguments so that they
  // can be inspected.
  render(): ReactElement {
    const rows = [];
    const serviceFilter = this.state.serviceFilter.toLowerCase();
    for (const item of this.props.serviceLogger) {
      if (item.service.toLowerCase().indexOf(serviceFilter) === -1) {
        continue;
      }

      let key = this._itemToKey.get(item);
      if (!key) {
        key = String(++this._nextKey);
        this._itemToKey.set(item, key);
      }

      rows.push(
        <tr key={key}>
          <td className="nuclide-service-monitor-cell">{item.date.toLocaleTimeString()}</td>
          <td className="nuclide-service-monitor-cell">{item.service}</td>
          <td className="nuclide-service-monitor-cell">{item.method}</td>
          <td className="nuclide-service-monitor-cell">{String(item.isLocal)}</td>
          <td className="nuclide-service-monitor-cell">{item.argInfo}</td>
        </tr>
      );
    }

    // TODO(mbolin): Create a reverse iterator for the CircularBuffer.
    rows.reverse();

    return (
      <atom-panel class="top nuclide-service-monitor-root">
        <div className="panel-heading">
          <div className="nuclide-service-monitor-header">
            <div className="nuclide-service-monitor-left-header">
              Nuclide Service Monitor
            </div>
            <div className="nuclide-service-monitor-right-header">
              <div className="nuclide-service-monitor-filter-container">
                <AtomInput
                  initialValue={this.state.serviceFilter}
                  onDidChange={this._onFilterDidChange}
                  placeholderText="Filter by service name"
                  ref="filter"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="panel-body nuclide-service-monitor-contents">
          <table>
            <tbody>
              <tr>
                <th className="nuclide-service-monitor-header-cell">Time</th>
                <th className="nuclide-service-monitor-header-cell">Service</th>
                <th className="nuclide-service-monitor-header-cell">Method</th>
                <th className="nuclide-service-monitor-header-cell">Local?</th>
                <th className="nuclide-service-monitor-header-cell">Arguments</th>
              </tr>
              {rows}
            </tbody>
          </table>
        </div>
      </atom-panel>
    );
  }
}
