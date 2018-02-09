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

import type {IEvaluatableExpression, IStackFrame, IProcess} from '../types';

import {Observable} from 'rxjs';
import * as React from 'react';
import classnames from 'classnames';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import nullthrows from 'nullthrows';
import {LazyNestedValueComponent} from 'nuclide-commons-ui/LazyNestedValueComponent';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import {Icon} from 'nuclide-commons-ui/Icon';
import {
  expressionAsEvaluationResultStream,
  fetchChildrenForLazyComponent,
} from '../utils';

type Props = {
  watchExpressions: Array<IEvaluatableExpression>,
  focusedStackFrame: ?IStackFrame,
  focusedProcess: ?IProcess,
  onAddWatchExpression: (expression: string) => void,
  onRemoveWatchExpression: (id: string) => void,
  onUpdateWatchExpression: (id: string, newExpression: string) => void,
};

type State = {
  rowBeingEdited: ?string,
};

export default class WatchExpressionComponent extends React.Component<
  Props,
  State,
> {
  coreCancelDisposable: ?IDisposable;
  _newExpressionEditor: ?AtomInput;
  _editExpressionEditor: ?AtomInput;
  _expansionStates: Map<
    string /* expression */,
    /* unique reference for expression */ Object,
  >;

  constructor(props: Props) {
    super(props);
    this._expansionStates = new Map();
    this.state = {
      rowBeingEdited: null,
    };
  }

  _getExpansionStateIdForExpression(expression: string): Object {
    let expansionStateId = this._expansionStates.get(expression);
    if (expansionStateId == null) {
      expansionStateId = {};
      this._expansionStates.set(expression, expansionStateId);
    }
    return expansionStateId;
  }

  removeExpression(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.props.onRemoveWatchExpression(id);
  }

  addExpression(expression: string): void {
    this.props.onAddWatchExpression(expression);
  }

  _onConfirmNewExpression = (): void => {
    const text = nullthrows(this._newExpressionEditor).getText();
    this.addExpression(text);
    nullthrows(this._newExpressionEditor).setText('');
  };

  _onConfirmExpressionEdit(id: string): void {
    const text = nullthrows(this._editExpressionEditor).getText();
    this.props.onUpdateWatchExpression(id, text);
    this._resetExpressionEditState();
  }

  _setRowBeingEdited(id: string): void {
    this.setState({
      rowBeingEdited: id,
    });
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
    }
    this.coreCancelDisposable = atom.commands.add('atom-workspace', {
      'core:cancel': () => this._resetExpressionEditState(),
    });
  }

  _resetExpressionEditState = (): void => {
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
      this.coreCancelDisposable = null;
    }
    this.setState({rowBeingEdited: null});
  };

  _renderExpression = (
    watchExpression: IEvaluatableExpression,
  ): React.Element<any> => {
    const {focusedProcess, focusedStackFrame} = this.props;
    const id = watchExpression.getId();
    let evalResult;
    if (id === this.state.rowBeingEdited) {
      return (
        <AtomInput
          className="nuclide-debugger-watch-expression-input"
          autofocus={true}
          startSelected={true}
          key={id}
          onConfirm={this._onConfirmExpressionEdit.bind(this, id)}
          onCancel={this._resetExpressionEditState}
          onBlur={this._resetExpressionEditState}
          ref={input => {
            this._editExpressionEditor = input;
          }}
          size="sm"
          initialValue={watchExpression.name}
        />
      );
    } else if (focusedProcess == null) {
      evalResult = Observable.of(null);
    } else {
      evalResult = expressionAsEvaluationResultStream(
        watchExpression,
        focusedProcess,
        focusedStackFrame,
        'watch',
      );
    }
    const ValueComponent = bindObservableAsProps(
      evalResult.map(evaluationResult => ({evaluationResult})),
      LazyNestedValueComponent,
    );
    return (
      <div
        className={classnames(
          'nuclide-debugger-expression-value-row',
          'nuclide-debugger-watch-expression-row',
        )}
        key={id}>
        <div
          className={classnames(
            'nuclide-debugger-expression-value-content',
            'nuclide-debugger-watch-expression-value-content',
          )}
          onDoubleClick={this._setRowBeingEdited.bind(this, id)}>
          <ValueComponent
            expression={watchExpression.name}
            fetchChildren={(fetchChildrenForLazyComponent: any)}
            simpleValueComponent={SimpleValueComponent}
            expansionStateId={this._getExpansionStateIdForExpression(
              watchExpression.name,
            )}
          />
        </div>
        <div className="nuclide-debugger-watch-expression-controls">
          <Icon
            icon="pencil"
            className="nuclide-debugger-watch-expression-control"
            onClick={this._setRowBeingEdited.bind(this, id)}
          />
          <Icon
            icon="x"
            className="nuclide-debugger-watch-expression-control"
            onClick={this.removeExpression.bind(this, id)}
          />
        </div>
      </div>
    );
  };

  render(): React.Node {
    const expressions = this.props.watchExpressions.map(this._renderExpression);
    const addNewExpressionInput = (
      <AtomInput
        className={classnames(
          'nuclide-debugger-watch-expression-input',
          'nuclide-debugger-watch-expression-add-new-input',
        )}
        onConfirm={this._onConfirmNewExpression}
        ref={input => {
          this._newExpressionEditor = input;
        }}
        size="sm"
        placeholderText="Add new watch expression"
      />
    );
    return (
      <div className="nuclide-debugger-expression-value-list">
        {expressions}
        {addNewExpressionInput}
      </div>
    );
  }
}
