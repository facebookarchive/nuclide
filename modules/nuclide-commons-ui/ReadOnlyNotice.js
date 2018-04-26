'use strict';Object.defineProperty(exports, "__esModule", { value: true });











var _react = _interopRequireWildcard(require('react'));var _TextEditorBanner;
function _load_TextEditorBanner() {return _TextEditorBanner = require('./TextEditorBanner');}var _Button;
function _load_Button() {return _Button = require('./Button');}var _Message;
function _load_Message() {return _Message = require('./Message');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                    * All rights reserved.
                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                    * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                    * 
                                                                                                                                                                                                                                                                                                                                    * @format
                                                                                                                                                                                                                                                                                                                                    */class ReadOnlyNotice extends _react.Component {render() {
    let editAnywayButton;

    if (this.props.canEditAnyway) {
      editAnywayButton =
      _react.createElement((_Button || _load_Button()).Button, { buttonType: (_Button || _load_Button()).ButtonTypes.INFO, onClick: this.props.onEditAnyway }, 'Edit Anyway');



    }

    const dismissButton =
    _react.createElement((_Button || _load_Button()).Button, { buttonType: (_Button || _load_Button()).ButtonTypes.INFO, onClick: this.props.onDismiss }, 'Dismiss');




    return (
      _react.createElement((_TextEditorBanner || _load_TextEditorBanner()).Notice, { messageType: (_Message || _load_Message()).MessageTypes.info },
        _react.createElement('span', null,
          _react.createElement('strong', null, 'This is a read-only file.'),
          _react.createElement('br', null),
          this.props.detailedMessage),

        _react.createElement('div', null,
          editAnywayButton,
          dismissButton)));



  }}exports.default = ReadOnlyNotice;