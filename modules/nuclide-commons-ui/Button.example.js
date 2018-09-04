"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("./ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _ButtonToolbar() {
  const data = require("./ButtonToolbar");

  _ButtonToolbar = function () {
    return data;
  };

  return data;
}

function _Block() {
  const data = require("./Block");

  _Block = function () {
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
 * 
 * @format
 */
const ButtonSizeExample = () => React.createElement(_Block().Block, null, React.createElement(_Button().Button, {
  className: "inline-block",
  size: "EXTRA_SMALL"
}, "extra_small"), React.createElement(_Button().Button, {
  className: "inline-block",
  size: "SMALL"
}, "small"), React.createElement(_Button().Button, {
  className: "inline-block"
}, "regular"), React.createElement(_Button().Button, {
  className: "inline-block",
  size: "LARGE"
}, "large"));

const ButtonDisabledExample = () => React.createElement(_Block().Block, null, React.createElement(_Button().Button, {
  className: "inline-block"
}, "enabled"), React.createElement(_Button().Button, {
  className: "inline-block",
  disabled: true
}, "disabled"));

const ButtonColorExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
  buttonType: "PRIMARY"
}, "primary"), React.createElement(_Button().Button, {
  buttonType: "INFO"
}, "info"), React.createElement(_Button().Button, {
  buttonType: "SUCCESS"
}, "success"), React.createElement(_Button().Button, {
  buttonType: "WARNING"
}, "warning"), React.createElement(_Button().Button, {
  buttonType: "ERROR"
}, "error"))), React.createElement(_Block().Block, null, React.createElement("p", null, "selected:"), React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
  selected: true,
  buttonType: "PRIMARY"
}, "primary"), React.createElement(_Button().Button, {
  selected: true,
  buttonType: "INFO"
}, "info"), React.createElement(_Button().Button, {
  selected: true,
  buttonType: "SUCCESS"
}, "success"), React.createElement(_Button().Button, {
  selected: true,
  buttonType: "WARNING"
}, "warning"), React.createElement(_Button().Button, {
  selected: true,
  buttonType: "ERROR"
}, "error"))));

const ButtonIconExample = () => React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
  icon: "gear"
}), React.createElement(_Button().Button, {
  icon: "cloud-download"
}), React.createElement(_Button().Button, {
  icon: "code"
}), React.createElement(_Button().Button, {
  icon: "check"
}), React.createElement(_Button().Button, {
  icon: "device-mobile"
}), React.createElement(_Button().Button, {
  icon: "alert"
})));

const ButtonGroupExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, {
  size: "EXTRA_SMALL"
}, React.createElement(_Button().Button, {
  buttonType: "SUCCESS"
}, "extra small"), React.createElement(_Button().Button, null, "button"), React.createElement(_Button().Button, null, "group"))), React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, {
  size: "SMALL"
}, React.createElement(_Button().Button, {
  buttonType: "SUCCESS"
}, "small"), React.createElement(_Button().Button, null, "button"), React.createElement(_Button().Button, null, "group"))), React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
  buttonType: "SUCCESS"
}, "regular"), React.createElement(_Button().Button, null, "button"), React.createElement(_Button().Button, null, "group"))), React.createElement(_Block().Block, null, React.createElement(_ButtonGroup().ButtonGroup, {
  size: "LARGE"
}, React.createElement(_Button().Button, {
  buttonType: "SUCCESS"
}, "large"), React.createElement(_Button().Button, null, "button"), React.createElement(_Button().Button, null, "group"))));

const ButtonToolbarExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_ButtonToolbar().ButtonToolbar, null, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, null, "ButtonGroup"), React.createElement(_Button().Button, null, "in a"), React.createElement(_Button().Button, null, "toolbar")), React.createElement(_Button().Button, null, "single buttons"), React.createElement(_Button().Button, null, "in toolbar"))));

const ButtonExamples = {
  sectionName: 'Buttons',
  description: 'For clicking things.',
  examples: [{
    title: 'Button sizes',
    component: ButtonSizeExample
  }, {
    title: 'Disabled/enabled',
    component: ButtonDisabledExample
  }, {
    title: 'Button colors',
    component: ButtonColorExample
  }, {
    title: 'Buttons with icons',
    component: ButtonIconExample
  }, {
    title: 'Button Group',
    component: ButtonGroupExample
  }, {
    title: 'Button Toolbar',
    component: ButtonToolbarExample
  }]
};
exports.ButtonExamples = ButtonExamples;