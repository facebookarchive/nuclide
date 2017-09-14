'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _react = _interopRequireWildcard(require('react'));

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

class CommandsSectionComponent extends _react.Component {

  shouldComponentUpdate() {
    return this._lastRenderCount !== (_process || _load_process()).loggedCalls.length;
  }

  render() {
    this._lastRenderCount = (_process || _load_process()).loggedCalls.length;
    return _react.createElement(
      'table',
      { className: 'table' },
      _react.createElement(
        'thead',
        null,
        _react.createElement(
          'th',
          { width: '10%' },
          'Time'
        ),
        _react.createElement(
          'th',
          { width: '10%' },
          'Duration (ms)'
        ),
        _react.createElement(
          'th',
          null,
          'Command'
        )
      ),
      _react.createElement(
        'tbody',
        null,
        (_process || _load_process()).loggedCalls.map((call, i) => _react.createElement(
          'tr',
          { key: i },
          _react.createElement(
            'td',
            null,
            call.time.toTimeString().replace(/ .+/, '')
          ),
          _react.createElement(
            'td',
            null,
            call.duration
          ),
          _react.createElement(
            'td',
            null,
            call.command
          )
        ))
      )
    );
  }
}
exports.default = CommandsSectionComponent;