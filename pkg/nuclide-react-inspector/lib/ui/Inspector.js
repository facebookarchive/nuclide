'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _Webview;

function _load_Webview() {
  return _Webview = require('../../../nuclide-ui/Webview');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Inspector = class Inspector extends _reactForAtom.React.Component {
  constructor() {
    super();
    this._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
  }

  getTitle() {
    return 'React Inspector';
  }

  render() {
    return _reactForAtom.React.createElement((_Webview || _load_Webview()).Webview, {
      style: { width: '100%', height: '100%' },
      nodeintegration: true,
      className: 'native-key-bindings',
      onDidFinishLoad: this._handleDidFinishLoad,
      src: 'atom://nuclide/pkg/nuclide-react-inspector/lib/ui/inspector.html'
    });
  }

  _handleDidFinishLoad(event) {
    const element = event.target;
    const requirePaths = require.cache[__filename].paths;
    const inspectorDevTools = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../VendorLib/dev-tools/build/standalone.js');
    element.executeJavaScript(`initializeElementInspector(
        ${ JSON.stringify(inspectorDevTools) },
        ${ JSON.stringify(requirePaths) }
      );`);
  }
};
exports.default = Inspector;
module.exports = exports['default'];