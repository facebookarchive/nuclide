'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';

import type {Result} from '../../nuclide-active-editor-based-service';

import type {CoverageResult} from './types';

import invariant from 'assert';
import {React} from 'react-for-atom';

import {StatusBarTileComponent} from './StatusBarTileComponent';

type Props = {
  results: Observable<Result<?CoverageResult>>;
};

type State = {
  percentage: ?number;
  pending: boolean;
};

export class StatusBarTile extends React.Component {
  _item: ?HTMLElement;
  _tile: ?atom$StatusBarTile;

  _percentage: ?number;

  state: State;
  props: Props;

  subscription: ?rx$ISubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      percentage: null,
      pending: false,
    };
  }

  componentDidMount(): void {
    invariant(this.subscription == null);
    this.subscription = this.props.results.subscribe(result => this._consumeResult(result));
  }

  componentWillUnmount(): void {
    invariant(this.subscription != null);
    this.subscription.unsubscribe();
    this.subscription = null;
    this.setState({percentage: null});
  }

  _consumeResult(result: Result<?CoverageResult>): void {
    switch (result.kind) {
      case 'not-text-editor':
      case 'no-provider':
      case 'provider-error':
        this.setState({percentage: null});
        break;
      case 'pane-change':
      case 'edit':
      case 'save':
        this.setState({pending: true});
        break;
      case 'result':
        this.setState({
          percentage: result.result,
          pending: false,
        });
        break;
      default:
        throw new Error(`Should handle kind ${result.kind}`);
    }
  }

  render(): React.Element {
    return (
      <StatusBarTileComponent {...this.state} />
    );
  }
}
