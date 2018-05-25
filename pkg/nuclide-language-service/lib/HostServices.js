'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

exports.getHostServices = getHostServices;

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/consumeFirstProvider'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _HostServicesAggregator;

function _load_HostServicesAggregator() {
  return _HostServicesAggregator = require('../../nuclide-language-service-rpc/lib/HostServicesAggregator');
}

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('../../../modules/nuclide-commons-atom/text-edit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

let rootAggregatorPromise;
const logger = (0, (_log4js || _load_log4js()).getLogger)('HostServices');

async function getHostServices() {
  // This method doesn't need to be async. But out of laziness we're
  // reusing 'forkHostServices', which is designed to work over NuclideRPC
  // if necessary, so it has to be async.
  if (rootAggregatorPromise == null) {
    const rootServices = new RootHostServices();
    rootAggregatorPromise = (0, (_HostServicesAggregator || _load_HostServicesAggregator()).forkHostServices)(rootServices, logger);
  }
  return (0, (_HostServicesAggregator || _load_HostServicesAggregator()).forkHostServices)((await rootAggregatorPromise), logger);
}

// Following type implements the HostServicesForLanguage interface
null;

class RootHostServices {
  constructor() {
    this._nullProgressMessage = {
      setTitle: s => {},
      dispose: () => {}
    };
    this._getConsoleService = (0, (_memoize2 || _load_memoize()).default)(() => (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('console', '0.1.0'));
    this._getConsoleApi = (0, (_memoize2 || _load_memoize()).default)(source => this._getConsoleService().then(createApi => createApi({ id: source, name: source })));
  }

  // This method creates registers sources with the atom-ide-console service, but never disposes
  // those registrations; there's not much point. The now-defunct sources will be visible in the
  // Sources UI.


  consoleNotification(source, level, text) {
    this._getConsoleApi(source).then(api => {
      api.append({ text, level });
    });
  }

  dialogNotification(level, text) {
    // We return a ConnectableObservable such that
    // (1) when code connects to it then we display the dialog
    // (2) when user dismiss the dialog then we complete the stream
    // (3) if code unsubscribed before that, then we dismiss the dialog
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      const notification = this._atomNotification(level, text);
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

  async applyTextEditsForMultipleFiles(changes) {
    return (0, (_textEdit || _load_textEdit()).applyTextEditsForMultipleFiles)(changes);
  }

  _getBusySignalService() {
    // TODO(ljw): if the busy-signal-package has been disabled before this
    // this function is called, we'll return a promise that never completes.
    if (this._busySignalServicePromise == null) {
      this._busySignalServicePromise = new Promise((resolve, reject) => {
        atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0', service => {
          // When the package is provided to us, resolve the promise
          resolve(service);
          // When the package becomes unavailable to us, put in a null promise
          return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
            this._busySignalServicePromise = Promise.resolve(null);
          });
        });
      });
    }
    return this._busySignalServicePromise;
  }

  async showProgress(title, options) {
    const service = await this._getBusySignalService();
    const busyMessage = service == null ? this._nullProgressMessage : service.reportBusy(title, Object.assign({}, options));
    // The BusyMessage type from atom-ide-busy-signal happens to satisfy the
    // nuclide-rpc-able interface 'Progress': thus, we can return it directly.
    return busyMessage;
  }

  showActionRequired(title, options) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => this._getBusySignalService()).switchMap(service => {
      return _rxjsBundlesRxMinJs.Observable.create(observer => {
        let onDidClick;
        if (options != null && options.clickable) {
          onDidClick = () => {
            observer.next();
          };
        }
        const busyMessage = service == null ? this._nullProgressMessage : service.reportBusy(title, {
          waitingFor: 'user',
          onDidClick
        });
        return () => busyMessage.dispose();
      });
    }).publish();
  }

  dispose() {
    // No one can ever call this function because RootHostServices and
    // RootAggregator are private to this module, and we don't call dispose.
    if (!false) {
      throw new Error('RootHostServices and RootAggregator cannot be disposed.');
    }
  }

  async childRegister(child) {
    return this;
    // Root only ever has exactly one child, the RootAggregator,
    // so we don't bother with registration: when the aggregator relays
    // commands, it will relay them straight to root services.
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