"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _RegExpFilter() {
  const data = _interopRequireWildcard(require("./RegExpFilter"));

  _RegExpFilter = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class Example extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      text: '',
      isRegExp: false,
      invalid: false
    }, this._handleChange = change => {
      const {
        invalid
      } = (0, _RegExpFilter().getFilterPattern)(change.text, change.isRegExp);
      this.setState(Object.assign({}, change, {
        invalid
      }));
    }, _temp;
  }

  render() {
    const {
      text,
      isRegExp,
      invalid
    } = this.state;
    return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_RegExpFilter().default, {
      value: {
        text,
        isRegExp,
        invalid
      },
      onChange: this._handleChange
    })));
  }

}

var _default = {
  sectionName: 'RegExp Filter',
  description: 'An input for filtering that allows the use of regular expressions.',
  examples: [{
    title: 'RegExpFilter',
    component: Example
  }]
};
exports.default = _default;