"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHostServices = getHostServices;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _consumeFirstProvider() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/consumeFirstProvider"));

  _consumeFirstProvider = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _HostServicesAggregator() {
  const data = require("../../nuclide-language-service-rpc/lib/HostServicesAggregator");

  _HostServicesAggregator = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("../../../modules/nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let rootAggregatorPromise;
const logger = (0, _log4js().getLogger)('HostServices');

async function getHostServices() {
  // This method doesn't need to be async. But out of laziness we're
  // reusing 'forkHostServices', which is designed to work over NuclideRPC
  // if necessary, so it has to be async.
  if (rootAggregatorPromise == null) {
    const rootServices = new RootHostServices();
    rootAggregatorPromise = (0, _HostServicesAggregator().forkHostServices)(rootServices, logger);
  }

  return (0, _HostServicesAggregator().forkHostServices)((await rootAggregatorPromise), logger);
} // Following type implements the HostServicesForLanguage interface


null;

class RootHostServices {
  constructor() {
    this._nullProgressMessage = {
      setTitle: s => {},
      dispose: () => {}
    };
    this._getConsoleService = (0, _memoize2().default)(() => (0, _consumeFirstProvider().default)('console', '0.1.0'));
    this._getConsoleApi = (0, _memoize2().default)(source => this._getConsoleService().then(createApi => createApi({
      id: source,
      name: source
    })));
  }

  consoleNotification(source, level, text) {
    this._getConsoleApi(source).then(api => {
      api.append({
        text,
        level
      });
    });
  }

  dialogNotification(level, text) {
    // We return a ConnectableObservable such that
    // (1) when code connects to it then we display the dialog
    // (2) when the dialog closes we complete the stream
    // (3) if code unsubscribed before that, then we dismiss the dialog
    return _RxMin.Observable.create(observer => {
      const notification = this._atomNotification(level, text);

      return () => {
        notification.dismiss();
      };
    }) // Note: notification.onDidDismiss never fires for non-dismissable notifications!
    // However non-dismissable notifications have a fixed 5s duration:
    // https://github.com/atom/notifications/blob/master/lib/notification-element.coffee#L50
    .takeUntil(_RxMin.Observable.timer(5000)).publish();
  }

  dialogRequest(level, text, buttonLabels, closeLabel) {
    // We return a ConnectedObservable such that
    // (1) when code connects to it then we display the dialog
    // (2) if user clicks a button then we do next(buttonLabel); complete()
    // (3) if user clicks Close then we do next(closeLabel); complete();
    // (4) if code unsubscribed before that then we dismiss the dialog.
    return _RxMin.Observable.create(observer => {
      let result = closeLabel;

      const notification = this._atomNotification(level, text, {
        dismissable: true,
        // dialog will stay up until user dismisses it
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
    return (0, _textEdit().applyTextEditsForMultipleFiles)(changes);
  }

  _getBusySignalService() {
    // TODO(ljw): if the busy-signal-package has been disabled before this
    // this function is called, we'll return a promise that never completes.
    if (this._busySignalServicePromise == null) {
      this._busySignalServicePromise = new Promise((resolve, reject) => {
        atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0', service => {
          // When the package is provided to us, resolve the promise
          resolve(service); // When the package becomes unavailable to us, put in a null promise

          return new (_UniversalDisposable().default)(() => {
            this._busySignalServicePromise = Promise.resolve(null);
          });
        });
      });
    }

    return this._busySignalServicePromise;
  }

  async showProgress(title, options) {
    const service = await this._getBusySignalService();
    const busyMessage = service == null ? this._nullProgressMessage : service.reportBusy(title, Object.assign({}, options)); // The BusyMessage type from atom-ide-busy-signal happens to satisfy the
    // nuclide-rpc-able interface 'Progress': thus, we can return it directly.

    return busyMessage;
  }

  showActionRequired(title, options) {
    return _RxMin.Observable.defer(() => this._getBusySignalService()).switchMap(service => {
      return _RxMin.Observable.create(observer => {
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
    return this; // Root only ever has exactly one child, the RootAggregator,
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
  } // Returns false if there is no such registered command on the active text
  // editor. Otherwise returns true and dispatches the command.


  async dispatchCommand(command, params) {
    const textEditor = atom.workspace.getActiveTextEditor();
    const target = textEditor != null ? textEditor.getElement() : null;

    if (target == null) {
      return false;
    }

    const commands = atom.commands.findCommands({
      target
    });

    if (commands.find(c => c.name === command) == null) {
      return false;
    } // The LSPLanguageService forwards the args directly from the language server
    // and so all the URIs in the args are local to the remote server. Pass in
    // the hostname here so that we can easily resolve the URIs on the client side.


    atom.commands.dispatch(target, command, {
      hostname: _nuclideUri().default.isRemote(params.projectRoot) ? _nuclideUri().default.getHostname(params.projectRoot) : null,
      args: params.args
    });
    return true;
  }

}