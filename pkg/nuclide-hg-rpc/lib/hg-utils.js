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
exports.getEditMergeConfigs = exports.createCommmitMessageTempFile = exports.hgAsyncExecute = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
let hgAsyncExecute = exports.hgAsyncExecute = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args_, options_) {
    var _getHgExecParams = getHgExecParams(args_, options_);

    const command = _getHgExecParams.command,
          args = _getHgExecParams.args,
          options = _getHgExecParams.options;

    const result = yield (0, (_process || _load_process()).asyncExecute)(command, args, options);
    if (result.exitCode === 0) {
      return result;
    } else {
      logAndThrowHgError(args, options, result.stdout, result.stderr);
    }
  });

  return function hgAsyncExecute(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Calls hg commands, returning an Observable to allow aborting and streaming progress output.
 */


let createCommmitMessageTempFile = exports.createCommmitMessageTempFile = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (commitMessage) {
    const tempFile = yield (_fsPromise || _load_fsPromise()).default.tempfile();
    const strippedMessage = commitMessage.replace(COMMIT_MESSAGE_STRIP_LINE, '');
    yield (_fsPromise || _load_fsPromise()).default.writeFile(tempFile, strippedMessage);
    return tempFile;
  });

  return function createCommmitMessageTempFile(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

let getEditMergeConfigs = exports.getEditMergeConfigs = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* () {
    const connectionDetails = yield (0, (_nuclideRemoteAtomRpc || _load_nuclideRemoteAtomRpc()).getConnectionDetails)();
    if (connectionDetails == null) {
      throw new Error('CommandServer not initialized!');
    }
    // Atom RPC needs to agree with the Atom process / nuclide server on the address and port.
    const hgEditor = getAtomRpcScriptPath() + ` -f ${ connectionDetails.family } -p ${ connectionDetails.port } --wait`;
    return {
      args: ['--config', 'merge-tools.editmerge.check=conflicts', '--config', 'ui.merge=editmerge'],
      hgEditor: hgEditor
    };
  });

  return function getEditMergeConfigs() {
    return _ref3.apply(this, arguments);
  };
})();

exports.hgObserveExecution = hgObserveExecution;
exports.hgRunCommand = hgRunCommand;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteAtomRpc;

function _load_nuclideRemoteAtomRpc() {
  return _nuclideRemoteAtomRpc = require('../../nuclide-remote-atom-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mercurial (as of v3.7.2) [strips lines][1] matching the following prefix when a commit message is
// created by an editor invoked by Mercurial. Because Nuclide is not invoked by Mercurial, Nuclide
// must mimic the same stripping.
//
// Note: `(?m)` converts to `/m` in JavaScript-flavored RegExp to mean 'multiline'.
//
// [1] https://selenic.com/hg/file/3.7.2/mercurial/cmdutil.py#l2734
const COMMIT_MESSAGE_STRIP_LINE = /^HG:.*(\n|$)/gm;function hgObserveExecution(args_, options_) {
  var _getHgExecParams2 = getHgExecParams(args_, options_);

  const command = _getHgExecParams2.command,
        args = _getHgExecParams2.args,
        options = _getHgExecParams2.options;

  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(command, args, options), true);
}

/**
 * Calls hg commands, returning an Observable to allow aborting.
 * Resolves to stdout.
 */
function hgRunCommand(args_, options_) {
  var _getHgExecParams3 = getHgExecParams(args_, options_);

  const command = _getHgExecParams3.command,
        args = _getHgExecParams3.args,
        options = _getHgExecParams3.options;

  return (0, (_process || _load_process()).runCommand)(command, args, options, true /* kill process tree on complete */);
}

function logAndThrowHgError(args, options, stdout, stderr) {
  (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error executing hg command: ${ JSON.stringify(args) }\n` + `stderr: ${ stderr }\nstdout: ${ stdout }\n` + `options: ${ JSON.stringify(options) }`);
  if (stderr.length > 0 && stdout.length > 0) {
    throw new Error(`hg error\nstderr: ${ stderr }\nstdout: ${ stdout }`);
  } else {
    // One of `stderr` or `stdout` is empty - not both.
    throw new Error(stderr || stdout);
  }
}

function getHgExecParams(args_, options_) {
  let args = args_;
  const options = Object.assign({}, options_, {
    env: Object.assign({}, (0, (_process || _load_process()).getOriginalEnvironment)(), {
      ATOM_BACKUP_EDITOR: 'false'
    })
  });
  if (!options.NO_HGPLAIN) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    options.env.HGPLAIN = 1;
  }
  if (options.HGEDITOR != null) {
    options.env.HGEDITOR = options.HGEDITOR;
  }

  let command;
  if (options.TTY_OUTPUT) {
    command = 'script';
    args = (0, (_process || _load_process()).createArgsForScriptCommand)('hg', args);
  } else {
    command = 'hg';
  }
  return { command: command, args: args, options: options };
}

let atomRpcEditorPath;

function getAtomRpcScriptPath() {
  if (atomRpcEditorPath == null) {
    try {
      atomRpcEditorPath = require.resolve('../../nuclide-remote-atom-rpc/bin/fb-atom');
    } catch (error) {
      atomRpcEditorPath = require.resolve('../../nuclide-remote-atom-rpc/bin/atom');
    }
  }
  return atomRpcEditorPath;
}