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

import classnames from 'classnames';
import FullWidthProgressBar from 'nuclide-commons-ui/FullWidthProgressBar';
import {Observable, BehaviorSubject} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import TaskRunnerStatusTooltip from './TaskRunnerStatusTooltip';

type Props = {
  title: ?string,
  header?: ?string,
  body: ?string,
  visible: ?boolean,
  progress: ?number,
};

type State = {
  hoveredProviderName: ?string,
  secondsSinceMount: number,
};

export default class TaskRunnerStatusComponent extends React.Component<
  Props,
  State,
> {
  _tooltipRefs: Map<string, HTMLElement> = new Map();
  // Legacy of migration, will remove this later.
  _hoveredProviderName: BehaviorSubject<?string> = new BehaviorSubject(null);
  _disposables: UniversalDisposable = new UniversalDisposable();
  _intervalID: ?IntervalID;

  state: State = {
    hoveredProviderName: null,
    secondsSinceMount: 0,
  };
  defaultTaskStatus: string = 'Running task...';
  _mountTimestamp: number = 0;

  _tickUpdateSeconds() {
    const timenow = Date.now() - this._mountTimestamp;
    this.setState({secondsSinceMount: timenow / 1000});
  }

  constructor() {
    super();

    // $FlowFixMe: debounce() is not in flow types for rxjs
    const hoveredProviderNameDebounced = this._hoveredProviderName.debounce(
      hoveredProviderName => {
        // No debounce when hovering on to, 250ms debounce when hovering off of
        return Observable.empty().delay(hoveredProviderName != null ? 0 : 250);
      },
    );
    this._disposables.add(
      hoveredProviderNameDebounced.subscribe(hoveredProviderName => {
        this.setState({hoveredProviderName});
      }),
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.visible && !prevProps.visible) {
      this._mountTimestamp = Date.now();
      this._intervalID = setInterval(() => {
        this._tickUpdateSeconds();
      }, 100);
    }
    if (!this.props.visible && prevProps.visible) {
      if (this._intervalID != null) {
        clearInterval(this._intervalID);
        this._intervalID = null;
      }
    }
  }

  componentWillUnmount() {
    if (this._intervalID != null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }
    this._disposables.dispose();
  }

  render(): React.Node {
    const serverStatus = {
      data: {
        kind: 'green',
        message: this.props.header,
        buttons: ['Stop'],
      },
      provider: {
        name: '',
        description: '',
        priority: 1,
      },
    };
    const visible =
      this.props.visible ||
      (this.props.title != null && this.props.title !== '');
    if (!visible) {
      return null;
    }
    return (
      <div className="nuclide-taskbar-status-container" hidden={!visible}>
        <FullWidthProgressBar
          progress={this.props.progress == null ? 0 : this.props.progress}
          visible={true}
        />
        <div className="nuclide-taskbar-status-providers-container">
          {this._renderProvider(
            serverStatus,
            true,
            this.state.hoveredProviderName != null,
          )}
        </div>
      </div>
    );
  }

  _renderProvider = (
    status: any,
    visible: boolean,
    hovered: boolean,
  ): React.Node => {
    const {provider} = status;

    const defaultTitle = (
      <div>
        Running task...
        <span> {this.state.secondsSinceMount.toFixed(1)} </span>
        sec
      </div>
    );
    return (
      <div
        className={classnames(
          'nuclide-taskbar-status-provider',
          'nuclide-taskbar-status-provider-green',
        )}
        onMouseOver={this._onMouseOver}
        onMouseOut={this._onMouseOut}
        data-name={status.provider.name}
        key={status.provider.name}
        style={{opacity: visible || hovered ? 1 : 0}}
        ref={this._setTooltipRef}>
        {this.props.title == null || this.props.title === '' ? (
          defaultTitle
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: this.props.title,
            }}
          />
        )}
        <div className="fb-on-demand-beta-small nuclide-taskbar-beta-small" />
        {this.state.hoveredProviderName !== provider.name ||
        this.props.body == null ||
        this.props.body === '' ? null : (
          <TaskRunnerStatusTooltip
            body={this.props.body}
            parentRef={this._tooltipRefs.get(status.provider.name)}
            status={status}
          />
        )}
      </div>
    );
  };

  _setTooltipRef = (ref: React.ElementRef<any>): void => {
    if (ref == null) {
      return;
    }
    this._tooltipRefs.set(ref.dataset.name, ref);
  };

  _onMouseOver = (e: SyntheticEvent<any>): void => {
    this._hoveredProviderName.next(e.currentTarget.dataset.name);
  };

  _onMouseOut = (): void => {
    this._hoveredProviderName.next(null);
  };
}
