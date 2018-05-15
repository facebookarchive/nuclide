'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =























FilterButton;var _Button;function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _react = _interopRequireWildcard(require('react'));var _GroupUtils;function _load_GroupUtils() {return _GroupUtils = _interopRequireWildcard(require('../GroupUtils'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */function FilterButton(props) {const { selected, group } = props;const displayName = (_GroupUtils || _load_GroupUtils()).getDisplayName(group);const title = props.selected ? `Hide ${displayName}` : `Show ${displayName}`;return _react.createElement((_Button || _load_Button()).Button, { icon: (_GroupUtils || _load_GroupUtils()).getIcon(group), size: (_Button || _load_Button()).ButtonSizes.SMALL, selected: selected, onClick: props.onClick, tooltip: { title } });


}