'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHostServices = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getHostServices = exports.getHostServices = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // This method doesn't need to be async. But out of laziness we're
    // reusing 'forkHostServices', which is designed to work over NuclideRPC
    // if necessary, so it has to be async.
    if (rootAggregatorPromise == null) {
      const rootServices = new RootHostServices();
      rootAggregatorPromise = (0, (_HostServicesAggregator || _load_HostServicesAggregator()).forkHostServices)(rootServices, logger);
    }
    return (0, (_HostServicesAggregator || _load_HostServicesAggregator()).forkHostServices)((yield rootAggregatorPromise), logger);
  });

  return function getHostServices() {
    return _ref.apply(this, arguments);
  };
})();

// Following type implements the HostServicesForLanguage interface


var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _HostServicesAggregator;

function _load_HostServicesAggregator() {
  return _HostServicesAggregator = require('../../nuclide-language-service-rpc/lib/HostServicesAggregator');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let rootAggregatorPromise; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */

const logger = (0, (_log4js || _load_log4js()).getLogger)('HostServices');

null;

class RootHostServices {
  constructor() {
    this._consoleSubjects = new Map();
  }

  // lazily created map from source, to how we'll push messages from that source

  consoleNotification(source, level, text) {
    let subjectPromise = this._consoleSubjects.get(source);
    if (subjectPromise == null) {
      subjectPromise = new Promise((resolve, reject) => {
        const subject = new _rxjsBundlesRxMinJs.Subject();
        const consumer = service => {
          service.registerOutputProvider({
            messages: subject,
            id: source
          });
          resolve(subject);
        };
        atom.packages.serviceHub.consume('nuclide-output', '0.0.0', consumer);
      });
      this._consoleSubjects.set(source, subjectPromise);
    }
    subjectPromise.then(subject => subject.next({ level, text }));

    // This method creates registrations to the nuclide-output service,
    // but never disposes those registrations; there's not much point. The
    // now-defunct sources will be visible in the Sources UI.
  }

  dialogNotification(level, text) {
    // We return a ConnectableObservable such that
    // (1) when code connects to it then we display the dialog
    // (2) when user dismiss the dialog then we complete the stream
    // (3) if code unsubscribed before that, then we dismiss the dialog
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      const notification = this._atomNotification(level, text, {
        dismissable: true
      });
      notification.onDidDismiss(() => observer.complete());
      return () => notification.dismiss();
    }).publish();
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    // We return a ConnectedObservable such that
    // (1) when code connects to it then we display the dialog
    // (2) if user clicks a button then we do next(buttonLabel); complete()
    // (3) if user clicks Close then we do next(closeLabel); complete();
    // (4) if code unsubscribed before that then we dismiss the dialog.
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      let result = closeLabel;
      const notification = this._atomNotification(level, text, {
        dismissable: true, // dialog will stay up until user dismisses it
        buttons: buttonLabels.map(label => ({
          text: label,
          onDidClick: () => {
            result = label;
            notification.dismiss(); // they don't auto-dismiss on click
          }
        }))
      });
      notification.onDidDismiss(() => {
        observer.next(result);
        observer.complete();
      });
      return () => notification.dismiss();
    }).publish();
  }

  dispose() {
    // No one can ever call this function because RootHostServices and
    // RootAggregator are private to this module, and we don't call dispose.
    if (!false) {
      throw new Error('RootHostServices and RootAggregator cannot be disposed.');
    }
  }

  childRegister(child) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this;
      // Root only ever has exactly one child, the RootAggregator,
      // so we don't bother with registration: when the aggregator relays
      // commands, it will relay them straight to root services.
    })();
  }

  _atomNotification(level, text, options) {
    switch (level) {
      case 'info':
        return atom.notifications.addInfo(text, options);
      case 'log':
        return atom.notifications.addInfo(text, options);
      case 'warning':
        return atom.notifications.addWarning(text, options);
      case 'error':
        return atom.notifications.addError(text, options);
      default:
        if (!false) {
          throw new Error('Unrecognized ShowMessageLevel');
        }

    }
  }
}