"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
class FilteredMessagesReminder extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleClick = e => {
      e.preventDefault();
      this.props.onReset();
    }, _temp;
  }

  render() {
    const {
      filteredRecordCount
    } = this.props;

    if (filteredRecordCount === 0) {
      return null;
    }

    return React.createElement("div", {
      className: "console-filtered-reminder"
    }, React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("pre", null, filteredRecordCount, ' ', filteredRecordCount === 1 ? 'message is' : 'messages are', " hidden by filters.")), React.createElement("a", {
      href: "#",
      onClick: this.handleClick
    }, React.createElement("pre", null, "Show all messages.")));
  }

}

exports.default = FilteredMessagesReminder;