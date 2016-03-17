Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _atom = require('atom');

var NEW_ITEM_EVENT = 'NEW_ITEM_EVENT';

var ServiceLogger = (function () {
  function ServiceLogger() {
    _classCallCheck(this, ServiceLogger);

    this._buffer = new _nuclideCommons.CircularBuffer(10000);
    this._emitter = new _atom.Emitter();
  }

  /**
   * THIS IS A HACK.
   *
   * Takes the info for a service call and returns a string description of the relevant arguments.
   *
   * For now, we centralize some logic about how particular service calls should be formatted for
   * display in log messages and the Nuclide Service Monitor. Rather than annotate which arguments
   * in a service call should be included in the serialized version of the args (that are used for
   * debugging), we take a shortcut and just hardcode the logic for each service call of interest,
   * for now. It's not smart to choose a naive heuristic like "log all string arguments" because
   * services such as Flow take the unsaved file contents as an argument, which would clutter our
   * logs.
   */

  _createClass(ServiceLogger, [{
    key: 'logServiceCall',
    value: function logServiceCall(service, method, isLocal) {
      for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        args[_key - 3] = arguments[_key];
      }

      var item = {
        date: new Date(),
        service: service,
        method: method,
        isLocal: isLocal,
        args: args,
        argInfo: createArgInfo(service, method, args)
      };
      this._buffer.push(item);
      this._emitter.emit(NEW_ITEM_EVENT, item);
    }

    // $FlowIssue: t6187050
  }, {
    key: Symbol.iterator,
    value: function value() {
      return this._buffer[Symbol.iterator]();
    }
  }, {
    key: 'onNewItem',
    value: function onNewItem(callback) {
      return this._emitter.on(NEW_ITEM_EVENT, callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }]);

  return ServiceLogger;
})();

exports['default'] = ServiceLogger;
function createArgInfo(service, method, args) {
  if (service === 'ArcanistBaseService') {
    // All Arcanist services take a file.
    return (/* fileName */args[0]
    );
  } else if (service === 'BuckUtils') {
    if (method === 'getBuckProjectRoot') {
      return (/* fileName */args[0]
      );
    }
  } else if (service === 'FlowService') {
    if (method === 'findDefinition') {
      return (/* fileName */args[0]
      );
    } else if (method === 'findDiagnostics') {
      return (/* fileName */args[0]
      );
    } else if (method === 'getType') {
      return (/* fileName */args[0]
      );
    } else if (method === 'getAutocompleteSuggestions') {
      return (/* fileName */args[0]
      );
    }
  } else if (service === 'HgService') {
    if (method === 'fetchDiffInfo') {
      return (/* fileName */args[0]
      );
    } else if (method === 'fetchStatuses') {
      var filePaths = args[0];
      return filePaths.join(';');
    }
  }
  return null;
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiU2VydmljZUxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q2lyY3VsYXJCdWZmZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgdHlwZSBJdGVtID0ge1xuICBkYXRlOiBEYXRlO1xuICBzZXJ2aWNlOiBzdHJpbmc7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBpc0xvY2FsOiBib29sZWFuO1xuICBhcmdzOiBBcnJheTxtaXhlZD47XG4gIGFyZ0luZm86ID9zdHJpbmc7XG59XG5cbmNvbnN0IE5FV19JVEVNX0VWRU5UID0gJ05FV19JVEVNX0VWRU5UJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmljZUxvZ2dlciB7XG4gIF9idWZmZXI6IENpcmN1bGFyQnVmZmVyPEl0ZW0+O1xuICBfZW1pdHRlcjogRW1pdHRlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9idWZmZXIgPSBuZXcgQ2lyY3VsYXJCdWZmZXIoMTAwMDApO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICB9XG5cbiAgbG9nU2VydmljZUNhbGwoXG4gICAgc2VydmljZTogc3RyaW5nLFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIGlzTG9jYWw6IGJvb2xlYW4sXG4gICAgLi4uYXJnczogQXJyYXk8bWl4ZWQ+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSB7XG4gICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgc2VydmljZSxcbiAgICAgIG1ldGhvZCxcbiAgICAgIGlzTG9jYWwsXG4gICAgICBhcmdzLFxuICAgICAgYXJnSW5mbzogY3JlYXRlQXJnSW5mbyhzZXJ2aWNlLCBtZXRob2QsIGFyZ3MpLFxuICAgIH07XG4gICAgdGhpcy5fYnVmZmVyLnB1c2goaXRlbSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KE5FV19JVEVNX0VWRU5ULCBpdGVtKTtcbiAgfVxuXG4gIC8vICRGbG93SXNzdWU6IHQ2MTg3MDUwXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPEl0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIG9uTmV3SXRlbShjYWxsYmFjazogKGl0ZW06IEl0ZW0pID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKE5FV19JVEVNX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2VtaXR0ZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbi8qKlxuICogVEhJUyBJUyBBIEhBQ0suXG4gKlxuICogVGFrZXMgdGhlIGluZm8gZm9yIGEgc2VydmljZSBjYWxsIGFuZCByZXR1cm5zIGEgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSByZWxldmFudCBhcmd1bWVudHMuXG4gKlxuICogRm9yIG5vdywgd2UgY2VudHJhbGl6ZSBzb21lIGxvZ2ljIGFib3V0IGhvdyBwYXJ0aWN1bGFyIHNlcnZpY2UgY2FsbHMgc2hvdWxkIGJlIGZvcm1hdHRlZCBmb3JcbiAqIGRpc3BsYXkgaW4gbG9nIG1lc3NhZ2VzIGFuZCB0aGUgTnVjbGlkZSBTZXJ2aWNlIE1vbml0b3IuIFJhdGhlciB0aGFuIGFubm90YXRlIHdoaWNoIGFyZ3VtZW50c1xuICogaW4gYSBzZXJ2aWNlIGNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkIGluIHRoZSBzZXJpYWxpemVkIHZlcnNpb24gb2YgdGhlIGFyZ3MgKHRoYXQgYXJlIHVzZWQgZm9yXG4gKiBkZWJ1Z2dpbmcpLCB3ZSB0YWtlIGEgc2hvcnRjdXQgYW5kIGp1c3QgaGFyZGNvZGUgdGhlIGxvZ2ljIGZvciBlYWNoIHNlcnZpY2UgY2FsbCBvZiBpbnRlcmVzdCxcbiAqIGZvciBub3cuIEl0J3Mgbm90IHNtYXJ0IHRvIGNob29zZSBhIG5haXZlIGhldXJpc3RpYyBsaWtlIFwibG9nIGFsbCBzdHJpbmcgYXJndW1lbnRzXCIgYmVjYXVzZVxuICogc2VydmljZXMgc3VjaCBhcyBGbG93IHRha2UgdGhlIHVuc2F2ZWQgZmlsZSBjb250ZW50cyBhcyBhbiBhcmd1bWVudCwgd2hpY2ggd291bGQgY2x1dHRlciBvdXJcbiAqIGxvZ3MuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ0luZm8oc2VydmljZTogc3RyaW5nLCBtZXRob2Q6IHN0cmluZywgYXJnczogQXJyYXk8YW55Pik6ID9zdHJpbmcge1xuICBpZiAoc2VydmljZSA9PT0gJ0FyY2FuaXN0QmFzZVNlcnZpY2UnKSB7XG4gICAgLy8gQWxsIEFyY2FuaXN0IHNlcnZpY2VzIHRha2UgYSBmaWxlLlxuICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICB9IGVsc2UgaWYgKHNlcnZpY2UgPT09ICdCdWNrVXRpbHMnKSB7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2dldEJ1Y2tQcm9qZWN0Um9vdCcpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzZXJ2aWNlID09PSAnRmxvd1NlcnZpY2UnKSB7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2ZpbmREZWZpbml0aW9uJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdmaW5kRGlhZ25vc3RpY3MnKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gJ2dldFR5cGUnKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gJ2dldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfVxuICB9IGVsc2UgaWYgKHNlcnZpY2UgPT09ICdIZ1NlcnZpY2UnKSB7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2ZldGNoRGlmZkluZm8nKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gJ2ZldGNoU3RhdHVzZXMnKSB7XG4gICAgICBjb25zdCBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4gPSBhcmdzWzBdO1xuICAgICAgcmV0dXJuIGZpbGVQYXRocy5qb2luKCc7Jyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19