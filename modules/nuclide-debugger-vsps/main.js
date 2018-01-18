'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAdapterExecutable = getAdapterExecutable;
exports.getAdapterPackageRoot = getAdapterPackageRoot;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _adapters = new Map([['node', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-node-debug2/out/src/nodeDebug.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-node-debug2')
}], ['python', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vs-py-debugger/out/client/debugger/Main.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vs-py-debugger')
}], ['react-native', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-react-native/out/debugger/reactNativeDebugEntryPoint.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-react-native')
}], ['prepack', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-prepack/adapter/DebugAdapter.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-prepack')
}], ['ocaml', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'vscode-ocaml/vscode-debugger-entry.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'vscode-ocaml')
}]]); /**
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

function getAdapterExecutable(adapter) {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.executable;
}

function getAdapterPackageRoot(adapter) {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.root;
}