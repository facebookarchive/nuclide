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

import {FilterThreadConditions} from '../vsp/FilterThreadConditions';

import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import * as React from 'react';

type Props = {
  +dialogCloser: () => void,
  updateFilters: (filter: FilterThreadConditions) => void,
  currentFilterConditions: ?FilterThreadConditions,
};

type State = {
  onlyPausedThreadsChecked: boolean,
};

export default class DebuggerFilterThreadsUI extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _nameFilter: ?AtomInput;
  _idFilter: ?AtomInput;
  initialRendering: boolean;

  constructor(props: Props) {
    super(props);
    const {currentFilterConditions} = this.props;
    this.state = {
      onlyPausedThreadsChecked:
        currentFilterConditions != null
          ? currentFilterConditions.onlyPausedThreads
          : false,
    };
    this.initialRendering = true;
    this._disposables = new UniversalDisposable();
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'core:cancel',
        this.props.dialogCloser,
      ),
    );
  }

  _filterThreads(): void {
    const {onlyPausedThreadsChecked} = this.state;
    const conditions = new FilterThreadConditions(
      this._nameFilter != null ? this._nameFilter.getText() : '',
      this._idFilter != null ? this._idFilter.getText() : '',
      onlyPausedThreadsChecked,
    );
    this.props.updateFilters(conditions);
    this.props.dialogCloser();
  }

  render(): React.Node {
    const {currentFilterConditions} = this.props;
    const initRendering = this.initialRendering;
    this.initialRendering = false;
    return (
      <div>
        <div>
          <h1 className="debugger-bp-config-header">Filter Threads By...</h1>
        </div>
        <div>
          <label>Name:</label>
        </div>
        <div className="block">
          <AtomInput
            placeholderText="(e.g. main)"
            value={
              initRendering && currentFilterConditions != null
                ? currentFilterConditions.name
                : this._nameFilter != null
                  ? this._nameFilter.getText()
                  : ''
            }
            size="sm"
            ref={input => {
              this._nameFilter = input;
            }}
            autofocus={false}
          />
        </div>
        <div>
          <label>Thread ID:</label>
        </div>
        <div className="block">
          <AtomInput
            placeholderText="Comma-separated list (e.g. 1, 13, 15)"
            value={
              initRendering && currentFilterConditions != null
                ? currentFilterConditions.stringOfIDs
                : this._idFilter != null
                  ? this._idFilter.getText()
                  : ''
            }
            size="sm"
            ref={input => {
              this._idFilter = input;
            }}
            autofocus={false}
          />
        </div>
        <div className="block">
          <div>
            <Checkbox
              onChange={() => {
                const {onlyPausedThreadsChecked} = this.state;
                this.setState({
                  onlyPausedThreadsChecked: !onlyPausedThreadsChecked,
                });
              }}
              checked={this.state.onlyPausedThreadsChecked}
              label="Show only paused threads"
            />
          </div>
        </div>
        <div className="debugger-bp-config-actions">
          <ButtonGroup>
            <Button onClick={this.props.dialogCloser}>Cancel</Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              onClick={this._filterThreads.bind(this)}>
              Update
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
