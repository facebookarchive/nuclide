"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
    return data;
  };

  return data;
}

function _SettingsPaneItem() {
  const data = _interopRequireWildcard(require("./SettingsPaneItem"));

  _SettingsPaneItem = function () {
    return data;
  };

  return data;
}

var _querystring = _interopRequireDefault(require("querystring"));

var React = _interopRequireWildcard(require("react"));

var _url = _interopRequireDefault(require("url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
function _default(uri) {
  if (uri.startsWith(_SettingsPaneItem().WORKSPACE_VIEW_URI)) {
    let initialFilter = '';

    const {
      query
    } = _url.default.parse(uri);

    if (query != null) {
      const params = _querystring.default.parse(query);

      if (typeof params.filter === 'string') {
        initialFilter = params.filter;
      }
    }

    return (0, _viewableFromReactElement().viewableFromReactElement)(React.createElement(_SettingsPaneItem().default, {
      initialFilter: initialFilter
    }));
  }
}