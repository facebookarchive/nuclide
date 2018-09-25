"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DiagnosticsTableNux;

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _TextEditorBanner() {
  const data = require("../../../../../nuclide-commons-ui/TextEditorBanner");

  _TextEditorBanner = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
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
function DiagnosticsTableNux(props) {
  return React.createElement(_TextEditorBanner().Notice, {
    messageType: "info",
    contentStyle: {
      alignItems: 'center'
    }
  }, React.createElement("div", {
    style: {
      marginRight: 16
    }
  }, React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "You can open/close this table by clicking the", ' ', React.createElement(CenteredIcon, {
    icon: "nuclicon-error"
  }), " and", ' ', React.createElement(CenteredIcon, {
    icon: "nuclicon-warning"
  }), " icons in the bottom left. Note, we've only auto opened it", ' ', React.createElement("strong", null, React.createElement("em", null, "one time")), ' ', "to help you discover it. Thanks!")), React.createElement(_Button().Button, {
    buttonType: "PRIMARY",
    onClick: props.onDismiss
  }, "Got it"));
}

function CenteredIcon({
  icon
}) {
  return React.createElement(_Icon().Icon, {
    icon: icon,
    style: {
      marginLeft: 4,
      verticalAlign: 'middle'
    }
  });
}