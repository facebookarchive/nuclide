'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Message = exports.MessageTypes = undefined;var _classnames;











function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}
var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                      *  strict
                                                                                                                                                                                                                                                                                                                                                                                                                      * @format
                                                                                                                                                                                                                                                                                                                                                                                                                      */const MessageTypes = exports.MessageTypes = Object.freeze({
  default: 'default',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error' });


const MessageTypeClassNames = Object.freeze({
  default: 'nuclide-ui-message-default',
  error: 'nuclide-ui-message-error',
  info: 'nuclide-ui-message-info',
  success: 'nuclide-ui-message-success',
  warning: 'nuclide-ui-message-warning' });


const Message = exports.Message = props => {
  const { className, children, type } = props;
  const resolvedType = type == null ? MessageTypes.default : type;
  const newClassName = (0, (_classnames || _load_classnames()).default)(
  className,
  'nuclide-ui-message',
  MessageTypeClassNames[resolvedType]);

  return _react.createElement('div', { className: newClassName }, children);
};