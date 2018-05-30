'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../../modules/nuclide-commons-ui/AtomTextEditor');
}

var _Message;

function _load_Message() {
  return _Message = require('../../../modules/nuclide-commons-ui/Message');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RemoteTextEditorPlaceholderComponent extends _react.PureComponent {
  render() {
    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(this.props.uri);
    return _react.createElement(
      'div',
      { className: 'nuclide-remote-text-editor-placeholder' },
      _react.createElement(
        (_Message || _load_Message()).Message,
        {
          className: 'nuclide-remote-text-editor-placeholder-header',
          type: (_Message || _load_Message()).MessageTypes.info },
        _react.createElement(
          'strong',
          null,
          'This is a read-only preview.'
        ),
        _react.createElement('br', null),
        'Please reconnect to the remote host ',
        hostname,
        ' to edit or save this file.'
      ),
      _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        readOnly: true,
        textBuffer: new _atom.TextBuffer({
          filePath: this.props.uri,
          text: this.props.contents
        })
      })
    );
  }
}
exports.default = RemoteTextEditorPlaceholderComponent; /**
                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                         * All rights reserved.
                                                         *
                                                         * This source code is licensed under the license found in the LICENSE file in
                                                         * the root directory of this source tree.
                                                         *
                                                         * 
                                                         * @format
                                                         */