'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomTextEditor = require('nuclide-ui-atom-text-editor');
var React = require('react-for-atom');

var {PropTypes} = React;

class Console extends React.Component {

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

Console.propTypes = {
  textBuffer: PropTypes.object.isRequired,
};

module.exports = Console;
