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

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';

type Props = {
  selectedText: string,
  submitNewName: (string | void) => void,
};

type State = {
  newName: string,
};

export default class RenameComponent extends React.Component<Props, State> {
  _atomInput: ?AtomInput;

  constructor(props: Props) {
    super(props);

    this.state = {
      newName: this.props.selectedText,
    };
  }

  componentDidMount() {
    this.highlightTextWithin();
  }

  highlightTextWithin = (): void => {
    if (this._atomInput == null) {
      return;
    }
    const editor = this._atomInput.getTextEditor();
    editor.selectAll();
  };

  _handleSubmit = (event: $FlowFixMe): void => {
    event.preventDefault();
    const {newName} = this.state;
    const {submitNewName} = this.props;

    return newName === '' ? submitNewName() : submitNewName(newName);
  };

  _handleChange = (text: string): void => {
    this.setState({newName: text});
  };

  _handleBlur = (event: Event): void => {
    this.props.submitNewName();
  };

  render(): React.Node {
    // TODO: Have a min-width, but expand the actual width as necessary based on the length of the selected word
    //      (What VSCode does)
    const widthStyle = {
      minWidth: '150px',
    };
    return (
      <AtomInput
        ref={atomInput => (this._atomInput = atomInput)}
        style={widthStyle}
        autofocus={true}
        value={this.state.newName}
        onDidChange={this._handleChange}
        onBlur={this._handleBlur}
        onConfirm={this._handleSubmit}
      />
    );
  }
}
