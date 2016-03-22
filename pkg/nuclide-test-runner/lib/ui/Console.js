'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {AtomTextEditor} = require('../../../nuclide-ui/lib/AtomTextEditor');
const {React} = require('react-for-atom');

const {PropTypes} = React;

class Console extends React.Component {
  static propTypes = {
    textBuffer: PropTypes.object.isRequired,
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
