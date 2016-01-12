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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VMb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFXNkIsZUFBZTs7b0JBQ3RCLE1BQU07O0FBVzVCLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDOztJQUVuQixhQUFhO0FBSXJCLFdBSlEsYUFBYSxHQUlsQjswQkFKSyxhQUFhOztBQUs5QixRQUFJLENBQUMsT0FBTyxHQUFHLDRCQUFtQixLQUFLLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsUUFBUSxHQUFHLG1CQUFhLENBQUM7R0FDL0I7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFQa0IsYUFBYTs7V0FTbEIsd0JBQ1osT0FBZSxFQUNmLE1BQWMsRUFDZCxPQUFnQixFQUVWO3dDQURILElBQUk7QUFBSixZQUFJOzs7QUFFUCxVQUFNLElBQVUsR0FBRztBQUNqQixZQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDaEIsZUFBTyxFQUFQLE9BQU87QUFDUCxjQUFNLEVBQU4sTUFBTTtBQUNOLGVBQU8sRUFBUCxPQUFPO0FBQ1AsWUFBSSxFQUFKLElBQUk7QUFDSixlQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDO09BQzlDLENBQUM7QUFDRixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDMUM7Ozs7U0FHQSxNQUFNLENBQUMsUUFBUTtXQUFDLGlCQUFtQjtBQUNsQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7S0FDeEM7OztXQUVRLG1CQUFDLFFBQStCLEVBQW1CO0FBQzFELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDekI7OztTQXRDa0IsYUFBYTs7O3FCQUFiLGFBQWE7QUFzRGxDLFNBQVMsYUFBYSxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsSUFBZ0IsRUFBVztBQUNqRixNQUFJLE9BQU8sS0FBSyxxQkFBcUIsRUFBRTs7QUFFckMsMEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7TUFBQztHQUMvQixNQUFNLElBQUksT0FBTyxLQUFLLFdBQVcsRUFBRTtBQUNsQyxRQUFJLE1BQU0sS0FBSyxvQkFBb0IsRUFBRTtBQUNuQyw0QkFBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUFDO0tBQy9CO0dBQ0YsTUFBTSxJQUFJLE9BQU8sS0FBSyxhQUFhLEVBQUU7QUFDcEMsUUFBSSxNQUFNLEtBQUssZ0JBQWdCLEVBQUU7QUFDL0IsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQixNQUFNLElBQUksTUFBTSxLQUFLLGlCQUFpQixFQUFFO0FBQ3ZDLDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0IsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQixNQUFNLElBQUksTUFBTSxLQUFLLDRCQUE0QixFQUFFO0FBQ2xELDRCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUM7S0FDL0I7R0FDRixNQUFNLElBQUksT0FBTyxLQUFLLFdBQVcsRUFBRTtBQUNsQyxRQUFJLE1BQU0sS0FBSyxlQUFlLEVBQUU7QUFDOUIsNEJBQXNCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFBQztLQUMvQixNQUFNLElBQUksTUFBTSxLQUFLLGVBQWUsRUFBRTtBQUNyQyxVQUFNLFNBQXdCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGFBQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM1QjtHQUNGO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJTZXJ2aWNlTG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDaXJjdWxhckJ1ZmZlcn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgdHlwZSBJdGVtID0ge1xuICBkYXRlOiBEYXRlLFxuICBzZXJ2aWNlOiBzdHJpbmcsXG4gIG1ldGhvZDogc3RyaW5nLFxuICBpc0xvY2FsOiBib29sZWFuLFxuICBhcmdzOiBBcnJheTxtaXhlZD4sXG4gIGFyZ0luZm86ID9zdHJpbmcsXG59XG5cbmNvbnN0IE5FV19JVEVNX0VWRU5UID0gJ05FV19JVEVNX0VWRU5UJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmljZUxvZ2dlciB7XG4gIF9idWZmZXI6IENpcmN1bGFyQnVmZmVyPEl0ZW0+O1xuICBfZW1pdHRlcjogRW1pdHRlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9idWZmZXIgPSBuZXcgQ2lyY3VsYXJCdWZmZXIoMTAwMDApO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICB9XG5cbiAgbG9nU2VydmljZUNhbGwoXG4gICAgc2VydmljZTogc3RyaW5nLFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIGlzTG9jYWw6IGJvb2xlYW4sXG4gICAgLi4uYXJnczogQXJyYXk8bWl4ZWQ+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSB7XG4gICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgc2VydmljZSxcbiAgICAgIG1ldGhvZCxcbiAgICAgIGlzTG9jYWwsXG4gICAgICBhcmdzLFxuICAgICAgYXJnSW5mbzogY3JlYXRlQXJnSW5mbyhzZXJ2aWNlLCBtZXRob2QsIGFyZ3MpLFxuICAgIH07XG4gICAgdGhpcy5fYnVmZmVyLnB1c2goaXRlbSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KE5FV19JVEVNX0VWRU5ULCBpdGVtKTtcbiAgfVxuXG4gIC8vICRGbG93SXNzdWU6IHQ2MTg3MDUwXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPEl0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIG9uTmV3SXRlbShjYWxsYmFjazogKGl0ZW06IEl0ZW0pID0+IG1peGVkKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihORVdfSVRFTV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRISVMgSVMgQSBIQUNLLlxuICpcbiAqIFRha2VzIHRoZSBpbmZvIGZvciBhIHNlcnZpY2UgY2FsbCBhbmQgcmV0dXJucyBhIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgcmVsZXZhbnQgYXJndW1lbnRzLlxuICpcbiAqIEZvciBub3csIHdlIGNlbnRyYWxpemUgc29tZSBsb2dpYyBhYm91dCBob3cgcGFydGljdWxhciBzZXJ2aWNlIGNhbGxzIHNob3VsZCBiZSBmb3JtYXR0ZWQgZm9yXG4gKiBkaXNwbGF5IGluIGxvZyBtZXNzYWdlcyBhbmQgdGhlIE51Y2xpZGUgU2VydmljZSBNb25pdG9yLiBSYXRoZXIgdGhhbiBhbm5vdGF0ZSB3aGljaCBhcmd1bWVudHNcbiAqIGluIGEgc2VydmljZSBjYWxsIHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGUgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBhcmdzICh0aGF0IGFyZSB1c2VkIGZvclxuICogZGVidWdnaW5nKSwgd2UgdGFrZSBhIHNob3J0Y3V0IGFuZCBqdXN0IGhhcmRjb2RlIHRoZSBsb2dpYyBmb3IgZWFjaCBzZXJ2aWNlIGNhbGwgb2YgaW50ZXJlc3QsXG4gKiBmb3Igbm93LiBJdCdzIG5vdCBzbWFydCB0byBjaG9vc2UgYSBuYWl2ZSBoZXVyaXN0aWMgbGlrZSBcImxvZyBhbGwgc3RyaW5nIGFyZ3VtZW50c1wiIGJlY2F1c2VcbiAqIHNlcnZpY2VzIHN1Y2ggYXMgRmxvdyB0YWtlIHRoZSB1bnNhdmVkIGZpbGUgY29udGVudHMgYXMgYW4gYXJndW1lbnQsIHdoaWNoIHdvdWxkIGNsdXR0ZXIgb3VyXG4gKiBsb2dzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBcmdJbmZvKHNlcnZpY2U6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4pOiA/c3RyaW5nIHtcbiAgaWYgKHNlcnZpY2UgPT09ICdBcmNhbmlzdEJhc2VTZXJ2aWNlJykge1xuICAgIC8vIEFsbCBBcmNhbmlzdCBzZXJ2aWNlcyB0YWtlIGEgZmlsZS5cbiAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgfSBlbHNlIGlmIChzZXJ2aWNlID09PSAnQnVja1V0aWxzJykge1xuICAgIGlmIChtZXRob2QgPT09ICdnZXRCdWNrUHJvamVjdFJvb3QnKSB7XG4gICAgICByZXR1cm4gLyogZmlsZU5hbWUgKi8gYXJnc1swXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoc2VydmljZSA9PT0gJ0Zsb3dTZXJ2aWNlJykge1xuICAgIGlmIChtZXRob2QgPT09ICdmaW5kRGVmaW5pdGlvbicpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnZmluZERpYWdub3N0aWNzJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdnZXRUeXBlJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdnZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucycpIHtcbiAgICAgIHJldHVybiAvKiBmaWxlTmFtZSAqLyBhcmdzWzBdO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzZXJ2aWNlID09PSAnSGdTZXJ2aWNlJykge1xuICAgIGlmIChtZXRob2QgPT09ICdmZXRjaERpZmZJbmZvJykge1xuICAgICAgcmV0dXJuIC8qIGZpbGVOYW1lICovIGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdmZXRjaFN0YXR1c2VzJykge1xuICAgICAgY29uc3QgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+ID0gYXJnc1swXTtcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuam9pbignOycpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==