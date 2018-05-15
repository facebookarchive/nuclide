'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));exports.























addProvider = addProvider;exports.


























applyFix = applyFix;exports.



















































notifyOfFixFailures = notifyOfFixFailures;exports.



















fetchCodeActions = fetchCodeActions;var _log4js;function _load_log4js() {return _log4js = require('log4js');}var _textEdit;function _load_textEdit() {return _textEdit = require('../../../../../nuclide-commons-atom/text-edit');}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _Actions;function _load_Actions() {return _Actions = _interopRequireWildcard(require('./Actions'));}var _Selectors;function _load_Selectors() {return _Selectors = _interopRequireWildcard(require('./Selectors'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function addProvider(actions) {return actions.ofType((_Actions || _load_Actions()).ADD_PROVIDER).mergeMap(action => {if (!(action.type === (_Actions || _load_Actions()).ADD_PROVIDER)) {throw new Error('Invariant violation: "action.type === Actions.ADD_PROVIDER"');}const { provider } = action.payload;const updateActions = provider.updates.map(update => (_Actions || _load_Actions()).updateMessages(provider, update));const invalidationActions = provider.invalidations.map(invalidation => (_Actions || _load_Actions()).invalidateMessages(provider, invalidation));const removed = actions.filter(a => a.type === (_Actions || _load_Actions()).REMOVE_PROVIDER && a.payload.provider === provider).take(1);return _rxjsBundlesRxMinJs.Observable.merge(updateActions, invalidationActions).takeUntil(removed);});} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Applies fixes. This epic is only for side-effects, so it returns `Observable<empty>`.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */function applyFix(actions, store, extras) {const { messageRangeTracker } = extras; // Map both type of "apply fix" actions to the same shape. This probably indicates that we don't
  // actually need two different action types.
  const messagesStream = _rxjsBundlesRxMinJs.Observable.merge(actions.ofType((_Actions || _load_Actions()).APPLY_FIX).map(action => {if (!(action.type === (_Actions || _load_Actions()).APPLY_FIX)) {throw new Error('Invariant violation: "action.type === Actions.APPLY_FIX"');}const { message } = action.payload;return [message];}), actions.ofType((_Actions || _load_Actions()).APPLY_FIXES_FOR_FILE).map(action => {if (!(action.type === (_Actions || _load_Actions()).APPLY_FIXES_FOR_FILE)) {throw new Error('Invariant violation: "action.type === Actions.APPLY_FIXES_FOR_FILE"');} // TODO: Be consistent about file/filePath/path.
    const { file: filePath } = action.payload;return (_Selectors || _load_Selectors()).getFileMessages(store.getState(), filePath);}));return messagesStream.filter(messages => messages.length !== 0).map(messages => {// We know that all of the messages have the same path based on the actions above, so just
    // grab it from the first message.
    const { filePath } = messages[0];if (!(filePath != null)) {throw new Error('Invariant violation: "filePath != null"');} // Get the fixes for each message.
    const messagesWithFixes = messages.filter(msg => msg.fix != null);const fixes = [];for (const message of messagesWithFixes) {const range = messageRangeTracker.getCurrentRange(message);if (range == null) {break;}fixes.push(Object.assign({}, message.fix, { oldRange: range }));}const succeeded = messagesWithFixes.length === fixes.length && (0, (_textEdit || _load_textEdit()).applyTextEdits)(filePath, ...fixes);if (succeeded) {return (_Actions || _load_Actions()).fixesApplied(filePath, new Set(messagesWithFixes));}return (_Actions || _load_Actions()).fixFailed();});}function notifyOfFixFailures(actions) {return actions.ofType((_Actions || _load_Actions()).FIX_FAILED).do(() => {atom.notifications.addWarning('Failed to apply fix. Try saving to get fresh results and then try again.');}).ignoreElements();}function forkJoinArray(sources) {// $FlowFixMe: Needs a specialization for arrays
  return _rxjsBundlesRxMinJs.Observable.forkJoin(...sources);}function fetchCodeActions(actions, store) {// TODO(hansonw): Until we have have a UI for it, only handle one request at a time.
  return actions.ofType((_Actions || _load_Actions()).FETCH_CODE_ACTIONS).switchMap(action => {if (!(action.type === (_Actions || _load_Actions()).FETCH_CODE_ACTIONS)) {throw new Error('Invariant violation: "action.type === Actions.FETCH_CODE_ACTIONS"');}const { codeActionFetcher } = store.getState();if (codeActionFetcher == null) {return _rxjsBundlesRxMinJs.Observable.empty();}const { messages, editor } = action.payload;return forkJoinArray(messages.map(message => _rxjsBundlesRxMinJs.Observable.defer(() => {// Skip fetching code actions if the diagnostic already includes them.
      if (message.actions != null && message.actions.length > 0) {return Promise.resolve([]);} else {return codeActionFetcher.getCodeActionForDiagnostic(message, editor);

      }
    }).
    switchMap(codeActions => {
      return codeActions.length === 0 ?
      // forkJoin emits nothing for empty arrays.
      _rxjsBundlesRxMinJs.Observable.of([]) :
      forkJoinArray(
      // Eagerly fetch the titles so that they're immediately usable in a UI.
      codeActions.map((() => {var _ref = (0, _asyncToGenerator.default)(function* (codeAction) {return [
          yield codeAction.getTitle(),
          codeAction];});return function (_x) {return _ref.apply(this, arguments);};})()));


    }).
    map(codeActions => [message, new Map(codeActions)]))).


    map(codeActionsForMessage =>
    (_Actions || _load_Actions()).setCodeActions(new Map(codeActionsForMessage))).

    catch(err => {
      (0, (_log4js || _load_log4js()).getLogger)('atom-ide-diagnostics').error(
      `Error fetching code actions for ${messages[0].filePath}`,
      err);

      return _rxjsBundlesRxMinJs.Observable.empty();
    });
  });
}