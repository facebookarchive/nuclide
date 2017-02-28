'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _process;

function _load_process() {
  return _process = require('../../../../commons-node/process');
}

var _reactForAtom = require('react-for-atom');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class CommandsSectionComponent extends _reactForAtom.React.Component {

  shouldComponentUpdate() {
    return this._lastRenderCount !== (_process || _load_process()).loggedCalls.length;
  }

  render() {
    this._lastRenderCount = (_process || _load_process()).loggedCalls.length;
    return _reactForAtom.React.createElement(
      'table',
      { className: 'table' },
      _reactForAtom.React.createElement(
        'thead',
        null,
        _reactForAtom.React.createElement(
          'th',
          { width: '10%' },
          'Time'
        ),
        _reactForAtom.React.createElement(
          'th',
          { width: '10%' },
          'Duration (ms)'
        ),
        _reactForAtom.React.createElement(
          'th',
          null,
          'Command'
        )
      ),
      _reactForAtom.React.createElement(
        'tbody',
        null,
        (_process || _load_process()).loggedCalls.map((call, i) => _reactForAtom.React.createElement(
          'tr',
          { key: i },
          _reactForAtom.React.createElement(
            'td',
            null,
            call.time.toTimeString().replace(/ .+/, '')
          ),
          _reactForAtom.React.createElement(
            'td',
            null,
            call.duration
          ),
          _reactForAtom.React.createElement(
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