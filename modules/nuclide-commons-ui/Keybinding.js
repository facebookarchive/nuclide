'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =


















Keybinding;var _react = _interopRequireDefault(require('react'));var _humanizeKeystroke;function _load_humanizeKeystroke() {return _humanizeKeystroke = _interopRequireDefault(require('../nuclide-commons/humanizeKeystroke'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                *  strict
                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                */function Keybinding({ keystrokes }) {return _react.default.createElement('kbd', { className: 'key-binding' }, (0, (_humanizeKeystroke || _load_humanizeKeystroke()).default)(keystrokes, process.platform));}