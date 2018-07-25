"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addProvider = addProvider;
exports.applyFix = applyFix;
exports.notifyOfFixFailures = notifyOfFixFailures;
exports.fetchCodeActions = fetchCodeActions;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("../../../../../nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("./Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function addProvider(actions) {
  return actions.ofType(Actions().ADD_PROVIDER).mergeMap(action => {
    if (!(action.type === Actions().ADD_PROVIDER)) {
      throw new Error("Invariant violation: \"action.type === Actions.ADD_PROVIDER\"");
    }

    const {
      provider
    } = action.payload;
    const updateActions = provider.updates.map(update => Actions().updateMessages(provider, update));
    const invalidationActions = provider.invalidations.map(invalidation => Actions().invalidateMessages(provider, invalidation));
    const removed = actions.filter(a => a.type === Actions().REMOVE_PROVIDER && a.payload.provider === provider).take(1);
    return _RxMin.Observable.merge(updateActions, invalidationActions).takeUntil(removed);
  });
}
/**
 * Applies fixes. This epic is only for side-effects, so it returns `Observable<empty>`.
 */


function applyFix(actions, store, extras) {
  const {
    messageRangeTracker
  } = extras; // Map both type of "apply fix" actions to the same shape. This probably indicates that we don't
  // actually need two different action types.

  const messagesStream = _RxMin.Observable.merge(actions.ofType(Actions().APPLY_FIX).map(action => {
    if (!(action.type === Actions().APPLY_FIX)) {
      throw new Error("Invariant violation: \"action.type === Actions.APPLY_FIX\"");
    }

    const {
      message
    } = action.payload;
    return [message];
  }), actions.ofType(Actions().APPLY_FIXES_FOR_FILE).map(action => {
    if (!(action.type === Actions().APPLY_FIXES_FOR_FILE)) {
      throw new Error("Invariant violation: \"action.type === Actions.APPLY_FIXES_FOR_FILE\"");
    } // TODO: Be consistent about file/filePath/path.


    const {
      file: filePath
    } = action.payload;
    return Selectors().getFileMessages(store.getState(), filePath);
  }));

  return messagesStream.filter(messages => messages.length !== 0).map(messages => {
    // We know that all of the messages have the same path based on the actions above, so just
    // grab it from the first message.
    const {
      filePath
    } = messages[0];

    if (!(filePath != null)) {
      throw new Error("Invariant violation: \"filePath != null\"");
    } // Get the fixes for each message.


    const messagesWithFixes = messages.filter(msg => msg.fix != null);
    const fixes = [];

    for (const message of messagesWithFixes) {
      const range = messageRangeTracker.getCurrentRange(message);

      if (range == null) {
        break;
      }

      fixes.push(Object.assign({}, message.fix, {
        oldRange: range
      }));
    }

    const succeeded = messagesWithFixes.length === fixes.length && (0, _textEdit().applyTextEdits)(filePath, ...fixes);

    if (succeeded) {
      return Actions().fixesApplied(filePath, new Set(messagesWithFixes));
    }

    return Actions().fixFailed();
  });
}

function notifyOfFixFailures(actions) {
  return actions.ofType(Actions().FIX_FAILED).do(() => {
    atom.notifications.addWarning('Failed to apply fix. Try saving to get fresh results and then try again.');
  }).ignoreElements();
}

function forkJoinArray(sources) {
  // $FlowFixMe: Needs a specialization for arrays
  return _RxMin.Observable.forkJoin(...sources);
}

function fetchCodeActions(actions, store) {
  // TODO(hansonw): Until we have have a UI for it, only handle one request at a time.
  return actions.ofType(Actions().FETCH_CODE_ACTIONS).distinctUntilChanged((x, y) => {
    if (!(x.type === Actions().FETCH_CODE_ACTIONS)) {
      throw new Error("Invariant violation: \"x.type === Actions.FETCH_CODE_ACTIONS\"");
    }

    if (!(y.type === Actions().FETCH_CODE_ACTIONS)) {
      throw new Error("Invariant violation: \"y.type === Actions.FETCH_CODE_ACTIONS\"");
    }

    return x.payload.editor === y.payload.editor && (0, _collection().arrayEqual)(x.payload.messages, y.payload.messages);
  }).switchMap(action => {
    if (!(action.type === Actions().FETCH_CODE_ACTIONS)) {
      throw new Error("Invariant violation: \"action.type === Actions.FETCH_CODE_ACTIONS\"");
    }

    const {
      codeActionFetcher
    } = store.getState();

    if (codeActionFetcher == null) {
      return _RxMin.Observable.empty();
    }

    const {
      messages,
      editor
    } = action.payload;
    return forkJoinArray(messages.map(message => _RxMin.Observable.defer(() => {
      // Skip fetching code actions if the diagnostic already includes them.
      if (message.actions != null && message.actions.length > 0) {
        return Promise.resolve([]);
      } else {
        return codeActionFetcher.getCodeActionForDiagnostic(message, editor);
      }
    }).switchMap(codeActions => {
      return codeActions.length === 0 ? // forkJoin emits nothing for empty arrays.
      _RxMin.Observable.of([]) : forkJoinArray( // Eagerly fetch the titles so that they're immediately usable in a UI.
      codeActions.map(async codeAction => [await codeAction.getTitle(), codeAction]));
    }).map(codeActions => [message, new Map(codeActions)]))).map(codeActionsForMessage => Actions().setCodeActions(new Map(codeActionsForMessage))).catch(err => {
      (0, _log4js().getLogger)('atom-ide-diagnostics').error(`Error fetching code actions for ${messages[0].filePath}`, err);
      return _RxMin.Observable.empty();
    });
  });
}