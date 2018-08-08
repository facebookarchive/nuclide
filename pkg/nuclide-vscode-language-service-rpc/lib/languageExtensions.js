"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLanguageSpecificCommand = getLanguageSpecificCommand;
exports.middleware_handleDiagnostics = middleware_handleDiagnostics;

function _semver() {
  const data = _interopRequireDefault(require("semver"));

  _semver = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _which() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
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
 *  strict-local
 * @format
 */
async function getLanguageSpecificCommand(rootPath, options) {
  if (typeof options === 'object' && options != null && options.kind === 'flow' && typeof options.canUseFlowBin === 'boolean' && typeof options.pathToFlow === 'string') {
    const win32 = process.platform === 'win32';
    const cwd = {
      cwd: rootPath
    };
    const candidates = [];

    if (options.canUseFlowBin && win32) {
      candidates.push(_nuclideUri().default.join(rootPath, './node_modules/.bin/flow.cmd'));
    }

    if (options.canUseFlowBin) {
      candidates.push(_nuclideUri().default.join(rootPath, './node_modules/.bin/flow'));
    }

    if (win32) {
      candidates.push(`${options.pathToFlow}.cmd`);
    }

    candidates.push(options.pathToFlow);
    const command = await (0, _promise().asyncFind)(candidates, async candidate => {
      const exists = (await (0, _which().default)(candidate, cwd)) != null;
      return exists ? candidate : null;
    });

    if (command == null) {
      throw new Error(`Flow not found at ${candidates.map(candidate => `"${candidate}"`).join(', ')}`);
    }

    const versionRaw = await (0, _process().runCommand)(command, ['version', '--json'], cwd).toPromise();
    const versionJson = JSON.parse(versionRaw);
    const version = versionJson.semver;

    if (!_semver().default.satisfies(version, '>=0.75.0')) {
      let msg = `Flow version is ${version}, which is too old for Nuclide support - please upgrade to 0.75.0 or higher.`;

      try {
        // $FlowFB
        const strings = require("./fb-strings");

        msg = await strings.flowVersionTooOld(version, rootPath, command);
      } catch (_) {}

      throw new Error(msg);
    }

    return command;
  } else {
    throw new Error(`Unrecognized command ${JSON.stringify(options)}`);
  }
}

function middleware_handleDiagnostics(params, languageServerName, host, showStatus) {
  if (languageServerName === 'ocaml') {
    try {
      // $FlowFB
      const strings = require("./fb-strings");

      strings.ocamlDiagnostics(params, host, showStatus);
    } catch (_) {}
  }
}