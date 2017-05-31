'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LspLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.toTextDocumentIdentifier = toTextDocumentIdentifier;
exports.pointToPosition = pointToPosition;
exports.positionToPoint = positionToPoint;
exports.rangeToAtomRange = rangeToAtomRange;
exports.atomRangeToRange = atomRangeToRange;
exports.convertSeverity = convertSeverity;
exports.createTextDocumentPositionParams = createTextDocumentPositionParams;
exports.convertCompletion = convertCompletion;
exports.convertSearchResult = convertSearchResult;

var _through;

function _load_through() {
  return _through = _interopRequireDefault(require('through'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
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

var _url = _interopRequireDefault(require('url'));

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

var _LspConnection;

function _load_LspConnection() {
  return _LspConnection = require('./LspConnection');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('./protocol');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../commons-node/tokenizedText');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
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

class LspLanguageService {
  // tracks which fileversions we've sent to LSP

  constructor(logger, fileCache, host, consoleSource, command, args, projectRoot, fileExtensions) {
    this._state = 'Initial';
    this._recentRestarts = [];
    this._diagnosticUpdates = new _rxjsBundlesRxMinJs.Subject();
    this._supportsSymbolSearch = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._childOut = { stdout: '', stderr: '' };

    this._logger = logger;
    this._fileCache = fileCache;
    this._host = host;
    this._projectRoot = projectRoot;
    this._consoleSource = consoleSource;
    this._command = command;
    this._args = args;
    this._fileExtensions = fileExtensions;
  } // is really "?LspConnection"
  // Fields which become live after we receive an initializeResponse:

  // Fields which become live inside start(), when we spawn the LSP process.
  // Disposing of the _lspConnection will dispose of all of them.
  // tracks which fileversions we've received from Nuclide client

  // These fields reflect our own state.
  // (Most should be nullable types, but it's not worth the bother.)
  // tracks which fileversions we've sent to LSP
  // tracks which fileversions we've received from Nuclide client

  // These fields are provided upon construction


  dispose() {
    this._stop().catch(_ => {}).then(_ => this._host.dispose());
  }

  start() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this._state === 'Initial')) {
        throw new Error('Invariant violation: "this._state === \'Initial\'"');
      }

      _this._state = 'Starting';

      try {
        const perConnectionDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
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
          _this._logger.info(`Spawn: ${_this._command} ${_this._args.join(' ')}`);
          if (_this._command === '') {
            throw new Error('No command provided for launching language server');
            // if we try to spawn an empty command, node itself throws a "bad
            // type" error, which is jolly confusing. So we catch it ourselves.
          }
          const childProcessStream = (0, (_process || _load_process()).spawn)(_this._command, _this._args, {
            killTreeWhenDone: true
          }).publish();
          // disposing of the stream will kill the process, if it still exists
          const processPromise = childProcessStream.take(1).toPromise();
          perConnectionDisposables.add(childProcessStream.connect());
          childProcess = yield processPromise;

          // spawn mostly throws errors. But in some cases like ENOENT it
          // immediately returns a childProcess with pid=undefined, and we
          // have to subsequently pick up the error message ourselves...
          if (childProcess.pid == null) {
            const errorPromise = new Promise(function (resolve) {
              return childProcess.on('error', resolve);
            });
            throw new Error((yield errorPromise));
          }
          // if spawn failed to launch it, this await will throw.
        } catch (e) {
          _this._state = 'StartFailed';

          _this._host.dialogNotification('error', `Couldn't start server - ${_this._errorString(e, _this._command)}`).refCount().subscribe(); // fire-and-forget
          return;
        }

        // The JsonRPC layer doesn't report what happened on stderr/stdout in
        // case of an error, so we'll pick it up directly. CARE! Node has
        // three means of consuming a stream, and it will crash if you mix them.
        // Our JsonRPC library uses the .pipe() means, so we have to too.
        _this._childOut = { stdout: '', stderr: '' };
        const accumulate = function (streamName, data) {
          if (_this._childOut[streamName].length < 600) {
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
        jsonRpcConnection.trace('verbose', new JsonRpcTraceLogger(_this._logger));

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
        _this._lspConnection.onLogMessageNotification(_this._handleLogMessageNotification.bind(_this));
        _this._lspConnection.onShowMessageNotification(_this._handleShowMessageNotification.bind(_this));
        _this._lspConnection.onShowMessageRequest(_this._handleShowMessageRequest.bind(_this));
        _this._lspConnection.onDiagnosticsNotification(function (params) {
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

        jsonRpcConnection.listen();

        // TODO: (asiandrummer, ljw) `rootPath` should be a file URI (`file://`).
        const params = {
          initializationOptions: {},
          processId: process.pid,
          rootPath: _this._projectRoot,
          capabilities: {}
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
            initializeResponse = yield _this._lspConnection.initialize(params);
            // We might receive an onError or onClose event at this time too.
            // Those are handled by _handleError and _handleClose methods.
            // If those happen, then the response to initialize will never arrive,
            // so the above await will block until we finally dispose of the
            // connection.
          } catch (e) {
            _this._logLspException(e);
            // CARE! Inside any exception handler of an rpc request,
            // the lspConnection might already have been torn down.

            const offerRetry = e.data != null && Boolean(e.data.retry);
            const msg = `Couldn't initialize server - ${_this._errorString(e)}`;
            _this._childOut = { stdout: '', stderr: '' };
            if (!offerRetry) {
              _this._host.dialogNotification('error', msg).refCount().subscribe();
            } else {
              // eslint-disable-next-line no-await-in-loop
              const button = yield _this._host.dialogRequest('error', msg, ['Retry'], 'Close').refCount().toPromise();
              if (button === 'Retry') {
                _this._host.consoleNotification(_this._consoleSource, 'info', `Retrying ${_this._command}`);
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
            _this._host.consoleNotification(_this._consoleSource, 'info', _this._childOut.stderr);
          }

          // Up until now, _handleError might have been called e.g. while
          // awaiting initialize. If it was called, it would have printed childOut.
          // But from now on that would be inappropriate, so we'll reset it.
          _this._childOut = { stdout: '', stderr: '' };

          _this._serverCapabilities = initializeResponse.capabilities;
          _this._derivedServerCapabilities = new DerivedServerCapabilities(_this._serverCapabilities, _this._logger);
          perConnectionDisposables.add(function () {
            _this._serverCapabilities = null;
            _this._derivedServerCapabilities = null;
          });

          _this._state = 'Running';
          // At this point we're good to call into LSP.

          // CARE! Don't try to hook up file-events until after we're already
          // good to send them to LSP.
          _this._lspFileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
          perConnectionDisposables.add(_this._subscribeToFileEvents(), function () {
            _this._lspFileVersionNotifier = null;
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
        _this2._state = 'Stopped';
        return;
      }

      _this2._state = 'Stopping';
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

      _this2._state = 'Stopped';
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
    if (!(error instanceof (_vscodeJsonrpc || _load_vscodeJsonrpc()).ResponseError) && this._childOut.stdout !== '') {
      msg = `${msg} - ${this._childOut.stdout}`;
    }

    // But we'll always want to show stderr stuff if there was any.
    if (this._childOut.stderr !== '') {
      msg = `${msg} - ${this._childOut.stderr}`;
    }

    return msg;
  }

  _logLspException(e) {
    if (e.code != null && Number(e.code) === (_protocol || _load_protocol()).ErrorCodes.RequestCancelled) {
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
    this._host.dialogNotification('error', `Connection to the language server is erroring; shutting it down - ${this._errorString(error)}`).refCount().subscribe(); // fire and forget
    this._stop(); // method is awaitable, but we kick it off fire-and-forget.
  }

  _handleClose() {
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
      this._host.dialogNotification('error', 'Language server has crashed 5 times in the last 3 minutes. It will not be restarted.').refCount().subscribe(); // fire and forget
    } else {
      this._logger.error('Lsp.Close - will attempt to restart');
      this._host.consoleNotification(this._consoleSource, 'warning', 'Automatically restarting language service.');
      this._state = 'Initial';
      this.start();
    }
  }

  _handleLogMessageNotification(params) {
    // CARE! This method may be called before initialization has finished.
    this._host.consoleNotification(this._consoleSource, messageTypeToAtomLevel(params.type), params.message);
  }

  _handleShowMessageNotification(params) {
    // CARE! This method may be called before initialization has finished.
    this._host.dialogNotification(messageTypeToAtomLevel(params.type), params.message).refCount().subscribe(); // fire and forget
  }

  _handleShowMessageRequest(params, cancellationToken) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // NOT YET IMPLEMENTED: that cancellationToken will be fired if the LSP
      // server sends a cancel notification for this ShowMessageRequest. We should
      // respect it.

      // CARE! This method may be called before initialization has finished.
      const actions = params.actions || [];
      const titles = actions.map(function (action) {
        return action.title;
      });
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
      const candidates = titles.filter(function (title) {
        return heuristic.includes(title);
      });
      if (candidates.length === 0) {
        closeTitle = 'Close';
        actions.push({ title: 'Close' });
      } else if (candidates.length === 1) {
        closeTitle = candidates[0];
        titles.splice(titles.indexOf(closeTitle), 1);
      } else {
        closeTitle = candidates[0];
      }

      const response = yield _this3._host.dialogRequest(messageTypeToAtomLevel(params.type), params.message, titles, closeTitle).refCount().toPromise();

      const chosenAction = actions.find(function (action) {
        return action.title === response;
      });

      if (!(chosenAction != null)) {
        throw new Error('Invariant violation: "chosenAction != null"');
      }

      return chosenAction;
    })();
  }

  getRoot() {
    return this._projectRoot;
  }

  tryGetBufferWhenWeAndLspAtSameVersion(fileVersion) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._state !== 'Running') {
        return null;
      }

      // Await until we have received this exact version from the client.
      // (Might be null in the case the user had already typed further
      // before we got a chance to be called.)
      const buffer = yield _this4._fileCache.getBufferAtVersion(fileVersion);

      if (!(buffer == null || buffer.changeCount === fileVersion.version)) {
        throw new Error('Invariant violation: "buffer == null || buffer.changeCount === fileVersion.version"');
      }

      // Await until this exact version has been pushed to LSP too.


      if (!(yield _this4._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        if (buffer != null) {
          // Invariant: LSP is never ahead of our fileCache.
          // Therefore it will eventually catch up.
          _this4._logger.error('LSP.version - could not catch up to version=' + fileVersion.version);
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
    if (!(this._state === 'Running' && this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._state === \'Running\' && this._lspConnection != null"');
    }

    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath,
        languageId: 'python', // TODO
        version: fileEvent.fileVersion.version,
        text: fileEvent.contents
      }
    };
    this._lspConnection.didOpenTextDocument(params);
  }

  _fileClose(fileEvent) {
    if (!(this._state === 'Running' && this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._state === \'Running\' && this._lspConnection != null"');
    }

    if (!this._derivedServerCapabilities.serverWantsOpenClose) {
      return;
    }
    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath
      }
    };
    this._lspConnection.didCloseTextDocument(params);
  }

  _fileEdit(fileEvent) {
    if (!(this._state === 'Running' && this._lspConnection != null)) {
      throw new Error('Invariant violation: "this._state === \'Running\' && this._lspConnection != null"');
    }

    let contentChange;
    switch (this._derivedServerCapabilities.serverWantsChange) {
      case 'incremental':
        contentChange = {
          range: atomRangeToRange(fileEvent.oldRange),
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

    // TODO: (asiandrummer, ljw) `uri` should be a file URI (`file://`).
    const params = {
      textDocument: {
        uri: fileEvent.fileVersion.filePath,
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

    // First some helper functions to map LSP into Nuclide data structures...
    // TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
    const convertOne = (filePath, diagnostic) => {
      return {
        // TODO: diagnostic.code
        scope: 'file',
        providerName: diagnostic.source || 'TODO: VSCode LSP',
        type: convertSeverity(diagnostic.severity),
        filePath,
        text: diagnostic.message,
        range: rangeToAtomRange(diagnostic.range)
      };
    };

    const convert = params => {
      const filePath = this._convertLspUriToNuclideUri(params.uri);
      return {
        filePath,
        messages: params.diagnostics.map(d => convertOne(filePath, d))
      };
    };

    return this._diagnosticUpdates.mergeMap(perConnectionUpdates => (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ensureInvalidations)(this._logger, perConnectionUpdates.map(convert))).publish();
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually, prefix) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this5._state !== 'Running' || _this5._serverCapabilities.completionProvider == null || !(yield _this5._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }

      const params = createTextDocumentPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this5._lspConnection.completion(params);
      } catch (e) {
        _this5._logLspException(e);
        return null;
      }

      if (Array.isArray(response)) {
        return {
          isIncomplete: false,
          items: response.map(convertCompletion)
        };
      } else {
        return {
          isIncomplete: response.isIncomplete,
          items: response.items.map(convertCompletion)
        };
      }
    })();
  }

  getDefinition(fileVersion, position) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this6._state !== 'Running' || !_this6._serverCapabilities.definitionProvider || !(yield _this6._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = createTextDocumentPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this6._lspConnection.gotoDefinition(params);
      } catch (e) {
        _this6._logLspException(e);
        return null;
      }

      if (response == null || Array.isArray(response) && response.length === 0) {
        return null;
      }
      return {
        // TODO: use wordAtPos to determine queryrange
        queryRange: [new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position)],
        definitions: _this6.locationsDefinitions(response)
      };
    })();
  }

  getDefinitionById(file, id) {
    this._logger.error('NYI: getDefinitionById');
    return Promise.resolve(null);
  }

  findReferences(fileVersion, position) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this7._state !== 'Running' || !_this7._serverCapabilities.referencesProvider || !(yield _this7._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const buffer = yield _this7._fileCache.getBufferAtVersion(fileVersion);
      // buffer may still be null despite the above check. We do handle that!

      const positionParams = createTextDocumentPositionParams(fileVersion.filePath, position);
      const params = Object.assign({}, positionParams, { context: { includeDeclaration: true } });
      // ReferenceParams is like TextDocumentPositionParams but with one extra field.

      let response;
      try {
        response = yield _this7._lspConnection.findReferences(params);
      } catch (e) {
        _this7._logLspException(e);
        return null;
      }

      const references = response.map(_this7.locationToFindReference);

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
          const refBuffer = _this7._fileCache.getBuffer(ref.uri);
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
        baseUri: _this7._projectRoot,
        referencedSymbolName,
        references
      };
    })();
  }

  getCoverage(filePath) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this8._state !== 'Running' || !_this8._serverCapabilities.typeCoverageProvider) {
        return null;
      }
      const params = { textDocument: toTextDocumentIdentifier(filePath) };

      let response;
      try {
        response = yield _this8._lspConnection.typeCoverage(params);
      } catch (e) {
        _this8._logLspException(e);
        return null;
      }

      const convertUncovered = function (uncovered) {
        return {
          range: rangeToAtomRange(uncovered.range),
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
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this9._state !== 'Running' || !_this9._serverCapabilities.documentSymbolProvider || !(yield _this9._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = {
        textDocument: toTextDocumentIdentifier(fileVersion.filePath)
      };

      let response;
      try {
        response = yield _this9._lspConnection.documentSymbol(params);
      } catch (e) {
        _this9._logLspException(e);
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
          icon: symbolKindToAtomIcon(symbol.kind),
          tokenizedText: symbolToTokenizedText(symbol),
          startPosition: positionToPoint(symbol.location.range.start),
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
        _this9._logger.error('Outline textDocument/documentSymbol returned an empty symbol name');
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
          _this9._logger.error(`Outline textDocument/documentSymbol ${symbol.name} is missing container ${parentName}`);
        } else {
          if (!(parentCandidates.length > 0)) {
            throw new Error('Invariant violation: "parentCandidates.length > 0"');
          }
          // Find the first candidate that's lexically *after* our symbol.


          const symbolPos = positionToPoint(symbol.location.range.start);
          const iAfter = parentCandidates.findIndex(function (p) {
            return p.startPosition.compare(symbolPos) > 0;
          });
          if (iAfter === -1) {
            // No candidates after item? Then item's parent is the last candidate.
            parentCandidates[parentCandidates.length - 1].children.push(node);
          } else if (iAfter === 0) {
            // All candidates after item? That's an error! We'll arbitrarily pick first one.
            parentCandidates[0].children.push(node);
            _this9._logger.error(`Outline textDocument/documentSymbol ${symbol.name} comes after its container`);
          } else {
            // Some candidates before+after? Then item's parent is the last candidate before.
            parentCandidates[iAfter - 1].children.push(node);
          }
        }
      }

      return { outlineTrees: root.children };
    })();
  }

  typeHint(fileVersion, position) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this10._state !== 'Running' || !_this10._serverCapabilities.hoverProvider || !(yield _this10._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = createTextDocumentPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this10._lspConnection.hover(params);
      } catch (e) {
        _this10._logLspException(e);
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
        range = rangeToAtomRange(response.range);
      }

      return hint ? { hint, range } : null;
    })();
  }

  highlight(fileVersion, position) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this11._state !== 'Running' || !_this11._serverCapabilities.documentHighlightProvider || !(yield _this11._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const params = createTextDocumentPositionParams(fileVersion.filePath, position);

      let response;
      try {
        response = yield _this11._lspConnection.documentHighlight(params);
      } catch (e) {
        _this11._logLspException(e);
        return null;
      }

      const convertHighlight = function (highlight) {
        return rangeToAtomRange(highlight.range);
      };
      return response.map(convertHighlight);
    })();
  }

  formatSource(fileVersion, atomRange) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this12._state !== 'Running') {
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
      const buffer = yield _this12.tryGetBufferWhenWeAndLspAtSameVersion(fileVersion);
      if (buffer == null) {
        _this12._logger.error('LSP.formatSource - buffer changed before we could format');
        return null;
      }
      const options = { tabSize: 2, insertSpaces: true };
      // TODO: from where should we pick up these options? Can we omit them?
      const params = {
        textDocument: toTextDocumentIdentifier(fileVersion.filePath),
        options
      };
      let response;

      // The user might have requested to format either some or all of the buffer.
      // And the LSP server might have the capability to format some or all.
      // We'll match up the request+capability as best we can...
      const canAll = Boolean(_this12._serverCapabilities.documentFormattingProvider);
      const canRange = Boolean(_this12._serverCapabilities.documentRangeFormattingProvider);
      const wantAll = buffer.getRange().compare(atomRange) === 0;
      if (canAll && (wantAll || !canRange)) {
        try {
          response = yield _this12._lspConnection.documentFormatting(params);
        } catch (e) {
          _this12._logLspException(e);
          return null;
        }
      } else if (canRange) {
        // Range is exclusive, and Nuclide snaps it to entire rows. So range.start
        // is character 0 of the start line, and range.end is character 0 of the
        // first line AFTER the selection.
        const range = atomRangeToRange(atomRange);
        const params2 = Object.assign({}, params, { range });
        try {
          response = yield _this12._lspConnection.documentRangeFormatting(params2);
        } catch (e) {
          _this12._logLspException(e);
          return null;
        }
      } else {
        _this12._logger.error('LSP.formatSource - not supported by server');
        return null;
      }

      // As mentioned, the user might have done further typing during that 'await', but if so then
      // our upstream caller will catch it and report an error: no need to re-verify here.

      return _this12._convertFromLspTextEdits(response);
    })();
  }

  _convertFromLspTextEdits(edits) {
    return edits.map(lspTextEdit => {
      const oldRange = rangeToAtomRange(lspTextEdit.range);
      return {
        oldRange,
        newText: lspTextEdit.newText
      };
    });
  }

  formatEntireFile(fileVersion, range) {
    // A language service implements either formatSource or formatEntireFile,
    // and we should pick formatSource in our AtomLanguageServiceConfig.
    this._logger.error('LSP CodeFormat providers should use formatEntireFile: false');
    return Promise.resolve(null);
  }

  formatAtPosition(fileVersion, position, triggerCharacter) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const triggerCharacters = _this13._derivedServerCapabilities.onTypeFormattingTriggerCharacters;
      if (_this13._state !== 'Running' || !triggerCharacters.has(triggerCharacter) || !(yield _this13._lspFileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }

      const edits = yield _this13._lspConnection.documentOnTypeFormatting({
        textDocument: toTextDocumentIdentifier(fileVersion.filePath),
        position: pointToPosition(position),
        ch: triggerCharacter,
        options: { tabSize: 2, insertSpaces: true }
      });
      return _this13._convertFromLspTextEdits(edits);
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
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this14._state !== 'Running' || !_this14._serverCapabilities.workspaceSymbolProvider) {
        return null;
      }
      const params = { query };

      let response;
      try {
        response = yield _this14._lspConnection.workspaceSymbol(params);
      } catch (e) {
        _this14._logLspException(e);
        return null;
      }

      return response.map(convertSearchResult);
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

  // TODO: (asiandrummer) LSP implementations should honor file URI protocol.
  // For now, check if the URI starts with the scheme, and strip it out
  // manually.
  // For cases where the parsed URI does not contain a correct URI protocol
  // and/or a pathname (e.g: an empty string, or a non-file URI (nuclide:// or
  // http:// with a webpage URL)), log an error and return the raw URI.
  _convertLspUriToNuclideUri(uri) {
    const urlObject = _url.default.parse(uri);
    // LSP should only send URI with `file:` protocol or without any protocol.
    if (urlObject.protocol !== 'file:' && urlObject.protocol) {
      this._logger.error(`Incorrect URI protocol ${urlObject.protocol} - using the raw URI instead.`);
      return uri;
    }

    if (!urlObject.pathname) {
      this._logger.error('URI pathname does not exist - using the raw URI instead.');
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
  locationToFindReference(location) {
    return {
      uri: location.uri,
      name: null,
      range: rangeToAtomRange(location.range)
    };
  }

  locationToDefinition(location) {
    return {
      path: this._convertLspUriToNuclideUri(location.uri),
      position: positionToPoint(location.range.start),
      language: 'Python', // TODO
      projectRoot: this._projectRoot
    };
  }

  locationsDefinitions(locations) {
    if (Array.isArray(locations)) {
      return locations.map(this.locationToDefinition.bind(this));
    } else {
      return [this.locationToDefinition(locations)];
    }
  }
}

exports.LspLanguageService = LspLanguageService;
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
  }
}

// TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
function toTextDocumentIdentifier(filePath) {
  return {
    uri: filePath
  };
}

function pointToPosition(position) {
  return {
    line: position.row,
    character: position.column
  };
}

function positionToPoint(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line, position.character);
}

function rangeToAtomRange(range) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(positionToPoint(range.start), positionToPoint(range.end));
}

function atomRangeToRange(range) {
  return {
    start: pointToPosition(range.start),
    end: pointToPosition(range.end)
  };
}

function convertSeverity(severity) {
  switch (severity) {
    case null:
    case undefined:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Error:
    default:
      return 'Error';
    case (_protocol || _load_protocol()).DiagnosticSeverity.Warning:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Information:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Hint:
      return 'Warning';
  }
}

// TODO: (asiandrummer, ljw) `filePath` should be a file URI (`file://`).
function createTextDocumentPositionParams(filePath, position) {
  return {
    textDocument: toTextDocumentIdentifier(filePath),
    position: pointToPosition(position)
  };
}

function convertCompletion(item) {
  return {
    text: item.insertText || item.label,
    displayText: item.label,
    type: item.detail,
    description: item.documentation
  };
}

function messageTypeToAtomLevel(type) {
  switch (type) {
    case (_protocol || _load_protocol()).MessageType.Info:
      return 'info';
    case (_protocol || _load_protocol()).MessageType.Warning:
      return 'warning';
    case (_protocol || _load_protocol()).MessageType.Log:
      return 'log';
    case (_protocol || _load_protocol()).MessageType.Error:
      return 'error';
    default:
      return 'error';
  }
}

// Converts an LSP SymbolInformation.kind number into an Atom icon
// from https://github.com/atom/atom/blob/master/static/octicons.less -
// you can see the pictures at https://octicons.github.com/
function symbolKindToAtomIcon(kind) {
  // for reference, vscode: https://github.com/Microsoft/vscode/blob/be08f9f3a1010354ae2d8b84af017ed1043570e7/src/vs/editor/contrib/suggest/browser/media/suggest.css#L135
  // for reference, hack: https://github.com/facebook/nuclide/blob/20cf17dca439e02a64f4365f3a52b0f26cf53726/pkg/nuclide-hack-rpc/lib/SymbolSearch.js#L120
  switch (kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
      return 'file';
    case (_protocol || _load_protocol()).SymbolKind.Module:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Package:
      return 'package';
    case (_protocol || _load_protocol()).SymbolKind.Class:
      return 'code';
    case (_protocol || _load_protocol()).SymbolKind.Method:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Property:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Field:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Enum:
      return 'file-binary';
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      return 'puzzle';
    case (_protocol || _load_protocol()).SymbolKind.Function:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Variable:
      return 'pencil';
    case (_protocol || _load_protocol()).SymbolKind.Constant:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.String:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Number:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Array:
      return 'list-ordered';
    default:
      return 'question';
  }
}

// Converts an LSP SymbolInformation into TokenizedText
function symbolToTokenizedText(symbol) {
  const tokens = [];

  // The TokenizedText ontology is deliberately small, much smaller than
  // SymbolInformation.kind, because it's used for colorization and you don't
  // want your colorized text looking like a fruit salad.
  switch (symbol.kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
    case (_protocol || _load_protocol()).SymbolKind.Module:
    case (_protocol || _load_protocol()).SymbolKind.Package:
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Class:
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).className)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).constructor)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Method:
    case (_protocol || _load_protocol()).SymbolKind.Property:
    case (_protocol || _load_protocol()).SymbolKind.Field:
    case (_protocol || _load_protocol()).SymbolKind.Enum:
    case (_protocol || _load_protocol()).SymbolKind.Function:
    case (_protocol || _load_protocol()).SymbolKind.Constant:
    case (_protocol || _load_protocol()).SymbolKind.Variable:
    case (_protocol || _load_protocol()).SymbolKind.Array:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).method)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.String:
    case (_protocol || _load_protocol()).SymbolKind.Number:
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).string)(symbol.name));
      break;
    default:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
  }

  return tokens;
}

function convertSearchResult(info) {
  let hoverText = 'unknown';
  for (const key in (_protocol || _load_protocol()).SymbolKind) {
    if (info.kind === (_protocol || _load_protocol()).SymbolKind[key]) {
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
    hoverText
  };
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
    this._logger.info(`LSP.trace: ${message} ${data || ''}`);
  }
}