'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LspLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _through;

function _load_through() {
  return _through = _interopRequireDefault(require('through'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons/range');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = _interopRequireWildcard(require('vscode-jsonrpc'));
}

var _convert;

function _load_convert() {
  return _convert = _interopRequireWildcard(require('./convert'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _jsonrpc;

function _load_jsonrpc() {
  return _jsonrpc = require('./jsonrpc');
}

var _LspConnection;

function _load_LspConnection() {
  return _LspConnection = require('./LspConnection');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('./protocol');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
class LspLanguageService {
  // tracks which fileversions we've sent to LSP

  // Whenever we trigger a new request, we cancel the outstanding request, so
  // only one request of these types would be active at a time. Note that the
  // language server is free to ignore any cancellation request, so we could
  // still potentially have multiple outstanding requests of the same type.


  // These fields reflect our own state.
  // (Most should be nullable types, but it's not worth the bother.)
  // tracks which fileversions we've sent to LSP
  // this is the one we're given
  constructor(logger, fileCache, host, languageId, command, args, spawnOptions = {}, projectRoot, fileExtensions, initializationOptions) {
    this._state = 'Initial';
    this._stateIndicator = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._progressIndicators = new Map();
    this._actionRequiredIndicators = new Map();
    this._recentRestarts = [];
    this._diagnosticUpdates = new _rxjsBundlesRxMinJs.Subject();
    this._supportsSymbolSearch = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._childOut = { stdout: '', stderr: '' };
    this._hoverCancellation = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).CancellationTokenSource();
    this._highlightCancellation = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).CancellationTokenSource();

    this._logger = logger;
    this._fileCache = fileCache;
    this._masterHost = host;
    this._host = host;
    this._projectRoot = projectRoot;
    this._languageId = languageId;
    this._command = command;
    this._args = args;
    this._spawnOptions = spawnOptions;
    this._fileExtensions = fileExtensions;
    this._initializationOptions = initializationOptions;
  } // is really "?LspConnection"
  // Fields which become live after we receive an initializeResponse:

  // Fields which become live inside start(), when we spawn the LSP process.
  // Disposing of the _lspConnection will dispose of all of them.
  // tracks which fileversions we've received from Nuclide client
  // supplies the options for spawning a process
  // this is created per-connection
  // tracks which fileversions we've received from Nuclide client

  // These fields are provided upon construction


  dispose() {
    this._stop().catch(_ => {}).then(_ => this._masterHost.dispose());
  }

  _setState(state, actionRequiredDialogMessage, existingDialogToDismiss) {
    this._state = state;
    this._stateIndicator.dispose();
    const nextDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._stateIndicator = nextDisposable;

    if (state === 'Initial' || state === 'Running') {
      // No user indication needed for either state.
      // In the case of 'Initial', that's because the only times we get
      // in this state is when we're about to call start().
    } else if (state === 'Starting' || state === 'Stopping') {
      // Show a progress spinner
      const tooltip = state === 'Starting' ? `Starting ${this._languageId} language service...` : `Stopping ${this._languageId} language service...`;
      this._masterHost.showProgress(tooltip).then(progress => {
        if (nextDisposable.disposed) {
          progress.dispose();
        } else {
          nextDisposable.add(progress);
        }
      });
    } else if (state === 'StartFailed' || state === 'Stopped') {
      // StartFailed is when we failed to spawn the language server
      // Stopped is when the JsonRPC transport has been erroring,
      // or when the connection has been closed too many times and we give up.

      const tooltip = state === 'StartFailed' ? `Failed to start ${this._languageId} - click to retry.` : `Crash in ${this._languageId} - click to restart.`;
      const defaultMessage = state === 'StartFailed' ? `Failed to start ${this._languageId} language service.` : `Language service ${this._languageId} has crashed.`;
      const button = state === 'StartFailed' ? 'Retry' : 'Restart';
      // flowlint-next-line sketchy-null-string:off
      const message = actionRequiredDialogMessage || defaultMessage;

      const subscription = this._masterHost.showActionRequired(tooltip, { clickable: true }).refCount().switchMap(_ => {
        if (existingDialogToDismiss != null) {
          existingDialogToDismiss.unsubscribe();
        }
        return this._masterHost.dialogRequest('error', message, [button], 'Close').refCount();
      }).subscribe(dialogResponse => {
        if (dialogResponse !== button) {
          return;
        }
        // Note that if a new state had come along, that would have
        // unsubscribed nextDisposable, which would (1) dismiss the action-
        // required indicator, (2) dismiss the dialogRequest. The fact that
        // we're here now means that this has not happened, i.e. a new state
        // has not come along.
        this._masterHost.consoleNotification(this._languageId, 'info', `Restarting ${this._languageId}`);
        this._setState('Initial');
        this.start();
      });
      nextDisposable.add(subscription);
    } else {
      state;

      if (!false) {
        throw new Error('unreachable state');
      }
    }
  }

  start() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this._state === 'Initial')) {
        throw new Error('Invariant violation: "this._state === \'Initial\'"');
      }

      _this._setState('Starting');

      const startTimeMs = Date.now();
      const spawnCommandForLogs = `${_this._command} ${_this._args.join(' ')}`;

      try {
        const perConnectionDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
        // The various resources+subscriptions associated with a LspConnection
        // are stored in here. When you call _lspConnection.dispose(), it
        // disposes of all of them (via the above perConnectionDisposables),
        // and also sets _lspConnection and other per-connection fields to null
        // so that any attempt to use them will throw an exception.

        // Each connection gets its own 'host' object, as an easy way to
        // get rid of all outstanding busy-signals and notifications and
        // dialogs from that connection.
        _this._host = yield (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(_this._masterHost, _this._logger);
        perConnectionDisposables.add(function () {
          _this._host.dispose();
          _this._host = _this._masterHost;
        });

        // Error reporting? We'll be catching+reporting errors at each layer:
        // 1. operating system support for launch the process itself
        // 2. stdout/stderr sitting on top of that
        // 3. jsonrpc on top of that
        // 4. lsp on top of that

        let childProcess;
        try {
          _this._logger.info(`Spawn: ${spawnCommandForLogs}`);
          if (_this._command === '') {
            throw new Error('No command provided for launching language server');
            // if we try to spawn an empty command, node itself throws a "bad
            // type" error, which is jolly confusing. So we catch it ourselves.
          }
          const childProcessStream = (0, (_process || _load_process()).spawn)(_this._command, _this._args, Object.assign({
            cwd: _this._projectRoot
          }, _this._spawnOptions, {
            killTreeWhenDone: true
          })).publish();
          // disposing of the stream will kill the process, if it still exists
          const processPromise = childProcessStream.take(1).toPromise();
          perConnectionDisposables.add(childProcessStream.connect());
          childProcess = yield processPromise;
          // if spawn failed to launch it, this await will throw.
        } catch (e) {
          _this._logLspException(e);
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-start', {
            status: 'spawn failed',
            spawn: spawnCommandForLogs,
            message: e.message,
            stack: e.stack,
            timeTakenMs: Date.now() - startTimeMs
          });

          const message = `Couldn't start ${_this._languageId} server` + ` - ${_this._errorString(e, _this._command)}`;
          const dialog = _this._host.dialogNotification('error', message).refCount().subscribe();
          _this._setState('StartFailed', message, dialog);
          return;
        }

        const isVerbose = yield (0, (_passesGK || _load_passesGK()).default)('nuclide_lsp_verbose');

        // The JsonRPC layer doesn't report what happened on stderr/stdout in
        // case of an error, so we'll pick it up directly. CARE! Node has
        // three means of consuming a stream, and it will crash if you mix them.
        // Our JsonRPC library uses the .pipe() means, so we have to too.
        // Semantics: a null value for stdout means "don't collect further output
        // because we've established that the connection is JsonRPC".
        _this._childOut = { stdout: '', stderr: '' };
        const accumulate = function (streamName, data) {
          if (_this._childOut[streamName] != null && _this._childOut[streamName].length < 600) {
            const s = (_this._childOut[streamName] + data).substr(0, 600);
            _this._childOut[streamName] = s;
          }
        };
        childProcess.stdout.pipe((0, (_through || _load_through()).default)(function (data) {
          return accumulate('stdout', data);
        }));
        childProcess.stderr.pipe((0, (_through || _load_through()).default)(function (data) {
          return accumulate('stderr', data);
        }));

        const jsonRpcConnection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(childProcess.stdout), new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(childProcess.stdin), new JsonRpcLogger(_this._logger));
        if (isVerbose) {
          jsonRpcConnection.trace((_jsonrpc || _load_jsonrpc()).JsonRpcTrace.Verbose, new JsonRpcTraceLogger(_this._logger));
        }

        // We assign _lspConnection and wire up the handlers before calling
        // initialize, because any of these events might fire before initialize
        // has even returned.
        _this._lspConnection = new (_LspConnection || _load_LspConnection()).LspConnection(jsonRpcConnection);
        _this._lspConnection.onDispose(perConnectionDisposables.dispose.bind(perConnectionDisposables));
        perConnectionDisposables.add(function () {
          _this._lspConnection = null;
          // cheating here: we're saying "no thank you" to compile-time warnings
          // that _lspConnection might be invalid (since they're too burdensome)
          // but "yes please" to runtime exceptions.
        });

        const perConnectionUpdates = new _rxjsBundlesRxMinJs.Subject();
        perConnectionDisposables.add(perConnectionUpdates.complete.bind(perConnectionUpdates));
        jsonRpcConnection.onError(_this._handleError.bind(_this));
        jsonRpcConnection.onClose(_this._handleClose.bind(_this));
        // Following handlers all set _childOut.stdout to null, to indicate
        // that we've established that the output is JsonRPC, and so any raw
        // text content in stdout should NOT be used directly in error messages.
        _this._lspConnection.onTelemetryNotification(function (params) {
          _this._childOut.stdout = null;
          _this._handleTelemetryNotification(params);
        });
        _this._lspConnection.onLogMessageNotification(function (params) {
          _this._childOut.stdout = null;
          _this._handleLogMessageNotification(params);
        });
        _this._lspConnection.onShowMessageNotification(function (params) {
          _this._childOut.stdout = null;
          _this._handleShowMessageNotification(params);
        });
        _this._lspConnection.onShowMessageRequest((() => {
          var _ref = (0, _asyncToGenerator.default)(function* (params, cancel) {
            _this._childOut.stdout = null;
            return _this._handleShowMessageRequest(params, cancel);
          });

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })());
        _this._lspConnection.onProgressNotification(function (params) {
          _this._childOut.stdout = null;
          return _this._handleProgressNotification(params);
        });
        _this._lspConnection.onActionRequiredNotification(function (params) {
          _this._childOut.stdout = null;
          return _this._handleActionRequiredNotification(params);
        });
        _this._lspConnection.onApplyEditRequest((() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* (params, cancel) {
            _this._childOut.stdout = null;
            return _this._handleApplyEditRequest(params, cancel);
          });

          return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
          };
        })());
        _this._lspConnection.onDiagnosticsNotification(function (params) {
          _this._childOut.stdout = null;
          perConnectionUpdates.next(params);
        });

        yield new Promise(process.nextTick);
        _this._diagnosticUpdates.next(perConnectionUpdates);
        // CARE! to avoid a race, we guarantee that we've yielded back
        // to our caller before firing this next() and before sending any
        // diagnostic updates down it. That lets our caller subscribe in time.
        // Why this delicate? Because we don't want to buffer diagnostics, and we
        // don't want to lose any of them.
        // CARE! to avoid a different race, we await for the next tick only after
        // signing up all our handlers.

        _this._logger.info('Establishing JsonRPC connection...');
        jsonRpcConnection.listen();

        const capabilities = {
          workspace: {
            applyEdit: true,
            workspaceEdit: {
              documentChanges: true
            },
            didChangeConfiguration: {
              dynamicRegistration: false
            },
            didChangeWatchedFiles: {
              dynamicRegistration: false
            },
            symbol: {
              dynamicRegistration: false
            },
            executeCommand: {
              dynamicRegistration: false
            }
          },
          textDocument: {
            synchronization: {
              dynamicRegistration: false,
              willSave: false,
              willSaveWaitUntil: false,
              didSave: false
            },
            completion: {
              dynamicRegistration: false,
              completionItem: {
                snippetSupport: true
              }
            },
            hover: {
              dynamicRegistration: false
            },
            signatureHelp: {
              dynamicRegistration: false
            },
            references: {
              dynamicRegistration: false
            },
            documentHighlight: {
              dynamicRegistration: false
            },
            documentSymbol: {
              dynamicRegistration: false
            },
            formatting: {
              dynamicRegistration: false
            },
            rangeFormatting: {
              dynamicRegistration: false
            },
            onTypeFormatting: {
              dynamicRegistration: false
            },
            definition: {
              dynamicRegistration: false
            },
            codeAction: {
              dynamicRegistration: false
            },
            codeLens: {
              dynamicRegistration: false
            },
            documentLink: {
              dynamicRegistration: false
            },
            rename: {
              dynamicRegistration: false
            }
          },
          window: {
            progress: {
              dynamicRegistration: false
            },
            actionRequired: {
              dynamicRegistration: false
            }
          }
        };

        const params = {
          processId: process.pid,
          rootPath: _this._projectRoot,
          rootUri: (_convert || _load_convert()).localPath_lspUri(_this._projectRoot),
          capabilities,
          initializationOptions: _this._initializationOptions,
          trace: isVerbose ? 'verbose' : 'off'
        };

        // We'll keep sending initialize requests until it either succeeds
        // or the user says to stop retrying. This while loop will be potentially
        // long-running since in the case of failure it awaits for the user to
        // click a dialog button.
        let userRetryCount = 0;
        let initializeTimeTakenMs = 0;
        while (true) {
          let initializeResponse;
          try {
            _this._logger.info('Lsp.Initialize');
            userRetryCount++;
            const initializeStartTimeMs = Date.now();
            // eslint-disable-next-line no-await-in-loop
            initializeResponse = yield _this._lspConnection.initialize(params);
            initializeTimeTakenMs = Date.now() - initializeStartTimeMs;
            // We might receive an onError or onClose event at this time too.
            // Those are handled by _handleError and _handleClose methods.
            // If those happen, then the response to initialize will never arrive,
            // so the above await will block until we finally dispose of the
            // connection.
          } catch (e) {
            _this._logLspException(e);
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-start', {
              status: 'initialize failed',
              spawn: spawnCommandForLogs,
              message: e.message,
              stack: e.stack,
              timeTakenMs: Date.now() - startTimeMs,
              userRetryCount
            });

            // CARE! Inside any exception handler of an rpc request,
            // the lspConnection might already have been torn down.

            const offerRetry = e.data != null && Boolean(e.data.retry);
            const msg = `Couldn't initialize ${_this._languageId} server - ${_this._errorString(e)}`;
            _this._childOut = { stdout: '', stderr: '' };
            if (!offerRetry) {
              _this._host.dialogNotification('error', msg).refCount().subscribe();
            } else {
              // eslint-disable-next-line no-await-in-loop
              const button = yield _this._host.dialogRequest('error', msg, ['Retry'], 'Close').refCount().toPromise();
              if (button === 'Retry') {
                _this._host.consoleNotification(_this._languageId, 'info', `Retrying ${_this._command}`);
                if (_this._lspConnection != null) {
                  continue;
                  // Retry will re-use the same this._lspConnection,
                  // assuming it hasn't been torn down for whatever reason.
                }
              }
            }
            if (_this._lspConnection != null) {
              _this._lspConnection.dispose();
            }
            return;
          }

          // If the process wrote to stderr but succeeded to initialize, we'd
          // also like to log that. It was probably informational not error.
          if (_this._childOut.stderr !== '') {
            _this._host.consoleNotification(_this._languageId, 'info', _this._childOut.stderr);
          }

          // We'll reset _childOut now: stdout will become null because we've
          // established that the process speaks JsonRPC, and so will deliver
          // everything in JsonRPC messages, and so we never want to report
          // errors with the raw text of stdout; stderr will become empty because
          // we've already reported everything so far.
          _this._childOut = { stdout: null, stderr: '' };

          _this._serverCapabilities = initializeResponse.capabilities;
          _this._derivedServerCapabilities = new DerivedServerCapabilities(_this._serverCapabilities, _this._logger);
          perConnectionDisposables.add(function () {
            _this._serverCapabilities = null;
            _this._derivedServerCapabilities = null;
          });

          _this._logger.info('Lsp state=Running!');
          _this._setState('Running');
          // At this point we're good to call into LSP.

          // CARE! Don't try to hook up file-events until after we're already
          // good to send them to LSP.
          _this._lspFileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
          perConnectionDisposables.add(_this._subscribeToFileEvents(), function () {
            _this._lspFileVersionNotifier = null;
          });

          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-start', {
            status: 'ok',
            spawn: spawnCommandForLogs,
            timeTakenMs: Date.now() - startTimeMs,
            initializeTimeTakenMs
          });

          return;
        }
      } catch (e) {
        // By this stage we've already handled+recovered from exceptions
        // gracefully around every external operation - spawning, speaking lsp
        // over jsonrpc, sending the initialize message. If an exception fell
        // through then it's an internal logic error.
        // Don't know how to recover.
        _this._logger.error(`Lsp.start - unexpected error ${e}`);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-start', {
          status: 'start failed',
          spawn: spawnCommandForLogs,
          message: e.message,
          stack: e.stack,
          timeTakenMs: Date.now() - startTimeMs
        });
        throw e;
      } finally {
        _this._supportsSymbolSearch.next(_this._serverCapabilities != null && Boolean(_this._serverCapabilities.workspaceSymbolProvider));
      }
    })();
  }

  _subscribeToFileEvents() {
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
    return this._fileCache.observeFileEvents()
    // The "observeFileEvents" will first send an 'open' event for every
    // already-open file, and after that it will give live updates.
    // TODO: Filter on projectRoot
    .filter(fileEvent => {
      const fileExtension = (_nuclideUri || _load_nuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return this._fileExtensions.indexOf(fileExtension) !== -1;
    }).subscribe(fileEvent => {
      if (!(fileEvent.fileVersion.notifier === this._fileCache)) {
        throw new Error('Invariant violation: "fileEvent.fileVersion.notifier === this._fileCache"');
      }
      // This invariant just self-documents that _fileCache is asked on observe file
      // events about fileVersions that themselves point directly back to the _fileCache.
      // (It's a convenience so that folks can pass around just a fileVersion on its own.)

      // TODO: if LSP responds with error to any of the file events, then we'll become
      // out of sync, and we must stop. (potentially restart).


      switch (fileEvent.kind) {
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.OPEN:
          this._fileOpen(fileEvent);
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE:
          this._fileClose(fileEvent);
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.EDIT:
          this._fileEdit(fileEvent);
          break;
        default:
          this._logger.error('Unrecognized fileEvent ' + JSON.stringify(fileEvent));
      }
      this._lspFileVersionNotifier.onEvent(fileEvent);
    });
  }

  _stop() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._state === 'Stopping' || _this2._state === 'Stopped') {
        return;
      }
      if (_this2._lspConnection == null) {
        _this2._setState('Stopped');
        return;
      }

      _this2._setState('Stopping');
      try {
        // Request the server to close down. It will respond when it's done,
        // but it won't actually terminate its stdin/stdout/process (since if
        // it did then we might not get the respone!)
        yield _this2._lspConnection.shutdown();
        // Now we can let the server terminate:
        _this2._lspConnection.exit();
      } catch (e) {
        _this2._logLspException(e);
      }
      _this2._lspConnection.dispose();
      // Thanks to this dispose(), any outstanding requests will now fail.
      // (If we didn't dispose, then they'd be stuck indefinitely).
      // The dispose handler also resets _lspConnection to null.

      _this2._setState('Stopped');
    })();
  }

  _errorString(error, command) {
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
    if (!(error instanceof (_vscodeJsonrpc || _load_vscodeJsonrpc()).ResponseError) && this._childOut.stdout != null && this._childOut.stdout !== '') {
      msg = `${msg} - ${this._childOut.stdout}`;
    }

    // But we'll always want to show stderr stuff if there was any.
    if (this._childOut.stderr !== '') {
      msg = `${msg} - ${this._childOut.stderr}`;
    }

    return msg;
  }

  _logLspException(e) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-exception', {
      message: e.message,
      stack: e.stack,
      remoteStack: e.data != null && e.data.stack != null ? e.data.stack : null,
      state: this._state,
      code: typeof e.code === 'number' ? e.code : null
    });

    if (e.code != null && Number(e.code) === (_protocol || _load_protocol()).ErrorCodes.RequestCancelled && this._state === 'Running') {
      // RequestCancelled is normal and shouldn't be logged.
      return;
    }
    let msg = `${this._errorString(e)}\nSTATE=${this._state}`;
    if (e.data != null && e.data.stack != null) {
      msg += `\n  LSP STACK:\n${String(e.data.stack)}`;
    }
    msg += `\n  NUCLIDE STACK:\n${e.stack}`;
    this._logger.error(msg);
  }

  _handleError(data) {
    if (this._state === 'Stopping' || this._state === 'Stopped') {
      return;
    }

    // CARE! This method may be called before initialization has finished.
    const [error, message, count] = data;
    // 'message' and 'count' are only provided on writes that failed.
    // Count is how many writes total have failed over this jsonRpcConnection.
    // Message is the JsonRPC object we were trying to write.
    if (message != null && count != null) {
      this._logger.error(`Lsp.JsonRpc.${String(error)} - ${count} errors so far - ${JSON.stringify(message)}`);
    } else {
      this._logger.error(`Lsp.JsonRpc.${String(error)}`);
    }
    if (count != null && count <= 3) {
      return;
    }
    this._host.dialogNotification('error', `Connection to the ${this._languageId} language server is erroring; shutting it down - ${this._errorString(error)}`).refCount().subscribe(); // fire and forget
    this._stop(); // method is awaitable, but we kick it off fire-and-forget.
  }

  _handleClose() {
    // CARE! This method may be called before initialization has finished.

    if (this._state === 'Stopping' || this._state === 'Stopped') {
      this._logger.info('Lsp.Close');
      return;
    }

    const prevState = this._state;
    this._setState('Stopped');
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
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-handle-close', { recentRestarts: this._recentRestarts.length });
    if (this._recentRestarts.length >= 5) {
      this._logger.error('Lsp.Close - will not auto-restart.');
      const message = `Language server '${this._languageId}' ` + 'has crashed 5 times in the last 3 minutes.';
      const dialog = this._host.dialogRequest('error', message, ['Restart'], 'Close').refCount().subscribe(response => {
        if (response === 'Restart') {
          this._host.consoleNotification(this._languageId, 'warning', `Restarting ${this._languageId}`);
          this._setState('Initial');
          this.start();
        }
      });
      // We'll call _setState again, in the same 'Stopped' state, but this time
      // providing a message+dialog to tailor the action-required indicator,
      // including dismissing the above dialog if the user clicks the indicator
      // to pop up another restart dialog.
      this._setState('Stopped', message, dialog);
    } else {
      this._logger.error('Lsp.Close - will auto-restart');
      this._host.consoleNotification(this._languageId, 'warning', `Automatically restarting ${this._languageId} after a crash`);
      this._setState('Initial');
      this.start();
    }
  }

  _handleTelemetryNotification(params) {
    // CARE! This method may be called before initialization has finished.

    // LSP doesn't specify the format of params. What we'll do is this:
    // if the params look like LogMessageParams then we'll log the message it
    // contains, otherwise we'll just log the entire params structure.
    if (typeof params.type === 'number' && params.type >= 1 && params.type <= 4 && typeof params.message === 'string') {
      switch (params.type) {
        case (_protocol || _load_protocol()).MessageType.Log:
        case (_protocol || _load_protocol()).MessageType.Info:
          this._logger.info(`Lsp.telemetry: ${params.message}`);
          break;
        case (_protocol || _load_protocol()).MessageType.Warning:
          this._logger.warn(`Lsp.telemetry: ${params.message}`);
          break;
        case (_protocol || _load_protocol()).MessageType.Error:
        default:
          this._logger.error(`Lsp.telemetry: ${params.message}`);
      }
    } else {
      this._logger.info(`Lsp.telemetry: ${JSON.stringify(params)}`);
    }
  }

  _handleLogMessageNotification(params) {
    // CARE! This method may be called before initialization has finished.
    this._host.consoleNotification(this._languageId, (_convert || _load_convert()).lspMessageType_atomShowNotificationLevel(params.type), params.message);
  }

  _handleShowMessageNotification(params) {
    // CARE! This method may be called before initialization has finished.
    this._host.dialogNotification((_convert || _load_convert()).lspMessageType_atomShowNotificationLevel(params.type), params.message).refCount().subscribe(); // fire and forget
  }

  _handleApplyEditRequest(params, token) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const applyEdits = (() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* (editsMap) {
          const applied = yield _this3._host.applyTextEditsForMultipleFiles(editsMap);
          return { applied };
        });

        return function applyEdits(_x5) {
          return _ref3.apply(this, arguments);
        };
      })();

      const { changes, documentChanges } = params.edit;
      if (documentChanges != null) {
        const fileVersions = yield Promise.all(documentChanges.map(function (documentChange) {
          return _this3._lspFileVersionNotifier.getVersion((_convert || _load_convert()).lspUri_localPath(documentChange.textDocument.uri));
        }));
        const filesMatch = documentChanges.reduce(function (filesMatchSoFar, documentChange, i) {
          const { textDocument } = documentChange;
          return filesMatchSoFar && textDocument.version === fileVersions[i];
        }, true);
        if (filesMatch) {
          const editsMap = new Map(documentChanges.map(function (documentChange) {
            return [(_convert || _load_convert()).lspUri_localPath(documentChange.textDocument.uri), (_convert || _load_convert()).lspTextEdits_atomTextEdits(documentChange.edits || [])];
          }));
          return applyEdits(editsMap);
        }
      } else if (changes != null) {
        const editsMap = new Map();
        Object.keys(changes).forEach(function (fileForChange) {
          editsMap.set((_convert || _load_convert()).lspUri_localPath(fileForChange), (_convert || _load_convert()).lspTextEdits_atomTextEdits(changes[fileForChange]));
        });
        return applyEdits(editsMap);
      }
      return { applied: false };
    })();
  }

  _handleShowMessageRequest(params, token) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // CARE! This method may be called before initialization has finished.

      const cancelIsRequested = _rxjsBundlesRxMinJs.Observable.bindCallback(token.onCancellationRequested.bind(token))();
      const actions = params.actions || [];

      // LSP gives us just a list of titles e.g. ['Open', 'Retry']
      // Nuclide will display an 'X' close icon in addition to those whichever
      // will deliver the result 'null'. (similar to how VSCode works).
      const response = yield _this4._host.dialogRequest((_convert || _load_convert()).lspMessageType_atomShowNotificationLevel(params.type), params.message, actions.map(function (action) {
        return action.title;
      }), '@@X@@').refCount().takeUntil(cancelIsRequested).toPromise();

      if (response === undefined) {
        // cancellation was requested (that's how takeUntil/toPromise works)
        return null;
      } else if (response === '@@X@@') {
        // user clicked the X icon
        return null;
      } else {
        // return whichever MessageActionItem corresponded to the click,
        const chosenAction = actions.find(function (action) {
          return action.title === response;
        });

        if (!(chosenAction != null)) {
          throw new Error('Invariant violation: "chosenAction != null"');
        }

        return chosenAction;
      }
    })();
  }

  _handleProgressNotification(params) {
    // CARE! This method may be called before initialization has finished.

    // How do we deal with race conditions? For instance, if a volley of
    // progress updates come, how do we ensure that they're handled in
    // order? -- We store *promises* inside this._progressIndicators.
    // Every time we receive a request to update an indicator, we replace
    // the promise with a new chained promise that will only be completed
    // when the original is done and when the update is done.
    const indicatorPromise = this._progressIndicators.get(params.id);
    const label = params.label;
    if (label == null) {
      if (indicatorPromise != null) {
        indicatorPromise.then(indicator => indicator.dispose());
        this._progressIndicators.delete(params.id);
      }
    } else {
      const indicatorPromise2 = indicatorPromise == null ? this._host.showProgress(label) : indicatorPromise.then(indicator => {
        indicator.setTitle(label);
        return indicator;
      });
      this._progressIndicators.set(params.id, indicatorPromise2);
    }
  }

  _handleActionRequiredNotification(params) {
    const oldIndicator = this._actionRequiredIndicators.get(params.id);
    if (oldIndicator != null) {
      oldIndicator.dispose();
      this._actionRequiredIndicators.delete(params.id);
    }
    if (params.label != null) {
      const newIndicator = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._host.showActionRequired(params.label).refCount().subscribe());
      this._actionRequiredIndicators.set(params.id, newIndicator);
    }
  }

  getRoot() {
    return this._projectRoot;
  }

  tryGetBufferWhenWeAndLspAtSameVersion(fileVersion) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this5._state !== 'Running') {
        return null;
      }

      // Await until we have received this exact version from the client.
      // (Might be null in the case the user had already typed further
      // before we got a chance to be called.)
      const buffer = yield _this5._fileCache.getBufferAtVersion(fileVersion);

      if (!(buffer == null || buffer.changeCount === fileVersion.version)) {
        throw new Error('Invariant violation: "buffer == null || buffer.changeCount === fileVersion.version"');
      }

      // Await until this exact version has been pushed to LSP too.


      if (!(yield _this5._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        if (buffer != null) {
          // Invariant: LSP is never ahead of our fileCache.
          // Therefore it will eventually catch up.
          _this5._logger.error('LSP.version - could not catch up to version=' + fileVersion.version);
        }
        return null;
      }

      // During that second await, if the server received further edits from the client,
      // then the buffer object might have been mutated in place, so its file-verion will
      // no longer match. In this case we return null.
      return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
    })();
  }

  _fileOpen(fileEvent) {
    if (!(this._state === 'Running')) {
      throw new Error('Invariant violation: "this._state === \'Running\'"');
    }

    if (!(this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._lspConnection != null"');
    }

    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    const params = {
      textDocument: {
        uri: (_convert || _load_convert()).localPath_lspUri(fileEvent.fileVersion.filePath),
        languageId: this._languageId,
        version: fileEvent.fileVersion.version,
        text: fileEvent.contents
      }
    };
    this._lspConnection.didOpenTextDocument(params);
  }

  _fileClose(fileEvent) {
    if (!(this._state === 'Running')) {
      throw new Error('Invariant violation: "this._state === \'Running\'"');
    }

    if (!(this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._lspConnection != null"');
    }

    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    const params = {
      textDocument: {
        uri: (_convert || _load_convert()).localPath_lspUri(fileEvent.fileVersion.filePath)
      }
    };
    this._lspConnection.didCloseTextDocument(params);
  }

  _fileEdit(fileEvent) {
    if (!(this._state === 'Running')) {
      throw new Error('Invariant violation: "this._state === \'Running\'"');
    }

    if (!(this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._lspConnection != null"');
    }

    let contentChange;
    switch (this._derivedServerCapabilities.serverWantsChange) {
      case 'incremental':
        contentChange = {
          range: (_convert || _load_convert()).atomRange_lspRange(fileEvent.oldRange),
          text: fileEvent.newText
        };
        break;
      case 'full':
        const buffer = this._fileCache.getBufferForFileEdit(fileEvent);
        contentChange = {
          text: buffer.getText()
        };
        break;
      case 'none':
        return;
      default:
        if (!false) {
          throw new Error('Invariant violation: "false"');
        }

      // unreachable
    }

    const params = {
      textDocument: {
        uri: (_convert || _load_convert()).localPath_lspUri(fileEvent.fileVersion.filePath),
        version: fileEvent.fileVersion.version
      },
      contentChanges: [contentChange]
    };
    this._lspConnection.didChangeTextDocument(params);
  }

  getDiagnostics(fileVersion) {
    this._logger.error('Lsp: should observeDiagnostics, not getDiagnostics');
    return Promise.resolve(null);
  }

  observeDiagnostics() {
    // Note: this function can (and should!) be called even before
    // we reach state 'Running'.

    return this._diagnosticUpdates.mergeMap(perConnectionUpdates => (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ensureInvalidations)(this._logger, perConnectionUpdates.map((_convert || _load_convert()).lspDiagnostics_atomDiagnostics))).publish();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this6._state !== 'Running' || _this6._serverCapabilities.completionProvider == null || !(yield _this6._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }

      const activatedAutomaticallyOkay = request.triggerCharacter != null && _this6._derivedServerCapabilities.completionTriggerCharacters.has(request.triggerCharacter);
      if (!request.activatedManually && !activatedAutomaticallyOkay) {
        return null;
      }

      const params = (_convert || _load_convert()).atom_lspPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this6._lspConnection.completion(params);

        if (!(response != null)) {
          throw new Error('null textDocument/completion');
        }
      } catch (e) {
        _this6._logLspException(e);
        return null;
      }

      const isIncomplete = Array.isArray(response) ? false : response.isIncomplete;
      const responseArray = Array.isArray(response) ? response : response.items;

      return {
        isIncomplete,
        items: responseArray.map((_convert || _load_convert()).lspCompletionItem_atomCompletion)
      };
    })();
  }

  getDefinition(fileVersion, position) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this7._state !== 'Running' || !_this7._serverCapabilities.definitionProvider || !(yield _this7._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = (_convert || _load_convert()).atom_lspPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this7._lspConnection.gotoDefinition(params);

        if (!(response != null)) {
          throw new Error('null textDocument/definition');
        }
      } catch (e) {
        _this7._logLspException(e);
        return null;
      }

      // Since Nuclide hyperclick provider has an invariant that if getDefinition
      // returned an array then it's non-empty, LspLanguageService will detect and
      // return null an empty array response.
      if (Array.isArray(response) && response.length === 0) {
        return null;
      }

      const responseArray = Array.isArray(response) ? response : [response];

      return {
        // TODO: use wordAtPos to determine queryrange
        queryRange: [new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position)],
        definitions: responseArray.map(function (d) {
          return (_convert || _load_convert()).lspLocation_atomDefinition(d, _this7._projectRoot);
        })
      };
    })();
  }

  findReferences(fileVersion, position) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this8._state !== 'Running' || !_this8._serverCapabilities.referencesProvider || !(yield _this8._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const buffer = yield _this8._fileCache.getBufferAtVersion(fileVersion);
      // buffer may still be null despite the above check. We do handle that!

      const positionParams = (_convert || _load_convert()).atom_lspPositionParams(fileVersion.filePath, position);
      const params = Object.assign({}, positionParams, { context: { includeDeclaration: true } });
      // ReferenceParams is like TextDocumentPositionParams but with one extra field.

      let response;
      try {
        response = yield _this8._lspConnection.findReferences(params);

        if (!(response != null)) {
          throw new Error('null textDocument/references');
        }
      } catch (e) {
        _this8._logLspException(e);
        return null;
      }

      const references = response.map((_convert || _load_convert()).lspLocation_atomFoundReference);
      // This returns an array of Reference objects. Confusingly, each one has
      // property named 'uri', but it's really a local filePath.

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
        const refInBuffer = references.find(function (ref) {
          return ref.uri === fileVersion.filePath;
        });
        if (refInBuffer != null) {
          referencedSymbolName = buffer.getTextInRange(refInBuffer.range);
        }
      }
      // Failing that, if any of the buffers are open we'll use them (even if we
      // have no guarantees about which version our buffers are at compared to
      // the ranges that LSP sent us back, so it might be a little off.)
      if (referencedSymbolName == null) {
        for (const ref of references) {
          const refBuffer = _this8._fileCache.getBuffer(ref.uri);
          if (refBuffer != null) {
            referencedSymbolName = refBuffer.getTextInRange(ref.range);
            break;
          }
        }
      }
      // Failing that we'll try using a regexp on the buffer. (belt and braces!)
      if (referencedSymbolName == null && buffer != null) {
        const WORD_REGEX = /\w+/gi;
        const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, WORD_REGEX);
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
        baseUri: _this8._projectRoot,
        referencedSymbolName,
        references
      };
    })();
  }

  getCoverage(filePath) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this9._state !== 'Running' || !_this9._serverCapabilities.typeCoverageProvider) {
        return null;
      }
      const params = {
        textDocument: (_convert || _load_convert()).localPath_lspTextDocumentIdentifier(filePath)
      };

      let response;
      try {
        response = yield _this9._lspConnection.typeCoverage(params);

        if (!(response != null)) {
          throw new Error('null textDocument/coverage');
        }
      } catch (e) {
        _this9._logLspException(e);
        return null;
      }

      const convertUncovered = function (uncovered) {
        return {
          range: (_convert || _load_convert()).lspRange_atomRange(uncovered.range),
          message: uncovered.message
        };
      };
      return {
        percentage: response.coveredPercent,
        uncoveredRegions: response.uncoveredRanges.map(convertUncovered)
      };
    })();
  }

  getOutline(fileVersion) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this10._state !== 'Running' || !_this10._serverCapabilities.documentSymbolProvider || !(yield _this10._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = {
        textDocument: (_convert || _load_convert()).localPath_lspTextDocumentIdentifier(fileVersion.filePath)
      };

      let response;
      try {
        response = yield _this10._lspConnection.documentSymbol(params);

        if (!(response != null)) {
          throw new Error('null textDocument/documentSymbol');
        }
      } catch (e) {
        _this10._logLspException(e);
        return null;
      }

      // The response is a flat list of SymbolInformation, which has location+name+containerName.
      // We're going to reconstruct a tree out of them. This can't be done with 100% accuracy in
      // all cases, but it can be done accurately in *almost* all cases.

      // For each symbolInfo in the list, we have exactly one corresponding tree node.
      // We'll also sort the nodes in lexical order of occurrence in the source
      // document. This is useful because containers always come lexically before their
      // children. (This isn't a LSP guarantee; just a heuristic.)
      const list = response.map(function (symbol) {
        return [symbol, {
          icon: (_convert || _load_convert()).lspSymbolKind_atomIcon(symbol.kind),
          tokenizedText: (_convert || _load_convert()).lspSymbolInformation_atomTokenizedText(symbol),
          startPosition: (_convert || _load_convert()).lspPosition_atomPoint(symbol.location.range.start),
          children: []
        }];
      });
      list.sort(function ([, aNode], [, bNode]) {
        return aNode.startPosition.compare(bNode.startPosition);
      });

      // We'll need to look up for parents by name, so construct a map from names to nodes
      // of that name. Note: an undefined SymbolInformation.containerName means root,
      // but it's easier for us to represent with ''.
      const mapElements = list.map(function ([symbol, node]) {
        return [symbol.name, node];
      });
      const map = (0, (_collection || _load_collection()).collect)(mapElements);
      if (map.has('')) {
        _this10._logger.error('Outline textDocument/documentSymbol returned an empty symbol name');
      }

      // The algorithm for reconstructing the tree out of list items rests on identifying
      // an item's parent based on the item's containerName. It's easy if there's only one
      // parent of that name. But if there are multiple parent candidates, we'll try to pick
      // the one that comes immediately lexically before the item. (If there are no parent
      // candidates, we've been given a malformed item, so we'll just ignore it.)
      const root = {
        plainText: '',
        startPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(0, 0),
        children: []
      };
      map.set('', [root]);
      for (const [symbol, node] of list) {
        const parentName = symbol.containerName || '';
        const parentCandidates = map.get(parentName);
        if (parentCandidates == null) {
          _this10._logger.error(`Outline textDocument/documentSymbol ${symbol.name} is missing container ${parentName}`);
        } else {
          if (!(parentCandidates.length > 0)) {
            throw new Error('Invariant violation: "parentCandidates.length > 0"');
          }
          // Find the first candidate that's lexically *after* our symbol.


          const symbolPos = (_convert || _load_convert()).lspPosition_atomPoint(symbol.location.range.start);
          const iAfter = parentCandidates.findIndex(function (p) {
            return p.startPosition.compare(symbolPos) > 0;
          });
          if (iAfter === -1) {
            // No candidates after item? Then item's parent is the last candidate.
            parentCandidates[parentCandidates.length - 1].children.push(node);
          } else if (iAfter === 0) {
            // All candidates after item? That's an error! We'll arbitrarily pick first one.
            parentCandidates[0].children.push(node);
            _this10._logger.error(`Outline textDocument/documentSymbol ${symbol.name} comes after its container`);
          } else {
            // Some candidates before+after? Then item's parent is the last candidate before.
            parentCandidates[iAfter - 1].children.push(node);
          }
        }
      }

      return { outlineTrees: root.children };
    })();
  }

  // Private API to send executeCommand requests to the server. Returns a
  // boolean indicating whether executing the command was successful.
  // This function will throw an error if the server isn't in a state to handle
  // the request, the server can't handle this type of request, or if the LSP
  // server throws its own exception (ex: an internal server error exception)
  _executeCommand(command, args) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this11._state !== 'Running') {
        throw new Error(`${_this11._languageId} is not currently in a state to handle the request`);
        // flowlint-next-line sketchy-null-mixed:off
      } else if (!_this11._serverCapabilities.executeCommandProvider) {
        throw new Error(`${_this11._languageId} cannot handle the request`);
      }
      try {
        yield _this11._lspConnection.executeCommand({
          command,
          arguments: args
        });
      } catch (e) {
        _this11._logLspException(e);
        // Rethrow the exception so the upsteam caller has access to the error message.
        throw e;
      }
    })();
  }

  getCodeActions(fileVersion, range, diagnostics) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this12._state !== 'Running' || !_this12._serverCapabilities.codeActionProvider) {
        return [];
      }

      const params = {
        textDocument: (_convert || _load_convert()).localPath_lspTextDocumentIdentifier(fileVersion.filePath),
        range: (_convert || _load_convert()).atomRange_lspRange(range),
        context: {
          diagnostics: (0, (_collection || _load_collection()).arrayCompact)(diagnostics.map((_convert || _load_convert()).atomDiagnostic_lspDiagnostic))
        }
      };

      let response;
      try {
        response = yield _this12._lspConnection.codeAction(params);
      } catch (e) {
        _this12._logLspException(e);
        return [];
      }
      return response.map(function (command) {
        // This function, which will be called when the CodeAction is applied
        // by the user, returns Promise<void>. If the Promise is fulfilled, then
        // the CodeAction was successful. If unsuccessful, the Promise will be rejected
        // and the upstream caller (ex: a CodeAction UI package) should catch the
        // error and display it to the user in whatever way they think best.
        const applyFunc = (() => {
          var _ref4 = (0, _asyncToGenerator.default)(function* () {
            yield _this12._executeCommand(command.command, command.arguments);
          });

          return function applyFunc() {
            return _ref4.apply(this, arguments);
          };
        })();
        return (_convert || _load_convert()).lspCommand_atomCodeAction(command, applyFunc);
      });
    })();
  }

  typeHint(fileVersion, position) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this13._state !== 'Running' || !_this13._serverCapabilities.hoverProvider || !(yield _this13._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = (_convert || _load_convert()).atom_lspPositionParams(fileVersion.filePath, position);

      let response;
      try {
        _this13._hoverCancellation.cancel();
        _this13._hoverCancellation = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).CancellationTokenSource();
        response = yield _this13._lspConnection.hover(params, _this13._hoverCancellation.token);

        if (!(response != null)) {
          throw new Error('null textDocument/hover');
        }
      } catch (e) {
        _this13._logLspException(e);
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

      let range = new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position);
      if (response.range) {
        range = (_convert || _load_convert()).lspRange_atomRange(response.range);
      }

      return hint ? { hint, range } : null;
    })();
  }

  highlight(fileVersion, position) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this14._state !== 'Running' || !_this14._serverCapabilities.documentHighlightProvider || !(yield _this14._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = (_convert || _load_convert()).atom_lspPositionParams(fileVersion.filePath, position);

      let response;
      try {
        _this14._highlightCancellation.cancel();
        _this14._highlightCancellation = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).CancellationTokenSource();
        response = yield _this14._lspConnection.documentHighlight(params, _this14._highlightCancellation.token);

        if (!(response != null)) {
          throw new Error('null textDocument/documentHighlight');
        }
      } catch (e) {
        _this14._logLspException(e);
        return null;
      }

      const convertHighlight = function (highlight) {
        return (_convert || _load_convert()).lspRange_atomRange(highlight.range);
      };
      return response.map(convertHighlight);
    })();
  }

  formatSource(fileVersion, atomRange, options) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this15._state !== 'Running') {
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
      const buffer = yield _this15.tryGetBufferWhenWeAndLspAtSameVersion(fileVersion);
      if (buffer == null) {
        _this15._logger.error('LSP.formatSource - buffer changed before we could format');
        return null;
      }
      const params = {
        textDocument: (_convert || _load_convert()).localPath_lspTextDocumentIdentifier(fileVersion.filePath),
        options
      };
      let response;

      // The user might have requested to format either some or all of the buffer.
      // And the LSP server might have the capability to format some or all.
      // We'll match up the request+capability as best we can...
      const canAll = Boolean(_this15._serverCapabilities.documentFormattingProvider);
      const canRange = Boolean(_this15._serverCapabilities.documentRangeFormattingProvider);
      const wantAll = buffer.getRange().compare(atomRange) === 0;
      if (canAll && (wantAll || !canRange)) {
        try {
          response = yield _this15._lspConnection.documentFormatting(params);

          if (!(response != null)) {
            throw new Error('null textDocument/documentFormatting');
          }
        } catch (e) {
          _this15._logLspException(e);
          return null;
        }
      } else if (canRange) {
        // Range is exclusive, and Nuclide snaps it to entire rows. So range.start
        // is character 0 of the start line, and range.end is character 0 of the
        // first line AFTER the selection.
        const range = (_convert || _load_convert()).atomRange_lspRange(atomRange);
        const params2 = Object.assign({}, params, { range });
        try {
          response = yield _this15._lspConnection.documentRangeFormatting(params2);

          if (!(response != null)) {
            throw new Error('null textDocument/documentRangeFormatting');
          }
        } catch (e) {
          _this15._logLspException(e);
          return null;
        }
      } else {
        _this15._logger.error('LSP.formatSource - not supported by server');
        return null;
      }

      // As mentioned, the user might have done further typing during that 'await', but if so then
      // our upstream caller will catch it and report an error: no need to re-verify here.

      return (_convert || _load_convert()).lspTextEdits_atomTextEdits(response);
    })();
  }

  formatEntireFile(fileVersion, range, options) {
    // A language service implements either formatSource or formatEntireFile,
    // and we should pick formatSource in our AtomLanguageServiceConfig.
    this._logger.error('LSP CodeFormat providers should use formatEntireFile: false');
    return Promise.resolve(null);
  }

  formatAtPosition(fileVersion, point, triggerCharacter, options) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const triggerCharacters = _this16._derivedServerCapabilities.onTypeFormattingTriggerCharacters;
      if (_this16._state !== 'Running' || !triggerCharacters.has(triggerCharacter) || !(yield _this16._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = {
        textDocument: (_convert || _load_convert()).localPath_lspTextDocumentIdentifier(fileVersion.filePath),
        position: (_convert || _load_convert()).atomPoint_lspPosition(point),
        ch: triggerCharacter,
        options
      };

      let response;
      try {
        response = yield _this16._lspConnection.documentOnTypeFormatting(params);

        if (!(response != null)) {
          throw new Error('null textDocument/documentOnTypeFormatting');
        }
      } catch (e) {
        _this16._logLspException(e);
        return null;
      }

      return (_convert || _load_convert()).lspTextEdits_atomTextEdits(response);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    this._logger.error('NYI: getEvaluationExpression');
    return Promise.resolve(null);
  }

  supportsSymbolSearch(directories) {
    return (0, (_observable || _load_observable()).compact)(this._supportsSymbolSearch).take(1).toPromise();
  }

  symbolSearch(query, directories) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this17._state !== 'Running' || !_this17._serverCapabilities.workspaceSymbolProvider) {
        return null;
      }
      const params = { query };

      let response;
      try {
        response = yield _this17._lspConnection.workspaceSymbol(params);

        if (!(response != null)) {
          throw new Error('null workspace/symbol');
        }
      } catch (e) {
        _this17._logLspException(e);
        return null;
      }

      return response.map((_convert || _load_convert()).lspSymbolInformation_atomSymbolResult);
    })();
  }

  getProjectRoot(fileUri) {
    this._logger.error('NYI: getProjectRoot');
    return Promise.resolve(null);
  }

  isFileInProject(fileUri) {
    this._logger.error('NYI: isFileInProject');
    return Promise.resolve(false);
  }
}

exports.LspLanguageService = LspLanguageService; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  * @format
                                                  */

class DerivedServerCapabilities {

  constructor(capabilities, logger) {
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
      syncKind = (_protocol || _load_protocol()).TextDocumentSyncKind.None;
      if (sync != null) {
        logger.error('LSP - invalid capabilities.textDocumentSync from server: ' + JSON.stringify(sync));
      }
    }

    // The syncKind is a number, supposed to fall in the TextDocumentSyncKind
    // enumeration, so we verify that here:
    if (syncKind === (_protocol || _load_protocol()).TextDocumentSyncKind.Full) {
      this.serverWantsChange = 'full';
    } else if (syncKind === (_protocol || _load_protocol()).TextDocumentSyncKind.Incremental) {
      this.serverWantsChange = 'incremental';
    } else if (syncKind === (_protocol || _load_protocol()).TextDocumentSyncKind.None) {
      this.serverWantsChange = 'none';
    } else {
      logger.error('LSP initialize: invalid TextDocumentSyncKind');
      this.serverWantsChange = 'none';
    }

    const onTypeFormattingSettings = capabilities.documentOnTypeFormattingProvider;
    if (onTypeFormattingSettings == null) {
      this.onTypeFormattingTriggerCharacters = new Set();
    } else {
      const {
        firstTriggerCharacter,
        moreTriggerCharacter
      } = onTypeFormattingSettings;
      const triggerCharacters = [firstTriggerCharacter].concat(moreTriggerCharacter || []);
      this.onTypeFormattingTriggerCharacters = new Set(triggerCharacters);
    }

    if (capabilities.completionProvider == null) {
      this.completionTriggerCharacters = new Set();
    } else {
      const lspChars = capabilities.completionProvider.triggerCharacters || [];
      const intrinsicChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      this.completionTriggerCharacters = new Set(lspChars.concat(intrinsicChars));
    }
  }
}

class JsonRpcLogger {

  constructor(logger) {
    this._logger = logger;
  }

  error(message) {
    this._logger.error('Lsp.JsonRpc ' + message);
  }

  warn(message) {
    this._logger.info('Lsp.JsonRpc ' + message);
  }

  info(message) {
    this._logger.info('Lsp.JsonRpc ' + message);
  }

  log(message) {
    this._logger.trace('Jsp.JsonRpc ' + message);
  }
}

class JsonRpcTraceLogger {

  constructor(logger) {
    this._logger = logger;
  }

  log(message, data) {
    this._logger.trace(`LSP.trace: ${message} ${(data || '').substring(0, 800)}`);
  }
}