'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class HomeFeatureComponent extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._tryIt = () => {
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
    }, _temp;
  }

  render() {
    const { title, command } = this.props;
    return _react.createElement(
      'details',
      { className: 'nuclide-home-card' },
      _react.createElement(
        'summary',
        {
          className: `nuclide-home-summary icon icon-${this.props.icon}` },
        title,
        // flowlint-next-line sketchy-null-string:off
        command ? _react.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'pull-right nuclide-home-tryit',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._tryIt },
          'Try it'
        ) : null
      ),
      _react.createElement(
        'div',
        { className: 'nuclide-home-detail' },
        this.props.description
      )
    );
  }
}
exports.default = HomeFeatureComponent;