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
class FilterReminder extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleClick = e => {
      e.preventDefault();
      this.props.onReset();
    }, _temp;
  }

  render() {
    var _this$props$noun, _this$props$nounPlura;

    const {
      filteredRecordCount
    } = this.props;

    if (filteredRecordCount === 0) {
      return null;
    }

    const noun = (_this$props$noun = this.props.noun) !== null && _this$props$noun !== void 0 ? _this$props$noun : 'item';
    const nounPlural = (_this$props$nounPlura = this.props.nounPlural) !== null && _this$props$nounPlura !== void 0 ? _this$props$nounPlura : `${noun}s`;
    return React.createElement("div", {
      className: "nuclide-filter-reminder"
    }, React.createElement("div", {
      className: "nuclide-filter-reminder-message"
    }, React.createElement("pre", null, filteredRecordCount, ' ', filteredRecordCount === 1 ? `${noun} is` : `${nounPlural} are`, ' ', "hidden by filters.")), React.createElement("a", {
      href: "#",
      onClick: this.handleClick
    }, React.createElement("pre", null, "Show all ", nounPlural)));
  }

}

exports.default = FilterReminder;