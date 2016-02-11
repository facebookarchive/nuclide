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

var _commons = require('../../commons');

var _atom = require('atom');

var NEW_ITEM_EVENT = 'NEW_ITEM_EVENT';

var ServiceLogger = (function () {
  function ServiceLogger() {
    _classCallCheck(this, ServiceLogger);

    this._buffer = new _commons.CircularBuffer(10000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VMb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFXNkIsZUFBZTs7b0JBQ3RCLE1BQU07O0FBVzVCLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDOztJQUVuQixhQUFhO0FBSXJCLFdBSlEsYUFBYSxHQUlsQjswQkFKSyxhQUFhOztBQUs5QixRQUFJLENBQUMsT0FBTyxHQUFHLDRCQUFtQixLQUFLLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsUUFBUSxHQUFHLG1CQUFhLENBQUM7R0FDL0I7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFQa0IsYUFBYTs7V0FTbEIsd0JBQ1osT0FBZSxFQUNmLE1BQWMsRUFDZCxPQUFnQixFQUVWO3dDQURILElBQUk7QUFBSixZQUFJOzs7QUFFUCxVQUFNLElBQVUsR0FBRztBQUNqQixZQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDaEIsZUFBTyxFQUFQLE9BQU87QUFDUCxjQUFNLEVBQU4sTUFBTTtBQUNOLGVBQU8sRUFBUCxPQUFPO0FBQ1AsWUFBSSxFQUFKLElBQUk7QUFDSixlQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDO09BQzlDLENBQUM7QUFDRixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDMUM7Ozs7U0FHQSxNQUFNLENBQUMsUUFBUTtXQUFDLGlCQUFtQjtBQUNsQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7S0FDeEM7OztXQUVRLG1CQUFDLFFBQStCLEVBQWU7QUFDdEQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDbkQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6Qjs7O1NBdENrQixhQUFhOzs7cUJBQWIsYUFBYTtBQXNEbEMsU0FBUyxhQUFhLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxJQUFnQixFQUFXO0FBQ2pGLE1BQUksT0FBTyxLQUFLLHFCQUFxQixFQUFFOztBQUVyQywwQkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUFDO0dBQy9CLE1BQU0sSUFBSSxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2xDLFFBQUksTUFBTSxLQUFLLG9CQUFvQixFQUFFO0FBQ25DLDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0I7R0FDRixNQUFNLElBQUksT0FBTyxLQUFLLGFBQWEsRUFBRTtBQUNwQyxRQUFJLE1BQU0sS0FBSyxnQkFBZ0IsRUFBRTtBQUMvQiw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CLE1BQU0sSUFBSSxNQUFNLEtBQUssaUJBQWlCLEVBQUU7QUFDdkMsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQixNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQiw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CLE1BQU0sSUFBSSxNQUFNLEtBQUssNEJBQTRCLEVBQUU7QUFDbEQsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQjtHQUNGLE1BQU0sSUFBSSxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2xDLFFBQUksTUFBTSxLQUFLLGVBQWUsRUFBRTtBQUM5Qiw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CLE1BQU0sSUFBSSxNQUFNLEtBQUssZUFBZSxFQUFFO0FBQ3JDLFVBQU0sU0FBd0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsYUFBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzVCO0dBQ0Y7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiIiwiZmlsZSI6IlNlcnZpY2VMb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NpcmN1bGFyQnVmZmVyfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCB0eXBlIEl0ZW0gPSB7XG4gIGRhdGU6IERhdGUsXG4gIHNlcnZpY2U6IHN0cmluZyxcbiAgbWV0aG9kOiBzdHJpbmcsXG4gIGlzTG9jYWw6IGJvb2xlYW4sXG4gIGFyZ3M6IEFycmF5PG1peGVkPixcbiAgYXJnSW5mbzogP3N0cmluZyxcbn1cblxuY29uc3QgTkVXX0lURU1fRVZFTlQgPSAnTkVXX0lURU1fRVZFTlQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2aWNlTG9nZ2VyIHtcbiAgX2J1ZmZlcjogQ2lyY3VsYXJCdWZmZXI8SXRlbT47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2J1ZmZlciA9IG5ldyBDaXJjdWxhckJ1ZmZlcigxMDAwMCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gIH1cblxuICBsb2dTZXJ2aWNlQ2FsbChcbiAgICBzZXJ2aWNlOiBzdHJpbmcsXG4gICAgbWV0aG9kOiBzdHJpbmcsXG4gICAgaXNMb2NhbDogYm9vbGVhbixcbiAgICAuLi5hcmdzOiBBcnJheTxtaXhlZD5cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbTogSXRlbSA9IHtcbiAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICBzZXJ2aWNlLFxuICAgICAgbWV0aG9kLFxuICAgICAgaXNMb2NhbCxcbiAgICAgIGFyZ3MsXG4gICAgICBhcmdJbmZvOiBjcmVhdGVBcmdJbmZvKHNlcnZpY2UsIG1ldGhvZCwgYXJncyksXG4gICAgfTtcbiAgICB0aGlzLl9idWZmZXIucHVzaChpdGVtKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoTkVXX0lURU1fRVZFTlQsIGl0ZW0pO1xuICB9XG5cbiAgLy8gJEZsb3dJc3N1ZTogdDYxODcwNTBcbiAgW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmF0b3I8SXRlbT4ge1xuICAgIHJldHVybiB0aGlzLl9idWZmZXJbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICB9XG5cbiAgb25OZXdJdGVtKGNhbGxiYWNrOiAoaXRlbTogSXRlbSkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oTkVXX0lURU1fRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUSElTIElTIEEgSEFDSy5cbiAqXG4gKiBUYWtlcyB0aGUgaW5mbyBmb3IgYSBzZXJ2aWNlIGNhbGwgYW5kIHJldHVybnMgYSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIHJlbGV2YW50IGFyZ3VtZW50cy5cbiAqXG4gKiBGb3Igbm93LCB3ZSBjZW50cmFsaXplIHNvbWUgbG9naWMgYWJvdXQgaG93IHBhcnRpY3VsYXIgc2VydmljZSBjYWxscyBzaG91bGQgYmUgZm9ybWF0dGVkIGZvclxuICogZGlzcGxheSBpbiBsb2cgbWVzc2FnZXMgYW5kIHRoZSBOdWNsaWRlIFNlcnZpY2UgTW9uaXRvci4gUmF0aGVyIHRoYW4gYW5ub3RhdGUgd2hpY2ggYXJndW1lbnRzXG4gKiBpbiBhIHNlcnZpY2UgY2FsbCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlIHNlcmlhbGl6ZWQgdmVyc2lvbiBvZiB0aGUgYXJncyAodGhhdCBhcmUgdXNlZCBmb3JcbiAqIGRlYnVnZ2luZyksIHdlIHRha2UgYSBzaG9ydGN1dCBhbmQganVzdCBoYXJkY29kZSB0aGUgbG9naWMgZm9yIGVhY2ggc2VydmljZSBjYWxsIG9mIGludGVyZXN0LFxuICogZm9yIG5vdy4gSXQncyBub3Qgc21hcnQgdG8gY2hvb3NlIGEgbmFpdmUgaGV1cmlzdGljIGxpa2UgXCJsb2cgYWxsIHN0cmluZyBhcmd1bWVudHNcIiBiZWNhdXNlXG4gKiBzZXJ2aWNlcyBzdWNoIGFzIEZsb3cgdGFrZSB0aGUgdW5zYXZlZCBmaWxlIGNvbnRlbnRzIGFzIGFuIGFyZ3VtZW50LCB3aGljaCB3b3VsZCBjbHV0dGVyIG91clxuICogbG9ncy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXJnSW5mbyhzZXJ2aWNlOiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+KTogP3N0cmluZyB7XG4gIGlmIChzZXJ2aWNlID09PSAnQXJjYW5pc3RCYXNlU2VydmljZScpIHtcbiAgICAvLyBBbGwgQXJjYW5pc3Qgc2VydmljZXMgdGFrZSBhIGZpbGUuXG4gICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gIH0gZWxzZSBpZiAoc2VydmljZSA9PT0gJ0J1Y2tVdGlscycpIHtcbiAgICBpZiAobWV0aG9kID09PSAnZ2V0QnVja1Byb2plY3RSb290Jykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfVxuICB9IGVsc2UgaWYgKHNlcnZpY2UgPT09ICdGbG93U2VydmljZScpIHtcbiAgICBpZiAobWV0aG9kID09PSAnZmluZERlZmluaXRpb24nKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gJ2ZpbmREaWFnbm9zdGljcycpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnZ2V0VHlwZScpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnZ2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMnKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoc2VydmljZSA9PT0gJ0hnU2VydmljZScpIHtcbiAgICBpZiAobWV0aG9kID09PSAnZmV0Y2hEaWZmSW5mbycpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnZmV0Y2hTdGF0dXNlcycpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPiA9IGFyZ3NbMF07XG4gICAgICByZXR1cm4gZmlsZVBhdGhzLmpvaW4oJzsnKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=