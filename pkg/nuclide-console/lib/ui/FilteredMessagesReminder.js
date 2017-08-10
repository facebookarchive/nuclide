'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FilteredMessagesReminder extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleClick = e => {
      e.preventDefault();
      this.props.onReset();
    }, _temp;
  }

  render() {
    const { filteredRecordCount } = this.props;
    if (filteredRecordCount === 0) {
      return null;
    }

    return _react.default.createElement(
      'div',
      { className: 'nuclide-console-filtered-reminder' },
      _react.default.createElement(
        'div',
        { style: { flex: 1 } },
        _react.default.createElement(
          'pre',
          null,
          filteredRecordCount,
          ' ',
          filteredRecordCount === 1 ? 'message is' : 'messages are',
          ' hidden by filters.'
        )
      ),
      _react.default.createElement(
        'a',
        { href: '#', onClick: this.handleClick },
        _react.default.createElement(
          'pre',
          null,
          'Show all messages.'
        )
      )
    );
  }
}
exports.default = FilteredMessagesReminder; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */