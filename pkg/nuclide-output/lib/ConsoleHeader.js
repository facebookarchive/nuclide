'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

type Props = {
  clear: () => void;
};

export default class ConsoleHeader extends React.Component<void, Props, void> {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  render(): ?ReactElement {
    return (
      <div className="nuclide-output-header padded">
        <button
          className="btn btn-sm icon inline-block btn-secondary pull-right"
          onClick={this._handleClearButtonClick}>
          Clear
        </button>
      </div>
    );
  }


  _handleClearButtonClick(event: SyntheticMouseEvent): void {
    this.props.clear();
  }

}
