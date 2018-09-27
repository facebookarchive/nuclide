"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PulseButtonExample = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _PulseButtonWithTooltip() {
  const data = _interopRequireDefault(require("./PulseButtonWithTooltip"));

  _PulseButtonWithTooltip = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  render() {
    return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement("div", {
      style: {
        height: 100,
        width: '100%',
        display: 'flex'
      }
    }, React.createElement(_PulseButtonWithTooltip().default, {
      ariaLabel: "New feature!",
      wrapperStyle: {
        margin: 'auto'
      },
      tooltipText: "Look I'm a tooltip!"
    }))));
  }

}

const PulseButtonExample = {
  sectionName: 'PulseButton',
  description: 'A glowing button that often triggers a dismissable tooltip',
  examples: [{
    title: 'PulseButton',
    component: Example
  }]
};
exports.PulseButtonExample = PulseButtonExample;