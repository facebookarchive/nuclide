/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {IBreakpoint, IRawBreakpoint, IDebugService} from '../types';

import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import * as React from 'react';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import {Modal} from 'nuclide-commons-ui/Modal';
import {Observable} from 'rxjs';
import {track} from 'nuclide-commons/analytics';
import {AnalyticsEvents} from '../constants';

type PropsType = {
  onDismiss: () => void,
  breakpoint: IBreakpoint,
  service: IDebugService,
};

type StateType = {
  bpId: string,
};

export default class BreakpointConfigComponent extends React.Component<
  PropsType,
  StateType,
> {
  _condition: ?AtomInput;
  props: PropsType;
  state: StateType;
  _disposables: UniversalDisposable;

  constructor(props: PropsType) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      bpId: this.props.breakpoint.getId(),
    };

    const model = this.props.service.getModel();
    this._disposables.add(
      model.onDidChangeBreakpoints(() => {
        const breakpoint = model
          .getBreakpoints()
          .filter(bp => bp.getId() === this.state.bpId);
        if (breakpoint == null) {
          // Breakpoint no longer exists.
          this.props.onDismiss();
        }
        this.forceUpdate();
      }),
    );
  }

  componentDidMount(): void {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_CONFIG_UI_SHOW, {
      fileExtension: nuclideUri.extname(this.props.breakpoint.uri),
    });
    this._disposables.add(
      atom.commands.add('atom-workspace', 'core:cancel', this.props.onDismiss),
      atom.commands.add(
        'atom-workspace',
        'core:confirm',
        this._updateBreakpoint.bind(this),
      ),
      Observable.timer(100).subscribe(() => {
        if (this._condition != null) {
          this._condition.focus();
        }
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  async _updateBreakpoint(): Promise<void> {
    const {breakpoint, service} = this.props;
    const condition = nullthrows(this._condition)
      .getText()
      .trim();
    if (condition === (breakpoint.condition || '')) {
      this.props.onDismiss();
      return;
    }

    await service.removeBreakpoints(breakpoint.getId());

    const bp: IRawBreakpoint = {
      line: breakpoint.line,
      column: breakpoint.column,
      enabled: breakpoint.enabled,
    };
    if (condition !== '') {
      bp.condition = condition;
    }

    await service.addBreakpoints(breakpoint.uri, [bp]);
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_UPDATE_CONDITION, {
      path: breakpoint.uri,
      line: breakpoint.line,
      condition,
      fileExtension: nuclideUri.extname(breakpoint.uri),
    });
    this.props.onDismiss();
  }

  render(): React.Node {
    return (
      <Modal onDismiss={this.props.onDismiss}>
        <div className="padded debugger-bp-dialog">
          <h1 className="debugger-bp-config-header">Edit breakpoint</h1>
          <div className="block">
            <label>
              Breakpoint at {nuclideUri.basename(this.props.breakpoint.uri)}
              :
              {this.props.breakpoint.endLine != null
                ? this.props.breakpoint.endLine
                : this.props.breakpoint.line}
            </label>
          </div>
          <div className="block">
            <Checkbox
              onChange={isChecked => {
                track(AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE_ENABLED, {
                  enabled: isChecked,
                });
                this.props.service.enableOrDisableBreakpoints(
                  isChecked,
                  this.props.breakpoint,
                );
              }}
              checked={this.props.breakpoint.enabled}
              label="Enable breakpoint"
            />
          </div>
          <div className="block">
            <AtomInput
              placeholderText="Breakpoint hit condition..."
              value={this.props.breakpoint.condition || ''}
              size="sm"
              ref={input => {
                this._condition = input;
              }}
              autofocus={true}
            />
          </div>
          <label>
            This expression will be evaluated each time the corresponding line
            is hit, but the debugger will only break execution if the expression
            evaluates to true.
          </label>
          <div className="debugger-bp-config-actions">
            <ButtonGroup>
              <Button onClick={this.props.onDismiss}>Cancel</Button>
              <Button
                buttonType={ButtonTypes.PRIMARY}
                onClick={this._updateBreakpoint.bind(this)}>
                Update
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Modal>
    );
  }
}
