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
  taskbarVisible: boolean,
  taskIsRunning: boolean,
  progress: ?number,
};

type State = {
  hoveredProviderName: ?string,
  secondsSinceMount: number,
  visible: boolean,
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
  _mountTimestamp: number = 0;

  state: State = {
    hoveredProviderName: null,
    secondsSinceMount: 0,
    visible: false,
  };

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
    if (this.state.visible && !prevState.visible) {
      this._startTimer();
    }
    if (!this.state.visible && prevState.visible) {
      this._stopTimer();
    }
    if (this.props.taskbarVisible) {
      if (this.props.taskIsRunning && !this.state.visible) {
        this.setState({visible: true});
      }
    } else {
      if (this.state.visible) {
        this.setState({visible: false});
      }
    }
  }

  componentWillUnmount() {
    this._stopTimer();
    this._disposables.dispose();
  }

  _startTimer(): void {
    this._stopTimer();
    this._mountTimestamp = Date.now();
    this._intervalID = setInterval(() => {
      this._tickUpdateSeconds();
    }, 100);
  }

  _stopTimer(): void {
    if (this._intervalID != null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }
  }

  _defaultTitle(): React.Node {
    return (
      <div>
        Running task...
        <span> {this.state.secondsSinceMount.toFixed(1)} </span>
        sec
      </div>
    );
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
    const clearButton = (
      <div
        className="close-icon"
        onClick={() => this.setState({visible: false})}
      />
    );
    if (!this.state.visible) {
      return null;
    }
    return (
      <div className="nuclide-taskbar-status-container">
        <FullWidthProgressBar
          progress={this.props.progress == null ? 0 : this.props.progress}
          visible={this.props.taskbarVisible}
        />
        <div className="nuclide-taskbar-status-providers-container">
          {this._renderProvider(
            serverStatus,
            this.props.taskbarVisible,
            this.state.hoveredProviderName != null,
          )}
          {clearButton}
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
          this._defaultTitle()
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
