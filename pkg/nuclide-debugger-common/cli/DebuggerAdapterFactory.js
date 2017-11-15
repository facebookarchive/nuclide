'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-debugger-common/lib/constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerAdapterFactory {
  constructor() {
    this._vspServersByTargetType = new Map([[(_constants || _load_constants()).VsAdapterTypes.PYTHON, (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../fb-debugger-vscode-adapter/VendorLib/vs-py-debugger/out/client/debugger/Main.js')], [(_constants || _load_constants()).VsAdapterTypes.NODE, (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../fb-debugger-vscode-adapter/VendorLib/vscode-node-debug2/out/src/nodeDebug.js')]]);
    this._targetTypeByFileExtension = new Map([['.py', (_constants || _load_constants()).VsAdapterTypes.PYTHON], ['.js', (_constants || _load_constants()).VsAdapterTypes.NODE]]);
  }

  adapterFromArguments(args) {
    const launchArgs = args._;
    let targetType = null;

    // command line target overrides everything
    if (args.type !== undefined) {
      targetType = args.type;
      if (!this._vspServersByTargetType.get(targetType)) {
        const error = 'Invalid target type "' + targetType + '"; valid types are "' + Object.keys(this._vspServersByTargetType).join('", "') + '"';
        throw new Error(error);
      }
    }

    if (targetType == null && launchArgs.length > 0) {
      const program = (_nuclideUri || _load_nuclideUri()).default.resolve(launchArgs[0]);

      if (!targetType) {
        // $TODO right now this only supports local launch
        const programUri = (_nuclideUri || _load_nuclideUri()).default.parsePath(program);

        // $TODO if there is no extension, try looking at the shebang
        targetType = this._targetTypeByFileExtension.get(programUri.ext);
        if (targetType === undefined) {
          const error = 'Could not determine target type from filename "' + program + '". Please use --type to specify it explicitly.';
          throw Error(error);
        }
      }

      const adapterPath = this._vspServersByTargetType.get(targetType);

      if (!(adapterPath != null)) {
        throw new Error('Adapter server table not properly populated in DebuggerAdapterFactory');
      }

      return {
        adapterInfo: {
          command: 'node',
          args: [adapterPath]
        },
        launchArgs: {
          args: launchArgs.splice(1),
          program,
          noDebug: false,
          stopOnEntry: true
        }
      };
    }

    return null;
  }
}
exports.default = DebuggerAdapterFactory; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */