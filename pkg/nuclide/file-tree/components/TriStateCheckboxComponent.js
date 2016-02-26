'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

import {React} from 'react-for-atom';

type Props = {
  checkedStatus: 'checked' | 'clear' | 'partial';
  onClick: (event: Event) => void;
};

export class TriStateCheckboxComponent extends React.Component {
  props: Props;

  render(): React.Element {
    return (
      <svg
        version="1.1"
        viewBox="0 0 100 100"
        className="nuclide-file-tree-checkbox"
        width="1.5em"
        onClick={this.props.onClick}>
        <path
          className="nuclide-file-tree-checkbox-path"
          d="M 10 10 L 90 10 L 90 90 L 10 90 z"
          strokeWidth="10"
          fill="none"
        />
        {this._renderCheckedPath()}
      </svg>
    );
  }

  _renderCheckedPath(): ?React.Element {
    if (this.props.checkedStatus === 'clear') {
      return;
    }

    if (this.props.checkedStatus === 'checked') {
      return (
        <path
          className="nuclide-file-tree-checkbox-checked"
          d="M 25 40 L 45 65 L 80 10"
          strokeWidth="15"
          fill="none"
        />
      );
    }

    return (
      <path
        className="nuclide-file-tree-checkbox-partial"
        d="M 25 50 L 75 50"
        strokeWidth="15"
        fill="none"
      />
    );
  }
}
