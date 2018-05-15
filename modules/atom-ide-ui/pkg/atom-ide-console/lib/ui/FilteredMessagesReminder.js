'use strict';Object.defineProperty(exports, "__esModule", { value: true });











var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}






class FilteredMessagesReminder extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.
    handleClick = e => {
      e.preventDefault();
      this.props.onReset();
    }, _temp;}

  render() {
    const { filteredRecordCount } = this.props;
    if (filteredRecordCount === 0) {
      return null;
    }

    return (
      _react.createElement('div', { className: 'console-filtered-reminder' },
        _react.createElement('div', { style: { flex: 1 } },
          _react.createElement('pre', null,
            filteredRecordCount, ' ',
            filteredRecordCount === 1 ? 'message is' : 'messages are', ' hidden by filters.')),



        _react.createElement('a', { href: '#', onClick: this.handleClick },
          _react.createElement('pre', null, 'Show all messages.'))));



  }}exports.default = FilteredMessagesReminder; /**
                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                 * All rights reserved.
                                                 *
                                                 * This source code is licensed under the BSD-style license found in the
                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                 *
                                                 *  strict
                                                 * @format
                                                 */