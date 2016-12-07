'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

class HomeFeatureComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._tryIt = this._tryIt.bind(this);
  }

  _tryIt() {
    const { command } = this.props;
    if (command == null) {
      return;
    }
    switch (typeof command) {
      case 'string':
        atom.commands.dispatch(atom.views.getView(atom.workspace), command);
        return;
      case 'function':
        command();
        return;
      default:
        throw new Error('Invalid command value');
    }
  }

  render() {
    const { title, command } = this.props;
    const iconset = this.props.iconset || 'icon';
    return _reactForAtom.React.createElement(
      'details',
      { className: 'nuclide-home-card' },
      _reactForAtom.React.createElement(
        'summary',
        { className: `nuclide-home-summary icon ${ iconset }-${ this.props.icon }` },
        title,
        command ? _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'pull-right nuclide-home-tryit',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._tryIt },
          'Try it'
        ) : null
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-home-detail' },
        this.props.description
      )
    );
  }
}

module.exports = HomeFeatureComponent;