'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _HandlesTableComponent;

function _load_HandlesTableComponent() {
  return _HandlesTableComponent = _interopRequireDefault(require('./HandlesTableComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ActiveHandlesSectionComponent = class ActiveHandlesSectionComponent extends _reactForAtom.React.Component {

  render() {
    if (!this.props.activeHandlesByType || Object.keys(this.props.activeHandlesByType).length === 0) {
      return _reactForAtom.React.createElement('div', null);
    }

    // Note that widthPercentage properties should add up to 90 since the ID column always adds 10.
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement((_HandlesTableComponent || _load_HandlesTableComponent()).default, {
        key: 2,
        title: 'TLS Sockets',
        handles: this.props.activeHandlesByType.tlssocket,
        keyed: socket => socket.localPort,
        columns: [{
          title: 'Host',
          value: socket => socket._host || socket.remoteAddress,
          widthPercentage: 70
        }, {
          title: 'Read',
          value: socket => socket.bytesRead,
          widthPercentage: 10
        }, {
          title: 'Written',
          value: socket => socket.bytesWritten,
          widthPercentage: 10
        }]
      }),
      _reactForAtom.React.createElement((_HandlesTableComponent || _load_HandlesTableComponent()).default, {
        key: 3,
        title: 'Other handles',
        handles: this.props.activeHandlesByType.other,
        keyed: (handle, h) => h,
        columns: [{
          title: 'Type',
          value: handle => handle.constructor.name,
          widthPercentage: 90
        }]
      })
    );
  }
};
exports.default = ActiveHandlesSectionComponent;
module.exports = exports['default'];