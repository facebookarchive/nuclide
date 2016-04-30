'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {AtomTextEditor} from '../../../nuclide-ui/lib/AtomTextEditor';
import {React} from 'react-for-atom';

class Console extends React.Component {
  static propTypes = {
    textBuffer: React.PropTypes.object.isRequired,
  };

  render() {
    return (
      <AtomTextEditor
        gutterHidden={true}
        path=".ansi"
        readOnly={true}
        textBuffer={this.props.textBuffer}
      />
    );
  }
}

module.exports = Console;
