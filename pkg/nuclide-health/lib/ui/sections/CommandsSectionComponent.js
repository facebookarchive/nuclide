'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class CommandsSectionComponent extends _react.default.Component {

  shouldComponentUpdate() {
    return this._lastRenderCount !== (_process || _load_process()).loggedCalls.length;
  }

  render() {
    this._lastRenderCount = (_process || _load_process()).loggedCalls.length;
    return _react.default.createElement(
      'table',
      { className: 'table' },
      _react.default.createElement(
        'thead',
        null,
        _react.default.createElement(
          'th',
          { width: '10%' },
          'Time'
        ),
        _react.default.createElement(
          'th',
          { width: '10%' },
          'Duration (ms)'
        ),
        _react.default.createElement(
          'th',
          null,
          'Command'
        )
      ),
      _react.default.createElement(
        'tbody',
        null,
        (_process || _load_process()).loggedCalls.map((call, i) => _react.default.createElement(
          'tr',
          { key: i },
          _react.default.createElement(
            'td',
            null,
            call.time.toTimeString().replace(/ .+/, '')
          ),
          _react.default.createElement(
            'td',
            null,
            call.duration
          ),
          _react.default.createElement(
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