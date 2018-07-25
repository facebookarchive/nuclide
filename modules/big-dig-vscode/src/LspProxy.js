"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLsp = createLsp;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function jsonrpc() {
  const data = _interopRequireWildcard(require("vscode-jsonrpc"));

  jsonrpc = function () {
    return data;
  };

  return data;
}

var _stream = _interopRequireDefault(require("stream"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _vscodeLanguageclient() {
  const data = require("vscode-languageclient");

  _vscodeLanguageclient = function () {
    return data;
  };

  return data;
}

function _RemoteProcess() {
  const data = require("./RemoteProcess");

  _RemoteProcess = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
const logger = (0, _log4js().getLogger)('LSP');

/**
 * Creates and registers an LSP for the given connection. Once the connection
 * closes the LSP will be stopped.
 * @returns a disposable that will stop the LSP.
 */
async function createLsp(options, filesystem, lspRoot, conn) {
  const {
    args,
    command,
    encoding,
    language,
    outputChannelName,
    name
  } = options;
  const feature = {
    fillClientCapabilities(capabilities) {},

    initialize(capabilities, documentSelector) {},

    fillInitializeParams(params) {
      // TODO: We should make a PR to vscode-languageserver-node to avoid having to do this.
      // VSCode provides the current extension host PID.
      // The remote LSP implementation may attempt to check for this and fail.
      // $FlowIgnore: As noted, this is a workaround for a VS Code issue.
      params.processId = null; // It appears that rootUri and rootPath are not set by default on
      // InitializeParams when a remote file system is used.

      params.rootUri = vscode().Uri.file(lspRoot).toString();
      params.rootPath = lspRoot;

      if (name === 'reason' || name === 'ocaml') {
        // Note that these initializationOptions are taken from Nuclide. I
        // think that we should deploy a /bin/fb-ocaml-language-server to
        // devservers that abstracts this away and then specify that as the
        // `command` in the .bigdig.toml.
        params.initializationOptions = {
          codelens: {
            enabled: true,
            unicode: false
          },
          debounce: {
            linter: 10 * 1000 // 10s

          },
          format: {
            width: 80
          },
          diagnostics: {
            merlinPerfLogging: true,
            tools: ['merlin']
          },
          path: {
            ocamlfind: 'ocamlfind',
            ocamlmerlin: 'ocamlmerlin',
            opam: 'opam',
            rebuild: 'rebuild',
            refmt: 'refmt',
            refmterr: 'refmterr',
            rtop: 'rtop'
          },
          server: {
            languages: ['ocaml', 'reason']
          }
        };
      }
    }

  };
  const cleanup = new (_UniversalDisposable().default)();

  try {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    const lspProc = await (0, _RemoteProcess().spawnRemote)(conn, command, args, {
      cwd: lspRoot,
      usePty: false,
      inheritEnv: true
    });
    cleanup.add(() => lspProc.kill('SIGTERM').catch(() => {}));
    const client = new (_vscodeLanguageclient().LanguageClient)(name, remoteLspChildProcess(lspProc, name), {
      documentSelector: language,
      uriConverters: {
        code2Protocol: filesystem.uriToLspFileUri.bind(filesystem),

        protocol2Code(pathOrUri) {
          // LSP paths may be paths or file:// URIs.
          const {
            path
          } = vscode().Uri.parse(pathOrUri);
          return filesystem.pathToUri(path);
        }

      },
      outputChannelName,
      stdioEncoding: encoding,
      initializationFailedHandler: {
        error(err) {
          logger.error(`Initialization of ${name} failed.`, err);
        }

      },
      errorHandler: {
        error(err) {
          logger.error(`${name}: `, err);
        },

        closed() {
          logger.error(`Connection closed (${name})`);
        }

      }
    });
    client.registerFeature(feature);
    logger.info(`Starting ${name}`);
    cleanup.add(client.start());
  } catch (error) {
    logger.error(error);
    cleanup.dispose();
  }

  cleanup.add(() => {
    logger.info(`Stopped ${name}`);
  });
  return cleanup;
}
/**
 * Provides a language server process to `LanguageClient` by wrapping a remote process.
 * @param lspProc a remote process
 */


function remoteLspChildProcess(lspProc, name) {
  // TODO: Specify a "Middleware" on the LanguageClientOptions for logging.
  // Currently, we have to copy each message so we can parse it on its own
  // stream for logging purposes, which is wasteful. Ideally we could just do
  // this inside the LanguageClient via Middleware after it has already done the
  // parsing.
  function isLoggingEnabled() {
    const lspsToLog = vscode().workspace.getConfiguration('big-dig').get('logging.lsp', []);
    return lspsToLog.includes(name);
  }

  let shouldLog = isLoggingEnabled();
  vscode().workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('big-dig.logging.lsp')) {
      if (isLoggingEnabled() !== shouldLog) {
        shouldLog = !shouldLog;
        logger.info(`Logging for LSP ${name} set to ${String(shouldLog)}.`);
      }
    }
  }); // We maintain separate, duplicate streams for logging. We need to register
  // them before consuming lspProc.stdin or lspProc.stdout, even if shouldLog is
  // false, because if we do not consume the entire stream, then we could start
  // reading in the middle of a JSON-RPC message, which would prevent us from
  // being able to parse the stream reliably.

  const intermediateWriteStream = new _stream.default.PassThrough();
  intermediateWriteStream.pipe(lspProc.stdin);
  const streamReader = new (jsonrpc().StreamMessageReader)(intermediateWriteStream);
  streamReader.listen(message => {
    if (shouldLog) {
      logger.info(`${name} stdin:\n${JSON.stringify(message, null, 2)}`);
    }
  });
  const stdOutStreamReader = new (jsonrpc().StreamMessageReader)(lspProc.stdout);
  stdOutStreamReader.listen(message => {
    if (shouldLog) {
      logger.info(`${name} stdout:\n${JSON.stringify(message, null, 2)}`);
    }
  });
  return () => {
    logger.info(`ServerOptions were requested for LSP "${name}".`);
    return Promise.resolve({
      reader: lspProc.stdout,
      writer: intermediateWriteStream
    });
  };
}