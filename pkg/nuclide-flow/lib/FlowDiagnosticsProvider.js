'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _dec, _desc, _value, _class;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _flowDiagnosticsCommon;

function _load_flowDiagnosticsCommon() {
  return _flowDiagnosticsCommon = require('./flowDiagnosticsCommon');
}

var _flowMessageToFix;

function _load_flowMessageToFix() {
  return _flowMessageToFix = _interopRequireDefault(require('./flowMessageToFix'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */

function extractPath(message) {
  return message.range == null ? undefined : message.range.file;
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message) {
  return {
    type: 'Trace',
    text: message.descr,
    filePath: extractPath(message),
    range: (0, (_flowDiagnosticsCommon || _load_flowDiagnosticsCommon()).extractRange)(message)
  };
}

function flowMessageToDiagnosticMessage(diagnostic) {
  const flowMessage = diagnostic.messageComponents[0];

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  const path = extractPath(flowMessage);

  if (!(path != null)) {
    throw new Error('Expected path to not be null or undefined');
  }

  const diagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: diagnostic.level === 'error' ? 'Error' : 'Warning',
    text: flowMessage.descr,
    filePath: path,
    range: (0, (_flowDiagnosticsCommon || _load_flowDiagnosticsCommon()).extractRange)(flowMessage)
  };

  const fix = (0, (_flowMessageToFix || _load_flowMessageToFix()).default)(diagnostic);
  if (fix != null) {
    diagnosticMessage.fix = fix;
  }

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (diagnostic.messageComponents.length > 1) {
    diagnosticMessage.trace = diagnostic.messageComponents.slice(1).map(flowMessageToTrace);
  }

  return diagnosticMessage;
}

let FlowDiagnosticsProvider = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('flow.run-diagnostics'), (_class = class FlowDiagnosticsProvider {

  constructor(shouldRunOnTheFly, busySignalProvider) {
    let ProviderBase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase;

    this._busySignalProvider = busySignalProvider;
    const utilsOptions = {
      grammarScopes: new Set((_constants || _load_constants()).JS_GRAMMARS),
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: editor => this._runDiagnostics(editor),
      onNewUpdateSubscriber: callback => this._receivedNewUpdateSubscriber(callback)
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new (_promise || _load_promise()).RequestSerializer();
    this._flowRootToFilePaths = new Map();
  }

  /**
    * Maps flow root to the set of file paths under that root for which we have
    * ever reported diagnostics.
    */


  _runDiagnostics(textEditor) {
    this._busySignalProvider.reportBusy('Flow: Waiting for diagnostics', () => this._runDiagnosticsImpl(textEditor)).catch(e => logger.error(e));
  }

  _runDiagnosticsImpl(textEditor) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const file = textEditor.getPath();
      if (!file) {
        return;
      }

      const flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(file);

      if (!flowService) {
        throw new Error('Invariant violation: "flowService"');
      }

      const result = yield _this._requestSerializer.run(flowService.flowFindDiagnostics(file, /* currentContents */null));
      if (result.status === 'outdated') {
        return;
      }
      const diagnostics = result.result;
      if (!diagnostics) {
        return;
      }
      const flowRoot = diagnostics.flowRoot,
            messages = diagnostics.messages;


      const pathsToInvalidate = _this._getPathsToInvalidate(flowRoot);
      /*
       * TODO Consider optimizing for the common case of only a single flow root
       * by invalidating all instead of enumerating the files.
       */
      _this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });

      const pathsForRoot = new Set();
      _this._flowRootToFilePaths.set(flowRoot, pathsForRoot);
      for (const message of messages) {
        /*
         * Each message consists of several different components, each with its
         * own text and path.
         */
        for (const messageComponent of message.messageComponents) {
          if (messageComponent.range != null) {
            pathsForRoot.add(messageComponent.range.file);
          }
        }
      }

      _this._providerBase.publishMessageUpdate(_this._processDiagnostics(messages, file));
    })();
  }

  _getPathsToInvalidate(flowRoot) {
    const filePaths = this._flowRootToFilePaths.get(flowRoot);
    if (!filePaths) {
      return [];
    }
    return Array.from(filePaths);
  }

  _receivedNewUpdateSubscriber(callback) {
    // Every time we get a new subscriber, we need to push results to them. This
    // logic is common to all providers and should be abstracted out (t7813069)
    //
    // Once we provide all diagnostics, instead of just the current file, we can
    // probably remove the activeTextEditor parameter.
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (activeTextEditor) {
      const matchesGrammar = (_constants || _load_constants()).JS_GRAMMARS.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
      if (matchesGrammar) {
        this._runDiagnostics(activeTextEditor);
      }
    }
  }

  onMessageUpdate(callback) {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback) {
    return this._providerBase.onMessageInvalidation(callback);
  }

  dispose() {
    this._providerBase.dispose();
  }

  _processDiagnostics(diagnostics, currentFile) {

    // convert array messages to Error Objects with Traces
    const fileDiagnostics = diagnostics.map(flowMessageToDiagnosticMessage);

    const filePathToMessages = new Map();

    // This invalidates the errors in the current file. If Flow, when running in this root, has
    // reported errors for this file, this invalidation is not necessary because the path will be
    // explicitly invalidated. However, if Flow has reported an error in this root from another root
    // (as sometimes happens when Flow roots contain symlinks to other Flow roots), and it also does
    // not report that same error when running in this Flow root, then we want the error to
    // disappear when this file is opened.
    //
    // This isn't a perfect solution, since it can still leave diagnostics up in other files, but
    // this is a corner case and doing this is still better than doing nothing.
    //
    // I think that whenever this happens, it's a bug in Flow. It seems strange for Flow to report
    // errors in one place when run from one root, and not report errors in that same place when run
    // from another root. But such is life.
    filePathToMessages.set(currentFile, []);

    for (const diagnostic of fileDiagnostics) {
      const path = diagnostic.filePath;
      let diagnosticArray = filePathToMessages.get(path);
      if (!diagnosticArray) {
        diagnosticArray = [];
        filePathToMessages.set(path, diagnosticArray);
      }
      diagnosticArray.push(diagnostic);
    }

    return { filePathToMessages: filePathToMessages };
  }

  invalidateProjectPath(projectPath) {
    const pathsToInvalidate = new Set();
    for (const flowRootEntry of this._flowRootToFilePaths) {
      var _flowRootEntry = _slicedToArray(flowRootEntry, 2);

      const flowRoot = _flowRootEntry[0],
            filePaths = _flowRootEntry[1];

      if (!flowRoot.startsWith(projectPath)) {
        continue;
      }
      for (const filePath of filePaths) {
        pathsToInvalidate.add(filePath);
      }
      this._flowRootToFilePaths.delete(flowRoot);
    }
    this._providerBase.publishMessageInvalidation({
      scope: 'file',
      filePaths: Array.from(pathsToInvalidate)
    });
  }
}, (_applyDecoratedDescriptor(_class.prototype, '_runDiagnosticsImpl', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_runDiagnosticsImpl'), _class.prototype)), _class));


module.exports = FlowDiagnosticsProvider;