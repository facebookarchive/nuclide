/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ConnectionWrapper} from './ConnectionWrapper';
import type {IDisposable} from 'vscode';
import type {RemoteFileSystem} from './RemoteFileSystem';
import type {RemoteChildProcess} from './RemoteProcess';
import type {
  ServerOptions,
  StaticFeature,
  StreamInfo,
} from 'vscode-languageclient';
import type {
  ClientCapabilities,
  DocumentSelector,
  InitializeParams,
  ServerCapabilities,
} from 'vscode-languageserver-protocol';

import * as vscode from 'vscode';
import * as jsonrpc from 'vscode-jsonrpc';
import Stream from 'stream';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {LanguageClient} from 'vscode-languageclient';
import {spawnRemote} from './RemoteProcess';
import {getLogger} from 'log4js';

const logger = getLogger('LSP');

type SpawnLspOptions = {
  +name: string,
  +language: DocumentSelector | Array<string>,
  +outputChannelName: string,
  +command: string,
  +args: Array<string>,
  +encoding: string,
};

/**
 * Creates and registers an LSP for the given connection. Once the connection
 * closes the LSP will be stopped.
 * @returns a disposable that will stop the LSP.
 */
export async function createLsp(
  options: SpawnLspOptions,
  filesystem: RemoteFileSystem,
  lspRoot: string,
  conn: ConnectionWrapper,
): Promise<IDisposable> {
  const {args, command, encoding, language, outputChannelName, name} = options;

  const feature: StaticFeature = {
    fillClientCapabilities(capabilities: ClientCapabilities): void {},
    initialize(
      capabilities: ServerCapabilities,
      documentSelector: ?DocumentSelector,
    ): void {},

    fillInitializeParams(params: InitializeParams): void {
      // TODO: We should make a PR to vscode-languageserver-node to avoid having to do this.
      // VSCode provides the current extension host PID.
      // The remote LSP implementation may attempt to check for this and fail.
      // $FlowIgnore: As noted, this is a workaround for a VS Code issue.
      params.processId = null;

      // It appears that rootUri and rootPath are not set by default on
      // InitializeParams when a remote file system is used.
      params.rootUri = vscode.Uri.file(lspRoot).toString();
      params.rootPath = lspRoot;

      if (name === 'reason' || name === 'ocaml') {
        // Note that these initializationOptions are taken from Nuclide. I
        // think that we should deploy a /bin/fb-ocaml-language-server to
        // devservers that abstracts this away and then specify that as the
        // `command` in the .bigdig.toml.
        params.initializationOptions = {
          codelens: {
            enabled: true,
            unicode: false,
          },
          debounce: {
            linter: 10 * 1000, // 10s
          },
          format: {
            width: 80,
          },
          diagnostics: {
            merlinPerfLogging: true,
            tools: ['merlin'],
          },
          path: {
            ocamlfind: 'ocamlfind',
            ocamlmerlin: 'ocamlmerlin',
            opam: 'opam',
            rebuild: 'rebuild',
            refmt: 'refmt',
            refmterr: 'refmterr',
            rtop: 'rtop',
          },
          server: {
            languages: ['ocaml', 'reason'],
          },
        };
      }
    },
  };

  const cleanup = new UniversalDisposable();
  try {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    const lspProc = await spawnRemote(conn, command, args, {
      cwd: lspRoot,
      usePty: false,
      inheritEnv: true,
    });
    cleanup.add(() => lspProc.kill('SIGTERM').catch(() => {}));

    const client = new LanguageClient(
      name,
      remoteLspChildProcess(lspProc, name),
      {
        documentSelector: language,
        uriConverters: {
          code2Protocol: filesystem.uriToLspFileUri.bind(filesystem),
          protocol2Code(pathOrUri) {
            // LSP paths may be paths or file:// URIs.
            const {path} = vscode.Uri.parse(pathOrUri);
            return filesystem.pathToUri(path);
          },
        },
        outputChannelName,
        stdioEncoding: encoding,
        initializationFailedHandler: {
          error(err) {
            logger.error(`Initialization of ${name} failed.`, err);
          },
        },
        errorHandler: {
          error(err) {
            logger.error(`${name}: `, err);
          },
          closed() {
            logger.error(`Connection closed (${name})`);
          },
        },
      },
    );
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
function remoteLspChildProcess(
  lspProc: RemoteChildProcess,
  name: string,
): ServerOptions {
  // TODO: Specify a "Middleware" on the LanguageClientOptions for logging.
  // Currently, we have to copy each message so we can parse it on its own
  // stream for logging purposes, which is wasteful. Ideally we could just do
  // this inside the LanguageClient via Middleware after it has already done the
  // parsing.
  function isLoggingEnabled(): boolean {
    const lspsToLog = vscode.workspace
      .getConfiguration('big-dig')
      .get('logging.lsp', []);
    return lspsToLog.includes(name);
  }
  let shouldLog = isLoggingEnabled();
  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('big-dig.logging.lsp')) {
      if (isLoggingEnabled() !== shouldLog) {
        shouldLog = !shouldLog;
        logger.info(`Logging for LSP ${name} set to ${String(shouldLog)}.`);
      }
    }
  });

  // We maintain separate, duplicate streams for logging. We need to register
  // them before consuming lspProc.stdin or lspProc.stdout, even if shouldLog is
  // false, because if we do not consume the entire stream, then we could start
  // reading in the middle of a JSON-RPC message, which would prevent us from
  // being able to parse the stream reliably.
  const intermediateWriteStream = new Stream.PassThrough();
  intermediateWriteStream.pipe(lspProc.stdin);
  const streamReader = new jsonrpc.StreamMessageReader(intermediateWriteStream);
  streamReader.listen(message => {
    if (shouldLog) {
      logger.info(`${name} stdin:\n${JSON.stringify(message, null, 2)}`);
    }
  });

  const stdOutStreamReader = new jsonrpc.StreamMessageReader(lspProc.stdout);
  stdOutStreamReader.listen(message => {
    if (shouldLog) {
      logger.info(`${name} stdout:\n${JSON.stringify(message, null, 2)}`);
    }
  });

  return (): Promise<StreamInfo> => {
    logger.info(`ServerOptions were requested for LSP "${name}".`);
    return Promise.resolve({
      reader: lspProc.stdout,
      writer: intermediateWriteStream,
    });
  };
}
