'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
} from 'react-for-atom';
import classnames from 'classnames';
import {AtomInput} from '../../nuclide-ui/lib/AtomInput';

export type WatchExpression = {
  expression: string;
  value: any;
};

type Props = {
  watchExpressions: Array<WatchExpression>;
  onUpdateExpressions: (watchExpressions: Array<WatchExpression>) => void;
};

export class WatchExpressionComponent extends React.Component {
  props: Props;
  state: {
    rowBeingEdited: ?number;
  };
  coreCancelDisposable: ?IDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._renderExpression = this._renderExpression.bind(this);
    (this: any)._onConfirmNewExpression = this._onConfirmNewExpression.bind(this);
    (this: any)._resetExpressionEditState = this._resetExpressionEditState.bind(this);
    (this: any)._onEditorCancel = this._onEditorCancel.bind(this);
    (this: any)._onEditorBlur = this._onEditorBlur.bind(this);
    this.state = {
      rowBeingEdited: null,
    };
  }

  removeExpression(index: number, event: MouseEvent): void {
    event.stopPropagation();
    const watchExpressions = this.props.watchExpressions.slice();
    watchExpressions.splice(index, 1);
    this.props.onUpdateExpressions(watchExpressions);
  }

  addExpression(expression: string): void {
    this.props.onUpdateExpressions([
      ...this.props.watchExpressions,
      {
        expression,
        value: '<not available>',
      },
    ]);
  }

  _onConfirmNewExpression(): void {
    const text = this.refs.newExpressionEditor.getText();
    this.addExpression(text);
    this.refs.newExpressionEditor.setText('');
  }

  _onConfirmExpressionEdit(index: number): void {
    const text = this.refs.editExpressionEditor.getText();
    const watchExpressions = this.props.watchExpressions.slice();
    watchExpressions[index] = {
      ...watchExpressions[index],
      expression: text,
    };
    this.props.onUpdateExpressions(watchExpressions);
    this._resetExpressionEditState();
  }

  _onEditorCancel(): void {
    this._resetExpressionEditState();
  }

  _onEditorBlur(): void {
    this._resetExpressionEditState();
  }

  _setRowBeingEdited(index: number): void {
    this.setState({
      rowBeingEdited: index,
    });
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
    }
    this.coreCancelDisposable = atom.commands.add(
      'atom-workspace',
      {
        'core:cancel': () => this._resetExpressionEditState(),
      },
    );
    setTimeout(() => {
      if (this.refs.editExpressionEditor) {
        this.refs.editExpressionEditor.focus();
      }
    }, 16);
  }

  _resetExpressionEditState(): void {
    if (this.coreCancelDisposable) {
      this.coreCancelDisposable.dispose();
      this.coreCancelDisposable = null;
    }
    this.setState({rowBeingEdited: null});
  }

  _renderExpression(watchExpression: WatchExpression, index: number): React.Element {
    const {
      expression,
      value,
    } = watchExpression;
    return (
      index === this.state.rowBeingEdited
        ? <AtomInput
            className="nuclide-debugger-atom-watch-expression-input"
            key={index}
            onConfirm={this._onConfirmExpressionEdit.bind(this, index)}
            onCancel={this._onEditorCancel}
            onBlur={this._onEditorBlur}
            ref="editExpressionEditor"
            size="sm"
            initialValue={expression}
          />
        : <div
            className="nuclide-debugger-atom-watch-expression-row"
            key={index}
            onMouseDown={this._setRowBeingEdited.bind(this, index)}>
            <div>
              <span className="nuclide-debugger-atom-watch-expression">
                {expression}
              </span>
              <span className="nuclide-debugger-atom-watch-expression-value">{value}</span>
            </div>
            <i
              className="icon icon-x nuclide-debugger-atom-watch-expression-xout"
              onMouseDown={this.removeExpression.bind(this, index)}
            />
          </div>
    );
  }

  render(): ?React.Element {
    const {
      watchExpressions,
    } = this.props;
    const expressions = watchExpressions.map(this._renderExpression);
    const addNewExpressionInput = (
      <AtomInput
        className={classnames(
          'nuclide-debugger-atom-watch-expression-input',
          'nuclide-debugger-atom-watch-expression-add-new-input',
        )}
        onConfirm={this._onConfirmNewExpression}
        ref="newExpressionEditor"
        size="sm"
        placeholderText="add new watch expression"
      />
    );
    return (
      <div className="nuclide-debugger-atom-watch-expression-list">
        <h3>Watch Expressions</h3>
        {expressions}
        {addNewExpressionInput}
      </div>
    );
  }
}
