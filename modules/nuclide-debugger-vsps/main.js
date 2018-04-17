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
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-node/VendorLib/vscode-node-debug2/out/src/nodeDebug.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-node/VendorLib/vscode-node-debug2')
}], ['python', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-python/VendorLib/vs-py-debugger/out/client/debugger/Main.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-python/VendorLib/vs-py-debugger')
}], ['react-native', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-react-native/VendorLib/vscode-react-native/out/debugger/reactNativeDebugEntryPoint.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-react-native/VendorLib/vscode-react-native')
}], ['prepack', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-prepack/adapter/DebugAdapter.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'VendorLib/vscode-prepack')
}], ['ocaml', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-ocaml/lib/vscode-debugger-entry.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../atom-ide-debugger-ocaml')
}], ['native_gdb', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fb-native-debugger-gdb-vsp/src/RunTranspiledServer.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fb-native-debugger-gdb-vsp')
}], ['native_lldb', {
  executable: {
    command: 'lldb-vscode',
    args: []
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fb-native-debugger-lldb-vsp')
}], ['hhvm', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../pkg/nuclide-debugger-hhvm-rpc/lib/hhvmWrapper.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../pkg/nuclide-debugger-hhvm-rpc')
}], ['mobilejs', {
  executable: {
    command: 'node',
    args: [(_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../pkg/fb-debugger-mobilejs-rpc/lib/vscode/vscode-debugger-entry.js')]
  },
  root: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../pkg/fb-debugger-mobilejs-rpc')
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