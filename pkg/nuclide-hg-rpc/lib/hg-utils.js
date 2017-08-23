'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInteractiveCommitEditorConfig = exports.hgAsyncExecute = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
let hgAsyncExecute = exports.hgAsyncExecute = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args_, options_) {
    const { command, args, options } = yield getHgExecParams(args_, options_);
    try {
      return yield (0, (_process || _load_process()).runCommandDetailed)(command, args, options).toPromise();
    } catch (err) {
      logAndThrowHgError(args, options, err);
    }
  });

  return function hgAsyncExecute(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Calls hg commands, returning an Observable to allow aborting and streaming progress output.
 */


let getHgExecParams = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (args_, options_) {
    let args = args_;
    let sshCommand;
    // expandHomeDir is not supported on windows
    if (process.platform !== 'win32') {
      const pathToSSHConfig = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir('~/.atom/scm_ssh.sh');
      const doesSSHConfigExist = yield (_fsPromise || _load_fsPromise()).default.exists(pathToSSHConfig);
      if (doesSSHConfigExist) {
        sshCommand = pathToSSHConfig;
      }
    }

    if (sshCommand == null) {
      // Disabling ssh keyboard input so all commands that prompt for interaction
      // fail instantly rather than just wait for an input that will never arrive
      sshCommand = 'ssh -oBatchMode=yes -oControlMaster=no';
    }
    args.push('--config', `ui.ssh=${sshCommand}`, '--noninteractive');
    const [hgCommandName] = args;
    if (EXCLUDE_FROM_HG_BLACKBOX_COMMANDS.has(hgCommandName)) {
      args.push('--config', 'extensions.blackbox=!');
    }
    let options = Object.assign({}, options_, {
      env: Object.assign({}, (yield (0, (_process || _load_process()).getOriginalEnvironment)()), {
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
      [command, args, options] = (0, (_process || _load_process()).scriptifyCommand)('hg', args, options);
    } else {
      command = 'hg';
    }
    return { command, args, options };
  });

  return function getHgExecParams(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let getInteractiveCommitEditorConfig = exports.getInteractiveCommitEditorConfig = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* () {
    const connectionDetails = yield (0, (_nuclideRemoteAtomRpc || _load_nuclideRemoteAtomRpc()).getConnectionDetails)();
    if (connectionDetails == null) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('CommandServer not initialized!');
      return null;
    }
    // Atom RPC needs to agree with the Atom process / nuclide server on the address and port.
    const hgEditor = getAtomRpcScriptPath() + ` -f ${connectionDetails.family} -p ${connectionDetails.port} --wait`;
    return {
      args: ['--config', 'ui.interface.chunkselector=editor', '--config', 'extensions.edrecord='],
      hgEditor
    };
  });

  return function getInteractiveCommitEditorConfig() {
    return _ref3.apply(this, arguments);
  };
})();

exports.hgObserveExecution = hgObserveExecution;
exports.hgRunCommand = hgRunCommand;
exports.formatCommitMessage = formatCommitMessage;
exports.processExitCodeAndThrow = processExitCodeAndThrow;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideRemoteAtomRpc;

function _load_nuclideRemoteAtomRpc() {
  return _nuclideRemoteAtomRpc = require('../../nuclide-remote-atom-rpc');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mercurial (as of v3.7.2) [strips lines][1] matching the following prefix when a commit message is
// created by an editor invoked by Mercurial. Because Nuclide is not invoked by Mercurial, Nuclide
// must mimic the same stripping.
//
// Note: `(?m)` converts to `/m` in JavaScript-flavored RegExp to mean 'multiline'.
//
// [1] https://selenic.com/hg/file/3.7.2/mercurial/cmdutil.py#l2734
const COMMIT_MESSAGE_STRIP_LINE = /^HG:.*(\n|$)/gm;

// Avoid spamming the hg blackbox with read-only hg commands.
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

const EXCLUDE_FROM_HG_BLACKBOX_COMMANDS = new Set([
// 'bookmarks' is technically another read-only command, but the possible
//  --rename/--delete options make this detection unreliable.
'cat', 'config', // Nuclide only ever *reads* the config.
'diff', 'log', 'show', 'status']);function hgObserveExecution(args_, options_) {
  // TODO(T17463635)
  return _rxjsBundlesRxMinJs.Observable.fromPromise(getHgExecParams(args_, options_)).switchMap(({ command, args, options }) => {
    return (0, (_process || _load_process()).observeProcess)(...(0, (_process || _load_process()).scriptifyCommand)(command, args, Object.assign({}, options, {
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }))).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })); // TODO(T17463635)
  });
}

/**
 * Calls hg commands, returning an Observable to allow aborting.
 * Resolves to stdout.
 */
function hgRunCommand(args_, options_) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(getHgExecParams(args_, options_)).switchMap(({ command, args, options }) => (0, (_process || _load_process()).runCommand)(command, args, Object.assign({}, options, { killTreeWhenDone: true })));
}

function logAndThrowHgError(args, options, err) {
  if (err instanceof (_process || _load_process()).ProcessExitError) {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`Error executing hg command: ${JSON.stringify(args)}\n` + `stderr: ${err.stderr}\nstdout: ${String(err.stdout)}\n` + `options: ${JSON.stringify(options)}`);
    const { stdout, stderr, exitCode } = err;
    let message = 'hg error';
    if (exitCode != null) {
      message += ` (exit code ${exitCode})`;
    }
    if (stderr.length > 0) {
      message += `\nstderr: ${stderr}`;
    }
    if (stdout != null && stdout.length > 0) {
      message += `\nstdout: ${stdout}`;
    }
    throw new Error(message);
  } else {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`Error executing hg command: ${JSON.stringify(args)}\n` + `options: ${JSON.stringify(options)}`);
    throw err;
  }
}

function formatCommitMessage(commitMessage) {
  return commitMessage.replace(COMMIT_MESSAGE_STRIP_LINE, '');
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

function processExitCodeAndThrow(processMessage) {
  // TODO(T17463635)
  if (processMessage.kind === 'exit' && processMessage.exitCode !== 0) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error(`HG failed with exit code: ${String(processMessage.exitCode)}`));
  }
  return _rxjsBundlesRxMinJs.Observable.of(processMessage);
}