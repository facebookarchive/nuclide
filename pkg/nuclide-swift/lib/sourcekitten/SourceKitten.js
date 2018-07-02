"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSourceKittenPath = getSourceKittenPath;
exports.getSourceKittenDisabled = getSourceKittenDisabled;
exports.asyncExecuteSourceKitten = asyncExecuteSourceKitten;

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Returns the path to SourceKitten, based on the user's Nuclide config.
 */
function getSourceKittenPath() {
  return _featureConfig().default.get('nuclide-swift.sourceKittenPath');
}
/**
 * Returns whether SourceKitten integration is disabled.
 */


function getSourceKittenDisabled() {
  return _featureConfig().default.get('nuclide-swift.sourceKittenDisabled');
}
/**
 * Executes a SourceKitten request asynchronously.
 * If an error occurs, displays an error and returns null.
 * Otherwise, returns the stdout from SourceKitten.
 */


async function asyncExecuteSourceKitten(command, args) {
  // SourceKitten does not yet support any platform besides macOS.
  // It may soon support Linux; see: https://github.com/jpsim/SourceKitten/pull/223.
  if (process.platform !== 'darwin' || getSourceKittenDisabled()) {
    return null;
  }

  const sourceKittenPath = getSourceKittenPath();
  let result;

  try {
    result = await (0, _process().runCommandDetailed)(sourceKittenPath, [command].concat(args), {
      isExitError: () => false
    }).toPromise();
  } catch (err) {
    atom.notifications.addError(`Could not invoke SourceKitten at path \`${sourceKittenPath}\``, {
      description: 'Please double-check that the path you have set for the ' + '`nuclide-swift.sourceKittenPath` config setting is correct.' + 'If you do not have SourceKitten installed and do not wish to use ' + 'it for Swift autocompletion, check the "Disable SourceKitten" ' + "setting in Nuclide's settings pane.<br>" + `**Error code:** \`${err.errno || ''}\`<br>` + `**Error message:** <pre>${err.message}</pre>`
    });
    return null;
  }

  if (result.exitCode !== 0 || result.stdout.length === 0) {
    atom.notifications.addError('An error occurred when invoking SourceKitten', {
      description: 'Please file a bug.<br>' + `**exit code:** \`${String(result.exitCode)}\`<br>` + `**stdout:** <pre>${String(result.stdout)}</pre><br>` + `**stderr:** <pre>${String(result.stderr)}</pre><br>` + `**command:** <pre>${[command].concat(args).join(' ')}</pre><br>`
    });
    return null;
  }

  return result.stdout;
}