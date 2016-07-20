Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var UPDATE_EVENT = 'update';
var INVALIDATE_EVENT = 'invalidate';

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

function getTextEventDispatcher() {
  return require('../../nuclide-text-event-dispatcher').getInstance();
}

var DiagnosticsProviderBase = (function () {
  function DiagnosticsProviderBase(options) {
    var textEventDispatcher = arguments.length <= 1 || arguments[1] === undefined ? getTextEventDispatcher() : arguments[1];

    _classCallCheck(this, DiagnosticsProviderBase);

    this._textEventDispatcher = textEventDispatcher;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._textEventCallback = callbackOrNoop(options.onTextEditorEvent);
    this._newUpdateSubscriberCallback = callbackOrNoop(options.onNewUpdateSubscriber);
    this._newInvalidateSubscriberCallback = callbackOrNoop(options.onNewInvalidateSubscriber);

    // The Set constructor creates an empty Set if passed null or undefined.
    this._grammarScopes = new Set(options.grammarScopes);
    this._allGrammarScopes = Boolean(options.enableForAllGrammars);
    this._subscribeToTextEditorEvent(Boolean(options.shouldRunOnTheFly));
  }

  /**
   * Subscribes to the appropriate event depending on whether we should run on
   * the fly or not.
   */

  _createClass(DiagnosticsProviderBase, [{
    key: '_subscribeToTextEditorEvent',
    value: function _subscribeToTextEditorEvent(shouldRunOnTheFly) {
      this._disposeEventSubscription();
      var dispatcher = this._textEventDispatcher;
      var subscription = undefined;
      if (shouldRunOnTheFly) {
        if (this._allGrammarScopes) {
          subscription = dispatcher.onAnyFileChange(this._textEventCallback);
        } else {
          subscription = dispatcher.onFileChange(this._grammarScopes, this._textEventCallback);
        }
      } else {
        if (this._allGrammarScopes) {
          subscription = dispatcher.onAnyFileSave(this._textEventCallback);
        } else {
          subscription = dispatcher.onFileSave(this._grammarScopes, this._textEventCallback);
        }
      }
      this._currentEventSubscription = subscription;
    }
  }, {
    key: 'setRunOnTheFly',
    value: function setRunOnTheFly(runOnTheFly) {
      this._subscribeToTextEditorEvent(runOnTheFly);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
      this._disposables.dispose();
      this._disposeEventSubscription();
    }
  }, {
    key: '_disposeEventSubscription',
    value: function _disposeEventSubscription() {
      if (this._currentEventSubscription) {
        this._currentEventSubscription.dispose();
        this._currentEventSubscription = null;
      }
    }

    /**
     * Clients can call these methods to publish messages
     */

  }, {
    key: 'publishMessageUpdate',
    value: function publishMessageUpdate(update) {
      this._emitter.emit(UPDATE_EVENT, update);
    }
  }, {
    key: 'publishMessageInvalidation',
    value: function publishMessageInvalidation(message) {
      this._emitter.emit(INVALIDATE_EVENT, message);
    }

    /**
     * Clients should delegate to these
     */

  }, {
    key: 'onMessageUpdate',
    value: function onMessageUpdate(callback) {
      var disposable = this._emitter.on(UPDATE_EVENT, callback);
      this._newUpdateSubscriberCallback(callback);
      return disposable;
    }
  }, {
    key: 'onMessageInvalidation',
    value: function onMessageInvalidation(callback) {
      var disposable = this._emitter.on(INVALIDATE_EVENT, callback);
      this._newInvalidateSubscriberCallback(callback);
      return disposable;
    }
  }]);

  return DiagnosticsProviderBase;
})();

exports.DiagnosticsProviderBase = DiagnosticsProviderBase;

function callbackOrNoop(callback) {
  return callback ? callback.bind(undefined) : function () {};
}

/** The callback by which a provider is notified of text events, such as a file save. */

/**
 * The callback by which a provider is notified that a new consumer has subscribed to diagnostic
 * updates.
 */

/**
 * The callback by which a provider is notified that a new consumer has subscribed to diagnostic
 * invalidations.
 */

/**
 * If true, this will cause onTextEditorEvent to get called more often -- approximately whenever
 * the user stops typing. If false, it will get called only when the user saves.
 */

/**
 * The following two options specify which grammars the provider is interested in. Most providers
 * will include a set of grammarScopes, and will therefore get notifications only about
 * TextEditors that are associated with those grammarScopes. Instead, a provider may set
 * enableForAllGrammars to true, and then it will get notified of changes in all TextEditors. If
 * enableForAllGrammars is true, it overrides the grammars in grammarScopes.
 */

// callbacks provided by client