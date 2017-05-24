/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  FileVersion,
  FileOpenEvent,
  FileCloseEvent,
  FileEditEvent,
} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TextEdit} from 'nuclide-commons-atom/text-edit-rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {
  Outline,
  OutlineTree,
} from '../../nuclide-outline-view/lib/rpc-types';
import type {TokenizedText} from '../../commons-node/tokenizedText-rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {
  FindReferencesReturn,
  Reference,
} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  FileDiagnosticUpdate,
  MessageType as DiagnosticMessageType,
} from 'atom-ide-ui';
import type {
  AutocompleteResult,
  Completion,
  SymbolResult,
} from '../../nuclide-language-service/lib/LanguageService';
import type {
  HostServices,
  ShowNotificationLevel,
} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {
  NuclideEvaluationExpression,
} from '../../nuclide-debugger-interfaces/rpc-types';
import type {ConnectableObservable} from 'rxjs';
import type {
  InitializeParams,
  ServerCapabilities,
  TextDocumentIdentifier,
  Position,
  Range,
  Location,
  PublishDiagnosticsParams,
  LogMessageParams,
  ShowMessageParams,
  ShowMessageRequestParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
  DidChangeTextDocumentParams,
  TextDocumentContentChangeEvent,
  Diagnostic,
  CompletionItem,
  TextDocumentPositionParams,
  SymbolInformation,
  UncoveredRange,
} from './protocol';
import type {JsonRpcConnection} from './jsonrpc';

import invariant from 'assert';
import through from 'through';
import {spawn} from '../../commons-node/process';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {collect} from 'nuclide-commons/collection';
import {compact} from 'nuclide-commons/observable';
import {wordAtPositionFromBuffer} from 'nuclide-commons/range';
import {
  FileCache,
  FileVersionNotifier,
  FileEventKind,
} from '../../nuclide-open-files-rpc';
import * as rpc from 'vscode-jsonrpc';
import url from 'url';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Point, Range as atom$Range} from 'simple-text-buffer';
import {ensureInvalidations} from '../../nuclide-language-service-rpc';
import {LspConnection} from './LspConnection';
import {
  ErrorCodes,
  TextDocumentSyncKind,
  DiagnosticSeverity,
  SymbolKind,
  MessageType as LspMessageType,
} from './protocol';
import {
  className,
  method,
  constructor,
  string,
  plain,
} from '../../commons-node/tokenizedText';

type State =
  | 'Initial'
  | 'Starting'
  | 'StartFailed'
  | 'Running'
  | 'Stopping'
  | 'Stopped';

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
export class LspLanguageService {
  // These fields are provided upon construction
  _projectRoot: string;
  _fileCache: FileCache; // tracks which fileversions we've received from Nuclide client
  _host: HostServices;
  _lspFileVersionNotifier: FileVersionNotifier; // tracks which fileversions we've sent to LSP
  _fileEventSubscription: rxjs$ISubscription;
  _consoleSource: string;
  _command: string;
  _args: Array<string>;
  _fileExtensions: Array<string>;
  _logger: log4js$Logger;
  _host: HostServices;
  _fileCache: FileCache; // tracks which fileversions we've received from Nuclide client

  // These fields reflect our own state.
  // (Most should be nullable types, but it's not worth the bother.)
  _state: State = 'Initial';
  _recentRestarts: Array<number> = [];
  _diagnosticUpdates: Subject<
    Observable<PublishDiagnosticsParams>,
  > = new Subject();
  _supportsSymbolSearch: BehaviorSubject<?boolean> = new BehaviorSubject(null);
  // Fields which become live inside start(), when we spawn the LSP process.
  // Disposing of the _lspConnection will dispose of all of them.
  _childOut: {stdout: string, stderr: string} = {stdout: '', stderr: ''};
  _lspConnection: LspConnection; // is really "?LspConnection"
  // Fields which become live after we receive an initializeResponse:
  _serverCapabilities: ServerCapabilities;
  _derivedServerCapabilities: DerivedServerCapabilities;
  _lspFileVersionNotifier: FileVersionNotifier; // tracks which fileversions we've sent to LSP

  constructor(
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
    consoleSource: string,
    command: string,
    args: Array<string>,
    projectRoot: string,
    fileExtensions: Array<string>,
  ) {
    this._logger = logger;
    this._fileCache = fileCache;
    this._host = host;
    this._projectRoot = projectRoot;
    this._consoleSource = consoleSource;
    this._command = command;
    this._args = args;
    this._fileExtensions = fileExtensions;
  }

  dispose(): void {
    this._stop().catch(_ => {}).then(_ => this._host.dispose());
  }

  async start(): Promise<void> {
    invariant(this._state === 'Initial');
    this._state = 'Starting';

    try {
      const perConnectionDisposables = new UniversalDisposable();
      // The various resources+subscriptions associated with a LspConnection
      // are stored in here. When you call _lspConnection.dispose(), it
      // disposes of all of them (via the above perConnectionDisposables),
      // and also sets _lspConnection and other per-connection fields to null
      // so that any attempt to use them will throw an exception.

      // Error reporting? We'll be catching+reporting errors at each layer:
      // 1. operating system support for launch the process itself
      // 2. stdout/stderr sitting on top of that
      // 3. jsonrpc on top of that
      // 4. lsp on top of that

      let childProcess;
      try {
        this._logger.info(`Spawn: ${this._command} ${this._args.join(' ')}`);
        if (this._command === '') {
          throw new Error('No command provided for launching language server');
          // if we try to spawn an empty command, node itself throws a "bad
          // type" error, which is jolly confusing. So we catch it ourselves.
        }
        const childProcessStream = spawn(this._command, this._args, {
          killTreeWhenDone: true,
        }).publish();
        // disposing of the stream will kill the process, if it still exists
        const processPromise = childProcessStream.take(1).toPromise();
        perConnectionDisposables.add(childProcessStream.connect());
        childProcess = await processPromise;

        // spawn mostly throws errors. But in some cases like ENOENT it
        // immediately returns a childProcess with pid=undefined, and we
        // have to subsequently pick up the error message ourselves...
        if (childProcess.pid == null) {
          const errorPromise = new Promise(resolve =>
            childProcess.on('error', resolve),
          );
          throw new Error((await errorPromise));
        }
        // if spawn failed to launch it, this await will throw.
      } catch (e) {
        this._state = 'StartFailed';

        this._host
          .dialogNotification(
            'error',
            `Couldn't start server - ${this._errorString(e, this._command)}`,
          )
          .refCount()
          .subscribe(); // fire-and-forget
        return;
      }

      // The JsonRPC layer doesn't report what happened on stderr/stdout in
      // case of an error, so we'll pick it up directly. CARE! Node has
      // three means of consuming a stream, and it will crash if you mix them.
      // Our JsonRPC library uses the .pipe() means, so we have to too.
      this._childOut = {stdout: '', stderr: ''};
      const accumulate = (streamName: 'stdout' | 'stderr', data: string) => {
        if (this._childOut[streamName].length < 300) {
          const s = (this._childOut[streamName] + data).substr(0, 300);
          this._childOut[streamName] = s;
        }
      };
      childProcess.stdout.pipe(through(data => accumulate('stdout', data)));
      childProcess.stderr.pipe(through(data => accumulate('stderr', data)));

      const jsonRpcConnection: JsonRpcConnection = rpc.createMessageConnection(
        new rpc.StreamMessageReader(childProcess.stdout),
        new rpc.StreamMessageWriter(childProcess.stdin),
        new JsonRpcLogger(this._logger),
      );
      jsonRpcConnection.trace('verbose', new JsonRpcTraceLogger(this._logger));

      // We assign _lspConnection and wire up the handlers before calling
      // initialize, because any of these events might fire before initialize
      // has even returned.
      this._lspConnection = new LspConnection(jsonRpcConnection);
      this._lspConnection.onDispose(
        perConnectionDisposables.dispose.bind(perConnectionDisposables),
      );
      perConnectionDisposables.add(() => {
        this._lspConnection = ((null: any): LspConnection);
        // cheating here: we're saying "no thank you" to compile-time warnings
        // that _lspConnection might be invalid (since they're too burdensome)
        // but "yes please" to runtime exceptions.
      });

      const perConnectionUpdates = new Subject();
      perConnectionDisposables.add(
        perConnectionUpdates.complete.bind(perConnectionUpdates),
      );
      jsonRpcConnection.onError(this._handleError.bind(this));
      jsonRpcConnection.onClose(this._handleClose.bind(this));
      this._lspConnection.onLogMessageNotification(
        this._handleLogMessageNotification.bind(this),
      );
      this._lspConnection.onShowMessageNotification(
        this._handleShowMessageNotification.bind(this),
      );
      this._lspConnection.onShowMessageRequest(
        this._handleShowMessageRequest.bind(this),
      );
      this._lspConnection.onDiagnosticsNotification(params => {
        perConnectionUpdates.next(params);
      });

      await new Promise(process.nextTick);
      this._diagnosticUpdates.next(perConnectionUpdates);
      // CARE! to avoid a race, we guarantee that we've yielded back
      // to our caller before firing this next() and before sending any
      // diagnostic updates down it. That lets our caller subscribe in time.
      // Why this delicate? Because we don't want to buffer diagnostics, and we
      // don't want to lose any of them.
      // CARE! to avoid a different race, we await for the next tick only after
      // signing up all our handlers.

      jsonRpcConnection.listen();

      // TODO: (asiandrummer, ljw) `rootPath` should be a file URI (`file://`).
      const params: InitializeParams = {
        initializationOptions: {},
        processId: process.pid,
        rootPath: this._projectRoot,
        capabilities: {},
      };
      // TODO: flesh out the InitializeParams

      // We'll keep sending initialize requests until it either succeeds
      // or the user says to stop retrying. This while loop will be potentially
      // long-running since in the case of failure it awaits for the user to
      // click a dialog button.
      while (true) {
        let initializeResponse;
        try {
          // eslint-disable-next-line no-await-in-loop
          initializeResponse = await this._lspConnection.initialize(params);
          // We might receive an onError or onClose event at this time too.
          // Those are handled by _handleError and _handleClose methods.
          // If those happen, then the response to initialize will never arrive,
          // so the above await will block until we finally dispose of the
          // connection.
        } catch (e) {
          this._logLspException(e);
          // CARE! Inside any exception handler of an rpc request,
          // the lspConnection might already have been torn down.

          const offerRetry = e.data != null && Boolean(e.data.retry);
          const msg = `Couldn't initialize server - ${this._errorString(e)}`;
          if (!offerRetry) {
            this._host.dialogNotification('error', msg).refCount().subscribe();
          } else {
            // eslint-disable-next-line no-await-in-loop
            const button = await this._host
              .dialogRequest('error', msg, ['Retry'], 'Close')
              .refCount()
              .toPromise();
            if (button === 'Retry') {
              this._host.consoleNotification(
                this._consoleSource,
                'info',
                `Retrying ${this._command}`,
              );
              if (this._lspConnection != null) {
                continue;
                // Retry will re-use the same this._lspConnection,
                // assuming it hasn't been torn down for whatever reason.
              }
            }
          }
          if (this._lspConnection != null) {
            this._lspConnection.dispose();
          }
          return;
        }

        // If the process wrote to stderr but succeeded to initialize, we'd
        // also like to log that.
        if (this._childOut.stderr !== '') {
          this._host.consoleNotification(
            this._consoleSource,
            'error',
            this._childOut.stderr,
          );
        }

        // Up until now, _handleError might have been called e.g. while
        // awaiting initialize. If it was called, it would have printed childOut.
        // But from now on that would be inappropriate, so we'll reset it.
        this._childOut = {stdout: '', stderr: ''};

        this._serverCapabilities = initializeResponse.capabilities;
        this._derivedServerCapabilities = new DerivedServerCapabilities(
          this._serverCapabilities,
          this._logger,
        );
        perConnectionDisposables.add(() => {
          this._serverCapabilities = ((null: any): ServerCapabilities);
          this._derivedServerCapabilities = ((null: any): DerivedServerCapabilities);
        });

        this._state = 'Running';
        // At this point we're good to call into LSP.

        // CARE! Don't try to hook up file-events until after we're already
        // good to send them to LSP.
        this._lspFileVersionNotifier = new FileVersionNotifier();
        perConnectionDisposables.add(this._subscribeToFileEvents(), () => {
          this._lspFileVersionNotifier = ((null: any): FileVersionNotifier);
        });
        return;
      }
    } catch (e) {
      // By this stage we've already handled+recovered from exceptions
      // gracefully around every external operation - spawning, speaking lsp
      // over jsonrpc, sending the initialize message. If an exception fell
      // through then it's an internal logic error.
      // Don't know how to recover.
      this._logger.error(`Lsp.start - unexpected error ${e}`);
      throw e;
    } finally {
      this._supportsSymbolSearch.next(
        this._serverCapabilities != null &&
          Boolean(this._serverCapabilities.workspaceSymbolProvider),
      );
    }
  }

  _subscribeToFileEvents(): rxjs$Subscription {
    // This code's goal is to keep the LSP process aware of the current status of opened
    // files. Challenge: LSP has no insight into fileversion: it relies wholly upon us
    // to give a correct sequence of versions in didChange events and can't even verify them.
    //
    // The _lspFileVersionNotifier tracks which fileversion we've sent downstream to LSP so far.
    //
    // The _fileCache tracks our upstream connection to the Nuclide editor, and from that
    // synthesizes a sequential consistent stream of Open/Edit/Close events.
    // If the (potentially flakey) connection temporarily goes down, the _fileCache
    // recovers, resyncs, and synthesizes for us an appropriate whole-document Edit event.
    // Therefore, it's okay for us to simply send _fileCache's sequential stream of edits
    // directly on to the LSP server.
    //
    // Note: if the LSP encounters an internal error responding to one of these notifications,
    // then it will be out of sync. JsonRPC doesn't allow for notifications to have
    // responses. So all we can do is trust the LSP server to terminate itself it
    // it encounters a problem.
    return (
      this._fileCache
        .observeFileEvents()
        // The "observeFileEvents" will first send an 'open' event for every
        // already-open file, and after that it will give live updates.
        // TODO: Filter on projectRoot
        .filter(fileEvent => {
          const fileExtension = nuclideUri.extname(
            fileEvent.fileVersion.filePath,
          );
          return this._fileExtensions.indexOf(fileExtension) !== -1;
        })
        .subscribe(fileEvent => {
          invariant(fileEvent.fileVersion.notifier === this._fileCache);
          // This invariant just self-documents that _fileCache is asked on observe file
          // events about fileVersions that themselves point directly back to the _fileCache.
          // (It's a convenience so that folks can pass around just a fileVersion on its own.)

          // TODO: if LSP responds with error to any of the file events, then we'll become
          // out of sync, and we must stop. (potentially restart).
          switch (fileEvent.kind) {
            case FileEventKind.OPEN:
              this._fileOpen(fileEvent);
              break;
            case FileEventKind.CLOSE:
              this._fileClose(fileEvent);
              break;
            case FileEventKind.EDIT:
              this._fileEdit(fileEvent);
              break;
            default:
              this._logger.error(
                'Unrecognized fileEvent ' + JSON.stringify(fileEvent),
              );
          }
          this._lspFileVersionNotifier.onEvent(fileEvent);
        })
    );
  }

  async _stop(): Promise<void> {
    if (this._state === 'Stopping' || this._state === 'Stopped') {
      return;
    }
    if (this._lspConnection == null) {
      this._state = 'Stopped';
      return;
    }

    this._state = 'Stopping';
    try {
      // Request the server to close down. It will respond when it's done,
      // but it won't actually terminate its stdin/stdout/process (since if
      // it did then we might not get the respone!)
      await this._lspConnection.shutdown();
      // Now we can let the server terminate:
      this._lspConnection.exit();
    } catch (e) {
      this._logLspException(e);
    }
    this._lspConnection.dispose();
    // Thanks to this dispose(), any outstanding requests will now fail.
    // (If we didn't dispose, then they'd be stuck indefinitely).
    // The dispose handler also resets _lspConnection to null.

    this._state = 'Stopped';
  }

  _errorString(error: any, command?: ?string): string {
    let msg;

    if (error.message != null) {
      msg = error.message;
      // works for Javascript Error objects, and for LSP ResponseError objects
    } else {
      msg = String(error);
    }

    // In some places (like errors reported while attempting to spawn the
    // process) it's useful to report the command we tried to spawn. The caller
    // will indicate we should report it by passing 'command' argument.
    // In some cases like ENOENT coming out of childProcess 'error' event,
    // the path is included in the error message, so we refrain from adding it.
    // In others like EACCESs, the path isn't, so we add it ourselves:
    if (command != null && command !== '' && !msg.includes(command)) {
      msg = `${command} - ${msg}`;
    }

    // If the error was a well-formed JsonRPC error, then there's no reason to
    // include stdout: all the contents of stdout are presumably already in
    // the ResponseError object. Otherwise we should include stdout.
    if (!(error instanceof rpc.ResponseError) && this._childOut.stdout !== '') {
      msg = `${msg} - ${this._childOut.stdout}`;
    }

    // But we'll always want to show stderr stuff if there was any.
    if (this._childOut.stderr !== '') {
      msg = `${msg} - ${this._childOut.stderr}`;
    }

    return msg;
  }

  _logLspException(e: Error): void {
    if (e.code != null && Number(e.code) === ErrorCodes.RequestCancelled) {
      // RequestCancelled is normal and shouldn't be logged.
      return;
    }
    let msg = this._errorString(e);
    if (e.data != null && e.data.stack != null) {
      msg += `\n  LSP STACK:\n${String(e.data.stack)}`;
    }
    msg += `\n  NUCLIDE STACK:\n${e.stack}`;
    this._logger.error(msg);
  }

  _handleError(data: [Error, ?Object, ?number]): void {
    if (this._state === 'Stopping' || this._state === 'Stopped') {
      return;
    }

    // CARE! This method may be called before initialization has finished.
    const [error, message, count] = data;
    // 'message' and 'count' are only provided on writes that failed.
    // Count is how many writes total have failed over this jsonRpcConnection.
    // Message is the JsonRPC object we were trying to write.
    if (message != null && count != null) {
      this._logger.error(
        `Lsp.JsonRpc.${String(error)} - ${count} errors so far - ${JSON.stringify(message)}`,
      );
    } else {
      this._logger.error(`Lsp.JsonRpc.${String(error)}`);
    }
    if (count != null && count <= 3) {
      return;
    }
    this._host
      .dialogNotification(
        'error',
        `Connection to the language server is erroring; shutting it down - ${this._errorString(error)}`,
      )
      .refCount()
      .subscribe(); // fire and forget
    this._stop(); // method is awaitable, but we kick it off fire-and-forget.
  }

  _handleClose(): void {
    // CARE! This method may be called before initialization has finished.

    if (this._state === 'Stopping' || this._state === 'Stopped') {
      this._logger.info('Lsp.Close');
      return;
    }

    const prevState = this._state;
    this._state = 'Stopped';
    if (this._lspConnection != null) {
      this._lspConnection.dispose();
    }

    // Should we restart or not? depends...
    if (prevState !== 'Running') {
      this._logger.error("Lsp.Close - wasn't running, so won't restart.");
      return;
    }
    const now = Date.now();
    this._recentRestarts.push(now);
    while (this._recentRestarts[0] < now - 3 * 60 * 1000) {
      this._recentRestarts.shift();
    }
    if (this._recentRestarts.length >= 5) {
      this._logger.error('Lsp.Close - will not restart.');
      this._host
        .dialogNotification(
          'error',
          'Language server has crashed 5 times in the last 3 minutes. It will not be restarted.',
        )
        .refCount()
        .subscribe(); // fire and forget
    } else {
      this._logger.error('Lsp.Close - will attempt to restart');
      this._host.consoleNotification(
        this._consoleSource,
        'warning',
        'Automatically restarting language service.',
      );
      this._state = 'Initial';
      this.start();
    }
  }

  _handleLogMessageNotification(params: LogMessageParams): void {
    // CARE! This method may be called before initialization has finished.
    this._host.consoleNotification(
      this._consoleSource,
      messageTypeToAtomLevel(params.type),
      params.message,
    );
  }

  _handleShowMessageNotification(params: ShowMessageParams): void {
    // CARE! This method may be called before initialization has finished.
    this._host
      .dialogNotification(messageTypeToAtomLevel(params.type), params.message)
      .refCount()
      .subscribe(); // fire and forget
  }

  async _handleShowMessageRequest(
    params: ShowMessageRequestParams,
    cancellationToken: Object,
  ): Promise<any> {
    // NOT YET IMPLEMENTED: that cancellationToken will be fired if the LSP
    // server sends a cancel notification for this ShowMessageRequest. We should
    // respect it.

    // CARE! This method may be called before initialization has finished.
    const actions = params.actions || [];
    const titles = actions.map(action => action.title);
    // LSP gives us just a list of titles e.g. ['Open', 'Close']
    // But Nuclide prefers to display the dismiss icon separately as an X,
    // not as a button. We'll use heuristics to bridge the two...
    // * If amongst the LSP titles there is exactly one named Cancel/Close/
    //   Ok, then use it for the X, and show the other titles as buttons.
    // * If there are two more more, pick one of them (prefer Cancel over
    //   Close over Ok) as the X, but show all of them as buttons.
    // * If there were none, then synthesize a 'Close' action for the X,
    //   and display all the LSP titles as buttons.
    let closeTitle;
    const heuristic = ['Cancel', 'cancel', 'Close', 'close', 'OK', 'Ok', 'ok'];
    const candidates = titles.filter(title => heuristic.includes(title));
    if (candidates.length === 0) {
      closeTitle = 'Close';
      actions.push({title: 'Close'});
    } else if (candidates.length === 1) {
      closeTitle = candidates[0];
      titles.splice(titles.indexOf(closeTitle), 1);
    } else {
      closeTitle = candidates[0];
    }

    const response = await this._host
      .dialogRequest(
        messageTypeToAtomLevel(params.type),
        params.message,
        titles,
        closeTitle,
      )
      .refCount()
      .toPromise();

    const chosenAction = actions.find(action => action.title === response);
    invariant(chosenAction != null);
    return chosenAction;
  }

  getRoot(): string {
    return this._projectRoot;
  }

  async tryGetBufferWhenWeAndLspAtSameVersion(
    fileVersion: FileVersion,
  ): Promise<?simpleTextBuffer$TextBuffer> {
    if (this._state !== 'Running') {
      return null;
    }

    // Await until we have received this exact version from the client.
    // (Might be null in the case the user had already typed further
    // before we got a chance to be called.)
    const buffer = await this._fileCache.getBufferAtVersion(fileVersion);
    invariant(buffer == null || buffer.changeCount === fileVersion.version);

    // Await until this exact version has been pushed to LSP too.
    if (
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      if (buffer != null) {
        // Invariant: LSP is never ahead of our fileCache.
        // Therefore it will eventually catch up.
        this._logger.error(
          'LSP.version - could not catch up to version=' + fileVersion.version,
        );
      }
      return null;
    }

    // During that second await, if the server received further edits from the client,
    // then the buffer object might have been mutated in place, so its file-verion will
    // no longer match. In this case we return null.
    return buffer != null && buffer.changeCount === fileVersion.version
      ? buffer
      : null;
  }

  _fileOpen(fileEvent: FileOpenEvent): void {
    invariant(this._state === 'Running' && this._lspConnection != null);
    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params: DidOpenTextDocumentParams = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath,
        languageId: 'python', // TODO
        version: fileEvent.fileVersion.version,
        text: fileEvent.contents,
      },
    };
    this._lspConnection.didOpenTextDocument(params);
  }

  _fileClose(fileEvent: FileCloseEvent): void {
    invariant(this._state === 'Running' && this._lspConnection != null);
    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params: DidCloseTextDocumentParams = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath,
      },
    };
    this._lspConnection.didCloseTextDocument(params);
  }

  _fileEdit(fileEvent: FileEditEvent): void {
    invariant(this._state === 'Running' && this._lspConnection != null);
    let contentChange: TextDocumentContentChangeEvent;
    switch (this._derivedServerCapabilities.serverWantsChange) {
      case 'incremental':
        contentChange = {
          range: atomRangeToRange(fileEvent.oldRange),
          text: fileEvent.newText,
        };
        break;
      case 'full':
        const buffer = this._fileCache.getBufferForFileEdit(fileEvent);
        contentChange = {
          text: buffer.getText(),
        };
        break;
      case 'none':
        return;
      default:
        invariant(false); // unreachable
    }

    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params: DidChangeTextDocumentParams = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath,
        version: fileEvent.fileVersion.version,
      },
      contentChanges: [contentChange],
    };
    this._lspConnection.didChangeTextDocument(params);
  }

  getDiagnostics(fileVersion: FileVersion): Promise<?DiagnosticProviderUpdate> {
    this._logger.error('Lsp: should observeDiagnostics, not getDiagnostics');
    return Promise.resolve(null);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    // Note: this function can (and should!) be called even before
    // we reach state 'Running'.

    // First some helper functions to map LSP into Nuclide data structures...
    // TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
    const convertOne = (
      filePath: NuclideUri,
      diagnostic: Diagnostic,
    ): FileDiagnosticMessage => {
      return {
        // TODO: diagnostic.code
        scope: 'file',
        providerName: diagnostic.source || 'TODO: VSCode LSP',
        type: convertSeverity(diagnostic.severity),
        filePath,
        text: diagnostic.message,
        range: rangeToAtomRange(diagnostic.range),
      };
    };

    const convert = (
      params: PublishDiagnosticsParams,
    ): FileDiagnosticUpdate => {
      const filePath = this._convertLspUriToNuclideUri(params.uri);
      return {
        filePath,
        messages: params.diagnostics.map(d => convertOne(filePath, d)),
      };
    };

    return this._diagnosticUpdates
      .mergeMap(perConnectionUpdates =>
        ensureInvalidations(this._logger, perConnectionUpdates.map(convert)),
      )
      .publish();
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?AutocompleteResult> {
    if (
      this._state !== 'Running' ||
      this._serverCapabilities.completionProvider == null ||
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
    }

    const params = createTextDocumentPositionParams(
      fileVersion.filePath,
      position,
    );

    let response;
    try {
      response = await this._lspConnection.completion(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    if (Array.isArray(response)) {
      return {
        isIncomplete: false,
        items: response.map(convertCompletion),
      };
    } else {
      return {
        isIncomplete: response.isIncomplete,
        items: response.items.map(convertCompletion),
      };
    }
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.definitionProvider ||
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
    }
    const params = createTextDocumentPositionParams(
      fileVersion.filePath,
      position,
    );

    let response;
    try {
      response = await this._lspConnection.gotoDefinition(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    if (
      response == null ||
      (Array.isArray(response) && response.length === 0)
    ) {
      return null;
    }
    return {
      // TODO: use wordAtPos to determine queryrange
      queryRange: [new atom$Range(position, position)],
      definitions: this.locationsDefinitions(response),
    };
  }

  getDefinitionById(file: NuclideUri, id: string): Promise<?Definition> {
    this._logger.error('NYI: getDefinitionById');
    return Promise.resolve(null);
  }

  async findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.referencesProvider ||
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
    }
    const buffer = await this._fileCache.getBufferAtVersion(fileVersion);
    // buffer may still be null despite the above check. We do handle that!

    const positionParams = createTextDocumentPositionParams(
      fileVersion.filePath,
      position,
    );
    const params = {...positionParams, context: {includeDeclaration: true}};
    // ReferenceParams is like TextDocumentPositionParams but with one extra field.

    let response;
    try {
      response = await this._lspConnection.findReferences(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    const references = response.map(this.locationToFindReference);

    // We want to know the name of the symbol. The best we can do is reconstruct
    // this from the range of one (any) of the references we got back. We're only
    // willing to do this for references in files already in the filecache, but
    // thanks to includeDeclaration:true then the file where the user clicked will
    // assuredly be in the cache!
    let referencedSymbolName = null;
    // The very best we can do is if we and LSP were in sync at the moment the
    // request was dispatched, and buffer still hasn't been modified since then,
    // so we can guarantee that the ranges returned by LSP are identical
    // to what we have in hand.
    if (buffer != null) {
      const refInBuffer = references.find(
        ref => ref.uri === fileVersion.filePath,
      );
      if (refInBuffer != null) {
        referencedSymbolName = buffer.getTextInRange(refInBuffer.range);
      }
    }
    // Failing that, if any of the buffers are open we'll use them (even if we
    // have no guarantees about which version our buffers are at compared to
    // the ranges that LSP sent us back, so it might be a little off.)
    if (referencedSymbolName == null) {
      for (const ref of references) {
        const refBuffer = this._fileCache.getBuffer(ref.uri);
        if (refBuffer != null) {
          referencedSymbolName = refBuffer.getTextInRange(ref.range);
          break;
        }
      }
    }
    // Failing that we'll try using a regexp on the buffer. (belt and braces!)
    if (referencedSymbolName == null && buffer != null) {
      const WORD_REGEX = /\w+/gi;
      const match = wordAtPositionFromBuffer(buffer, position, WORD_REGEX);
      if (match != null && match.wordMatch.length > 0) {
        referencedSymbolName = match.wordMatch[0];
      }
    }
    // Failing that ...
    if (referencedSymbolName == null) {
      referencedSymbolName = 'symbol';
    }

    return {
      type: 'data',
      baseUri: this._projectRoot,
      referencedSymbolName,
      references,
    };
  }

  async getCoverage(filePath: NuclideUri): Promise<?CoverageResult> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.typeCoverageProvider
    ) {
      return null;
    }
    const params = {textDocument: toTextDocumentIdentifier(filePath)};

    let response;
    try {
      response = await this._lspConnection.typeCoverage(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    const convertUncovered = (uncovered: UncoveredRange) => ({
      range: rangeToAtomRange(uncovered.range),
      message: uncovered.message,
    });
    return {
      percentage: response.coveredPercent,
      uncoveredRegions: response.uncoveredRanges.map(convertUncovered),
    };
  }

  async getOutline(fileVersion: FileVersion): Promise<?Outline> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.documentSymbolProvider ||
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
    }
    const params = {
      textDocument: toTextDocumentIdentifier(fileVersion.filePath),
    };

    let response;
    try {
      response = await this._lspConnection.documentSymbol(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    // The response is a flat list of SymbolInformation, which has location+name+containerName.
    // We're going to reconstruct a tree out of them. This can't be done with 100% accuracy in
    // all cases, but it can be done accurately in *almost* all cases.

    // For each symbolInfo in the list, we have exactly one corresponding tree node.
    // We'll also sort the nodes in lexical order of occurrence in the source
    // document. This is useful because containers always come lexically before their
    // children. (This isn't a LSP guarantee; just a heuristic.)
    const list: Array<
      [SymbolInformation, OutlineTree],
    > = response.map(symbol => [
      symbol,
      {
        icon: symbolKindToAtomIcon(symbol.kind),
        tokenizedText: symbolToTokenizedText(symbol),
        startPosition: positionToPoint(symbol.location.range.start),
        children: [],
      },
    ]);
    list.sort(([, aNode], [, bNode]) =>
      aNode.startPosition.compare(bNode.startPosition),
    );

    // We'll need to look up for parents by name, so construct a map from names to nodes
    // of that name. Note: an undefined SymbolInformation.containerName means root,
    // but it's easier for us to represent with ''.
    const mapElements = list.map(([symbol, node]) => [symbol.name, node]);
    const map: Map<string, Array<OutlineTree>> = collect(mapElements);
    if (map.has('')) {
      this._logger.error(
        'Outline textDocument/documentSymbol returned an empty symbol name',
      );
    }

    // The algorithm for reconstructing the tree out of list items rests on identifying
    // an item's parent based on the item's containerName. It's easy if there's only one
    // parent of that name. But if there are multiple parent candidates, we'll try to pick
    // the one that comes immediately lexically before the item. (If there are no parent
    // candidates, we've been given a malformed item, so we'll just ignore it.)
    const root: OutlineTree = {
      plainText: '',
      startPosition: new Point(0, 0),
      children: [],
    };
    map.set('', [root]);
    for (const [symbol, node] of list) {
      const parentName = symbol.containerName || '';
      const parentCandidates = map.get(parentName);
      if (parentCandidates == null) {
        this._logger.error(
          `Outline textDocument/documentSymbol ${symbol.name} is missing container ${parentName}`,
        );
      } else {
        invariant(parentCandidates.length > 0);
        // Find the first candidate that's lexically *after* our symbol.
        const symbolPos = positionToPoint(symbol.location.range.start);
        const iAfter = parentCandidates.findIndex(
          p => p.startPosition.compare(symbolPos) > 0,
        );
        if (iAfter === -1) {
          // No candidates after item? Then item's parent is the last candidate.
          parentCandidates[parentCandidates.length - 1].children.push(node);
        } else if (iAfter === 0) {
          // All candidates after item? That's an error! We'll arbitrarily pick first one.
          parentCandidates[0].children.push(node);
          this._logger.error(
            `Outline textDocument/documentSymbol ${symbol.name} comes after its container`,
          );
        } else {
          // Some candidates before+after? Then item's parent is the last candidate before.
          parentCandidates[iAfter - 1].children.push(node);
        }
      }
    }

    return {outlineTrees: root.children};
  }

  async typeHint(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?TypeHint> {
    if (!this._serverCapabilities.hoverProvider) {
      return null;
    }
    if (
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
      // If the user typed more characters before we ended up being invoked, then there's
      // no way we can fulfill the request.
    }
    const params = createTextDocumentPositionParams(
      fileVersion.filePath,
      position,
    );

    let response;
    try {
      response = await this._lspConnection.hover(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    let hint = response.contents;
    if (Array.isArray(hint)) {
      hint = hint.length > 0 ? hint[0] : '';
      // TODO: render multiple hints at once with a thin divider between them
    }
    if (typeof hint === 'string') {
      // TODO: convert markdown to text
    } else {
      hint = hint.value;
      // TODO: colorize code if possible. (is hard without knowing its context)
    }

    let range = new atom$Range(position, position);
    if (response.range) {
      range = rangeToAtomRange(response.range);
    }

    return hint ? {hint, range} : null;
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.documentHighlightProvider ||
      !await this._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion)
    ) {
      return null;
    }
    const params = createTextDocumentPositionParams(
      fileVersion.filePath,
      position,
    );

    let response;
    try {
      response = await this._lspConnection.documentHighlight(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    const convertHighlight = highlight => rangeToAtomRange(highlight.range);
    return response.map(convertHighlight);
  }

  async formatSource(
    fileVersion: FileVersion,
    atomRange: atom$Range,
  ): Promise<?Array<TextEdit>> {
    if (this._state !== 'Running') {
      return null;
    }

    // In general, what should happen if we request a reformat but the user does typing
    // while we're waiting for the reformat results to be (asynchronously) delivered?
    // This is entirely handled by our upstream caller in CodeFormatManager.js which
    // verifies that the buffer's contents haven't changed between asking for reformat and
    // applying it; if they have, then it displays an error message to the user.
    // So: this function doesn't need to do any such verification itself.

    // But we do need the buffer, to know whether atomRange covers the whole document.
    // And if we can't get it for reasons of syncing, then we'll have to bail by reporting
    // the same error as that upstream caller.
    const buffer = await this.tryGetBufferWhenWeAndLspAtSameVersion(
      fileVersion,
    );
    if (buffer == null) {
      this._logger.error(
        'LSP.formatSource - buffer changed before we could format',
      );
      return null;
    }
    const options = {tabSize: 2, insertSpaces: true};
    // TODO: from where should we pick up these options? Can we omit them?
    const params = {
      textDocument: toTextDocumentIdentifier(fileVersion.filePath),
      options,
    };
    let response;

    // The user might have requested to format either some or all of the buffer.
    // And the LSP server might have the capability to format some or all.
    // We'll match up the request+capability as best we can...
    const canAll = Boolean(this._serverCapabilities.documentFormattingProvider);
    const canRange = Boolean(
      this._serverCapabilities.documentRangeFormattingProvider,
    );
    const wantAll = buffer.getRange().compare(atomRange) === 0;
    if (canAll && (wantAll || !canRange)) {
      try {
        response = await this._lspConnection.documentFormatting(params);
      } catch (e) {
        this._logLspException(e);
        return null;
      }
    } else if (canRange) {
      // Range is exclusive, and Nuclide snaps it to entire rows. So range.start
      // is character 0 of the start line, and range.end is character 0 of the
      // first line AFTER the selection.
      const range = atomRangeToRange(atomRange);
      const params2 = {...params, range};
      try {
        response = await this._lspConnection.documentRangeFormatting(params2);
      } catch (e) {
        this._logLspException(e);
        return null;
      }
    } else {
      this._logger.error('LSP.formatSource - not supported by server');
      return null;
    }

    // As mentioned, the user might have done further typing during that 'await', but if so then
    // our upstream caller will catch it and report an error: no need to re-verify here.

    const convertRange = lspTextEdit => ({
      oldRange: rangeToAtomRange(lspTextEdit.range),
      newText: lspTextEdit.newText,
    });
    return response.map(convertRange);
  }

  formatEntireFile(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    // A language service implements either formatSource or formatEntireFile,
    // and we should pick formatSource in our AtomLanguageServiceConfig.
    this._logger.error(
      'LSP CodeFormat providers should use formatEntireFile: false',
    );
    return Promise.resolve(null);
  }

  getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    this._logger.error('NYI: getEvaluationExpression');
    return Promise.resolve(null);
  }

  supportsSymbolSearch(directories: Array<NuclideUri>): Promise<boolean> {
    return compact(this._supportsSymbolSearch).take(1).toPromise();
  }

  async symbolSearch(
    query: string,
    directories: Array<NuclideUri>,
  ): Promise<?Array<SymbolResult>> {
    if (
      this._state !== 'Running' ||
      !this._serverCapabilities.workspaceSymbolProvider
    ) {
      return null;
    }
    const params = {query};

    let response;
    try {
      response = await this._lspConnection.workspaceSymbol(params);
    } catch (e) {
      this._logLspException(e);
      return null;
    }

    return response.map(convertSearchResult);
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    this._logger.error('NYI: getProjectRoot');
    return Promise.resolve(null);
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    this._logger.error('NYI: isFileInProject');
    return Promise.resolve(false);
  }

  // TODO: (asiandrummer) LSP implementations should honor file URI protocol.
  // For now, check if the URI starts with the scheme, and strip it out
  // manually.
  // For cases where the parsed URI does not contain a correct URI protocol
  // and/or a pathname (e.g: an empty string, or a non-file URI (nuclide:// or
  // http:// with a webpage URL)), log an error and return the raw URI.
  _convertLspUriToNuclideUri(uri: string): NuclideUri {
    const urlObject = url.parse(uri);
    // LSP should only send URI with `file:` protocol or without any protocol.
    if (urlObject.protocol !== 'file:' && urlObject.protocol) {
      this._logger.error(
        `Incorrect URI protocol ${urlObject.protocol} - using the raw URI instead.`,
      );
      return uri;
    }

    if (!urlObject.pathname) {
      this._logger.error(
        'URI pathname does not exist - using the raw URI instead.',
      );
      return uri;
    }

    return urlObject.pathname;
  }

  // TODO: (asiandrummer) This function should use the converted URI from
  // this._convertLspUriToNuclideUri function, but because the converted URI
  // is being used to be compared with the URI from fileCache, it's a little
  // more dangerous to switch to it than others.
  // Since GraphQL language service is the only one with the different URI
  // format, and it does not implement the `find references` feature yet,
  // we can defer dealing with the URI conversion until then.
  locationToFindReference(location: Location): Reference {
    return {
      uri: location.uri,
      name: null,
      range: rangeToAtomRange(location.range),
    };
  }

  locationToDefinition(location: Location): Definition {
    return {
      path: this._convertLspUriToNuclideUri(location.uri),
      position: positionToPoint(location.range.start),
      language: 'Python', // TODO
      projectRoot: this._projectRoot,
    };
  }

  locationsDefinitions(locations: Location | Location[]): Array<Definition> {
    if (Array.isArray(locations)) {
      return locations.map(this.locationToDefinition.bind(this));
    } else {
      return [this.locationToDefinition(locations)];
    }
  }
}

class DerivedServerCapabilities {
  serverWantsOpenClose: boolean;
  serverWantsChange: 'full' | 'incremental' | 'none';

  constructor(capabilities: ServerCapabilities, logger: log4js$Logger) {
    let syncKind;

    // capabilities.textDocumentSync is either a number (protocol v2)
    // or an object (protocol v3) or absent (indicating no capabilities).
    const sync = capabilities.textDocumentSync;
    if (typeof sync === 'number') {
      this.serverWantsOpenClose = true;
      syncKind = sync;
    } else if (typeof sync === 'object') {
      this.serverWantsOpenClose = Boolean(sync.openClose);
      syncKind = Number(sync.change);
    } else {
      this.serverWantsOpenClose = false;
      syncKind = TextDocumentSyncKind.None;
      if (sync != null) {
        logger.error(
          'LSP - invalid capabilities.textDocumentSync from server: ' +
            JSON.stringify(sync),
        );
      }
    }

    // The syncKind is a number, supposed to fall in the TextDocumentSyncKind
    // enumeration, so we verify that here:
    if (syncKind === TextDocumentSyncKind.Full) {
      this.serverWantsChange = 'full';
    } else if (syncKind === TextDocumentSyncKind.Incremental) {
      this.serverWantsChange = 'incremental';
    } else if (syncKind === TextDocumentSyncKind.None) {
      this.serverWantsChange = 'none';
    } else {
      logger.error('LSP initialize: invalid TextDocumentSyncKind');
      this.serverWantsChange = 'none';
    }
  }
}

// TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
export function toTextDocumentIdentifier(
  filePath: NuclideUri,
): TextDocumentIdentifier {
  return {
    uri: filePath,
  };
}

export function pointToPosition(position: atom$Point): Position {
  return {
    line: position.row,
    character: position.column,
  };
}

export function positionToPoint(position: Position): atom$Point {
  return new Point(position.line, position.character);
}

export function rangeToAtomRange(range: Range): atom$Range {
  return new atom$Range(
    positionToPoint(range.start),
    positionToPoint(range.end),
  );
}

export function atomRangeToRange(range: atom$Range): Range {
  return {
    start: pointToPosition(range.start),
    end: pointToPosition(range.end),
  };
}

export function convertSeverity(severity?: number): DiagnosticMessageType {
  switch (severity) {
    case null:
    case undefined:
    case DiagnosticSeverity.Error:
    default:
      return 'Error';
    case DiagnosticSeverity.Warning:
    case DiagnosticSeverity.Information:
    case DiagnosticSeverity.Hint:
      return 'Warning';
  }
}

// TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
export function createTextDocumentPositionParams(
  filePath: string,
  position: atom$Point,
): TextDocumentPositionParams {
  return {
    textDocument: toTextDocumentIdentifier(filePath),
    position: pointToPosition(position),
  };
}

export function convertCompletion(item: CompletionItem): Completion {
  return {
    text: item.insertText || item.label,
    displayText: item.label,
    type: item.detail,
    description: item.documentation,
  };
}

function messageTypeToAtomLevel(type: number): ShowNotificationLevel {
  switch (type) {
    case LspMessageType.Info:
      return 'info';
    case LspMessageType.Warning:
      return 'warning';
    case LspMessageType.Log:
      return 'log';
    case LspMessageType.Error:
      return 'error';
    default:
      return 'error';
  }
}

// Converts an LSP SymbolInformation.kind number into an Atom icon
// from https://github.com/atom/atom/blob/master/static/octicons.less -
// you can see the pictures at https://octicons.github.com/
function symbolKindToAtomIcon(kind: number): string {
  // for reference, vscode: https://github.com/Microsoft/vscode/blob/be08f9f3a1010354ae2d8b84af017ed1043570e7/src/vs/editor/contrib/suggest/browser/media/suggest.css#L135
  // for reference, hack: https://github.com/facebook/nuclide/blob/20cf17dca439e02a64f4365f3a52b0f26cf53726/pkg/nuclide-hack-rpc/lib/SymbolSearch.js#L120
  switch (kind) {
    case SymbolKind.File:
      return 'file';
    case SymbolKind.Module:
      return 'file-submodule';
    case SymbolKind.Namespace:
      return 'file-submodule';
    case SymbolKind.Package:
      return 'package';
    case SymbolKind.Class:
      return 'code';
    case SymbolKind.Method:
      return 'zap';
    case SymbolKind.Property:
      return 'key';
    case SymbolKind.Field:
      return 'key';
    case SymbolKind.Constructor:
      return 'zap';
    case SymbolKind.Enum:
      return 'file-binary';
    case SymbolKind.Interface:
      return 'puzzle';
    case SymbolKind.Function:
      return 'zap';
    case SymbolKind.Variable:
      return 'pencil';
    case SymbolKind.Constant:
      return 'quote';
    case SymbolKind.String:
      return 'quote';
    case SymbolKind.Number:
      return 'quote';
    case SymbolKind.Boolean:
      return 'quote';
    case SymbolKind.Array:
      return 'list-ordered';
    default:
      return 'question';
  }
}

// Converts an LSP SymbolInformation into TokenizedText
function symbolToTokenizedText(symbol: SymbolInformation): TokenizedText {
  const tokens = [];

  // The TokenizedText ontology is deliberately small, much smaller than
  // SymbolInformation.kind, because it's used for colorization and you don't
  // want your colorized text looking like a fruit salad.
  switch (symbol.kind) {
    case SymbolKind.File:
    case SymbolKind.Module:
    case SymbolKind.Package:
    case SymbolKind.Namespace:
      tokens.push(plain(symbol.name));
      break;
    case SymbolKind.Class:
    case SymbolKind.Interface:
      tokens.push(className(symbol.name));
      break;
    case SymbolKind.Constructor:
      tokens.push(constructor(symbol.name));
      break;
    case SymbolKind.Method:
    case SymbolKind.Property:
    case SymbolKind.Field:
    case SymbolKind.Enum:
    case SymbolKind.Function:
    case SymbolKind.Constant:
    case SymbolKind.Variable:
    case SymbolKind.Array:
      tokens.push(method(symbol.name));
      break;
    case SymbolKind.String:
    case SymbolKind.Number:
    case SymbolKind.Boolean:
      tokens.push(string(symbol.name));
      break;
    default:
      tokens.push(plain(symbol.name));
  }

  return tokens;
}

export function convertSearchResult(info: SymbolInformation): SymbolResult {
  let hoverText = 'unknown';
  for (const key in SymbolKind) {
    if (info.kind === SymbolKind[key]) {
      hoverText = key;
    }
  }
  return {
    path: this._convertLspUriToNuclideUri(info.location.uri),
    line: info.location.range.start.line,
    column: info.location.range.start.character,
    name: info.name,
    containerName: info.containerName,
    icon: symbolKindToAtomIcon(info.kind),
    hoverText,
  };
}

class JsonRpcLogger {
  _logger: log4js$Logger;

  constructor(logger: log4js$Logger) {
    this._logger = logger;
  }

  error(message: string): void {
    this._logger.error('Lsp.JsonRpc ' + message);
  }

  warn(message: string): void {
    this._logger.info('Lsp.JsonRpc ' + message);
  }

  info(message: string): void {
    this._logger.info('Lsp.JsonRpc ' + message);
  }

  log(message: string): void {
    this._logger.trace('Jsp.JsonRpc ' + message);
  }
}

class JsonRpcTraceLogger {
  _logger: log4js$Logger;

  constructor(logger: log4js$Logger) {
    this._logger = logger;
  }

  log(message: string, data: ?string): void {
    this._logger.info(`LSP.trace: ${message} ${data || ''}`);
  }
}
