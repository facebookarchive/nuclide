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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VMb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFXNkIsdUJBQXVCOztvQkFDOUIsTUFBTTs7QUFXNUIsSUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7O0lBRW5CLGFBQWE7QUFJckIsV0FKUSxhQUFhLEdBSWxCOzBCQUpLLGFBQWE7O0FBSzlCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUNBQW1CLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQWEsQ0FBQztHQUMvQjs7Ozs7Ozs7Ozs7Ozs7OztlQVBrQixhQUFhOztXQVNsQix3QkFDWixPQUFlLEVBQ2YsTUFBYyxFQUNkLE9BQWdCLEVBRVY7d0NBREgsSUFBSTtBQUFKLFlBQUk7OztBQUVQLFVBQU0sSUFBVSxHQUFHO0FBQ2pCLFlBQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNoQixlQUFPLEVBQVAsT0FBTztBQUNQLGNBQU0sRUFBTixNQUFNO0FBQ04sZUFBTyxFQUFQLE9BQU87QUFDUCxZQUFJLEVBQUosSUFBSTtBQUNKLGVBQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7T0FDOUMsQ0FBQztBQUNGLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMxQzs7OztTQUdBLE1BQU0sQ0FBQyxRQUFRO1dBQUMsaUJBQW1CO0FBQ2xDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztLQUN4Qzs7O1dBRVEsbUJBQUMsUUFBK0IsRUFBZTtBQUN0RCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3pCOzs7U0F0Q2tCLGFBQWE7OztxQkFBYixhQUFhO0FBc0RsQyxTQUFTLGFBQWEsQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLElBQWdCLEVBQVc7QUFDakYsTUFBSSxPQUFPLEtBQUsscUJBQXFCLEVBQUU7O0FBRXJDLDBCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO01BQUM7R0FDL0IsTUFBTSxJQUFJLE9BQU8sS0FBSyxXQUFXLEVBQUU7QUFDbEMsUUFBSSxNQUFNLEtBQUssb0JBQW9CLEVBQUU7QUFDbkMsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQjtHQUNGLE1BQU0sSUFBSSxPQUFPLEtBQUssYUFBYSxFQUFFO0FBQ3BDLFFBQUksTUFBTSxLQUFLLGdCQUFnQixFQUFFO0FBQy9CLDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0IsTUFBTSxJQUFJLE1BQU0sS0FBSyxpQkFBaUIsRUFBRTtBQUN2Qyw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CLE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0IsTUFBTSxJQUFJLE1BQU0sS0FBSyw0QkFBNEIsRUFBRTtBQUNsRCw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CO0dBQ0YsTUFBTSxJQUFJLE9BQU8sS0FBSyxXQUFXLEVBQUU7QUFDbEMsUUFBSSxNQUFNLEtBQUssZUFBZSxFQUFFO0FBQzlCLDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0IsTUFBTSxJQUFJLE1BQU0sS0FBSyxlQUFlLEVBQUU7QUFDckMsVUFBTSxTQUF3QixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxhQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDNUI7R0FDRjtBQUNELFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiU2VydmljZUxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q2lyY3VsYXJCdWZmZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgdHlwZSBJdGVtID0ge1xuICBkYXRlOiBEYXRlO1xuICBzZXJ2aWNlOiBzdHJpbmc7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBpc0xvY2FsOiBib29sZWFuO1xuICBhcmdzOiBBcnJheTxtaXhlZD47XG4gIGFyZ0luZm86ID9zdHJpbmc7XG59O1xuXG5jb25zdCBORVdfSVRFTV9FVkVOVCA9ICdORVdfSVRFTV9FVkVOVCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZpY2VMb2dnZXIge1xuICBfYnVmZmVyOiBDaXJjdWxhckJ1ZmZlcjxJdGVtPjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fYnVmZmVyID0gbmV3IENpcmN1bGFyQnVmZmVyKDEwMDAwKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgfVxuXG4gIGxvZ1NlcnZpY2VDYWxsKFxuICAgIHNlcnZpY2U6IHN0cmluZyxcbiAgICBtZXRob2Q6IHN0cmluZyxcbiAgICBpc0xvY2FsOiBib29sZWFuLFxuICAgIC4uLmFyZ3M6IEFycmF5PG1peGVkPlxuICApOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtOiBJdGVtID0ge1xuICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgIHNlcnZpY2UsXG4gICAgICBtZXRob2QsXG4gICAgICBpc0xvY2FsLFxuICAgICAgYXJncyxcbiAgICAgIGFyZ0luZm86IGNyZWF0ZUFyZ0luZm8oc2VydmljZSwgbWV0aG9kLCBhcmdzKSxcbiAgICB9O1xuICAgIHRoaXMuX2J1ZmZlci5wdXNoKGl0ZW0pO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChORVdfSVRFTV9FVkVOVCwgaXRlbSk7XG4gIH1cblxuICAvLyAkRmxvd0lzc3VlOiB0NjE4NzA1MFxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1ZmZlcltTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH1cblxuICBvbk5ld0l0ZW0oY2FsbGJhY2s6IChpdGVtOiBJdGVtKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihORVdfSVRFTV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRISVMgSVMgQSBIQUNLLlxuICpcbiAqIFRha2VzIHRoZSBpbmZvIGZvciBhIHNlcnZpY2UgY2FsbCBhbmQgcmV0dXJucyBhIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgcmVsZXZhbnQgYXJndW1lbnRzLlxuICpcbiAqIEZvciBub3csIHdlIGNlbnRyYWxpemUgc29tZSBsb2dpYyBhYm91dCBob3cgcGFydGljdWxhciBzZXJ2aWNlIGNhbGxzIHNob3VsZCBiZSBmb3JtYXR0ZWQgZm9yXG4gKiBkaXNwbGF5IGluIGxvZyBtZXNzYWdlcyBhbmQgdGhlIE51Y2xpZGUgU2VydmljZSBNb25pdG9yLiBSYXRoZXIgdGhhbiBhbm5vdGF0ZSB3aGljaCBhcmd1bWVudHNcbiAqIGluIGEgc2VydmljZSBjYWxsIHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGUgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBhcmdzICh0aGF0IGFyZSB1c2VkIGZvclxuICogZGVidWdnaW5nKSwgd2UgdGFrZSBhIHNob3J0Y3V0IGFuZCBqdXN0IGhhcmRjb2RlIHRoZSBsb2dpYyBmb3IgZWFjaCBzZXJ2aWNlIGNhbGwgb2YgaW50ZXJlc3QsXG4gKiBmb3Igbm93LiBJdCdzIG5vdCBzbWFydCB0byBjaG9vc2UgYSBuYWl2ZSBoZXVyaXN0aWMgbGlrZSBcImxvZyBhbGwgc3RyaW5nIGFyZ3VtZW50c1wiIGJlY2F1c2VcbiAqIHNlcnZpY2VzIHN1Y2ggYXMgRmxvdyB0YWtlIHRoZSB1bnNhdmVkIGZpbGUgY29udGVudHMgYXMgYW4gYXJndW1lbnQsIHdoaWNoIHdvdWxkIGNsdXR0ZXIgb3VyXG4gKiBsb2dzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBcmdJbmZvKHNlcnZpY2U6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4pOiA/c3RyaW5nIHtcbiAgaWYgKHNlcnZpY2UgPT09ICdBcmNhbmlzdEJhc2VTZXJ2aWNlJykge1xuICAgIC8vIEFsbCBBcmNhbmlzdCBzZXJ2aWNlcyB0YWtlIGEgZmlsZS5cbiAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgfSBlbHNlIGlmIChzZXJ2aWNlID09PSAnQnVja1V0aWxzJykge1xuICAgIGlmIChtZXRob2QgPT09ICdnZXRCdWNrUHJvamVjdFJvb3QnKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoc2VydmljZSA9PT0gJ0Zsb3dTZXJ2aWNlJykge1xuICAgIGlmIChtZXRob2QgPT09ICdmaW5kRGVmaW5pdGlvbicpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnZmluZERpYWdub3N0aWNzJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdnZXRUeXBlJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdnZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucycpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzZXJ2aWNlID09PSAnSGdTZXJ2aWNlJykge1xuICAgIGlmIChtZXRob2QgPT09ICdmZXRjaERpZmZJbmZvJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdmZXRjaFN0YXR1c2VzJykge1xuICAgICAgY29uc3QgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+ID0gYXJnc1swXTtcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuam9pbignOycpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==