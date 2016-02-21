var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../../commons');

var array = _require.array;

var RemoteControlService = (function () {

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */

  function RemoteControlService(getModel) {
    _classCallCheck(this, RemoteControlService);

    this._getModel = getModel;
  }

  _createClass(RemoteControlService, [{
    key: 'debugLLDB',
    value: function debugLLDB(pid, basepath) {
      // Nullable values are captured as nullable in lambdas, as they may change
      // between lambda capture and lambda evaluation. Assigning to a
      // non-nullable value after checking placates flow in this regard.
      var modelNullable = this._getModel();
      if (!modelNullable) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      var model = modelNullable;
      return model.getStore().getProcessInfoList('lldb').then(function (processes) {
        var process = array.find(processes, function (p) {
          return p.pid === pid;
        });
        if (process) {
          process.basepath = basepath;
          model.getActions().startDebugging(process);
        } else {
          throw new Error('Requested process not found: ' + pid + '.');
        }
      });
    }
  }, {
    key: 'debugHhvm',
    value: function debugHhvm(processInfo) {
      var modelNullable = this._getModel();
      if (!modelNullable) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      var model = modelNullable;
      return model.getActions().startDebugging(processInfo);
    }
  }, {
    key: 'debugNode',
    value: function debugNode(pid) {
      var model = this._getModel();
      if (!model) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      return model.getStore().getProcessInfoList('node').then(function (processes) {
        var proc = array.find(processes, function (p) {
          return p.pid === pid;
        });
        if (proc) {
          model.getActions().startDebugging(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
    }
  }, {
    key: 'startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      var model = this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      model.getActions().startDebugging(processInfo);
    })
  }]);

  return RemoteControlService;
})();

module.exports = RemoteControlService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQzs7SUFBcEMsS0FBSyxZQUFMLEtBQUs7O0lBSU4sb0JBQW9COzs7Ozs7Ozs7OztBQVdiLFdBWFAsb0JBQW9CLENBV1osUUFBOEIsRUFBRTswQkFYeEMsb0JBQW9COztBQVl0QixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztHQUMzQjs7ZUFiRyxvQkFBb0I7O1dBZWYsbUJBQUMsR0FBVyxFQUFFLFFBQWdCLEVBQWlCOzs7O0FBSXRELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQzFELFlBQUksT0FBTyxFQUFFO0FBQ1gsaUJBQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzVCLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUMsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxtQ0FBaUMsR0FBRyxPQUFJLENBQUM7U0FDekQ7T0FDRixDQUFDLENBQUM7S0FDTjs7O1dBRVEsbUJBQUMsV0FBZ0MsRUFBaUI7QUFDekQsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxhQUFhLEVBQUU7QUFDbEIsZUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztPQUMvRDtBQUNELFVBQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQztBQUM1QixhQUFPLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdkQ7OztXQUVRLG1CQUFDLEdBQVcsRUFBaUI7QUFDcEMsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixlQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQ3ZELFlBQUksSUFBSSxFQUFFO0FBQ1IsZUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QyxNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3QztPQUNGLENBQUMsQ0FBQztLQUNOOzs7NkJBRW1CLFdBQUMsV0FBZ0MsRUFBaUI7QUFDcEUsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQy9CLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixjQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7T0FDOUM7QUFDRCxXQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hEOzs7U0FuRUcsb0JBQW9COzs7QUF1RTFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoiUmVtb3RlQ29udHJvbFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuXG5jbGFzcyBSZW1vdGVDb250cm9sU2VydmljZSB7XG4gIF9nZXRNb2RlbDogKCkgPT4gP0RlYnVnZ2VyTW9kZWw7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBnZXRNb2RlbCBmdW5jdGlvbiBhbHdheXMgcmV0dXJuaW5nIHRoZSBsYXRlc3Qgc2luZ2xldG9uIG1vZGVsLlxuICAgKlxuICAgKiBOQjogRGVhY3RpdmF0aW5nIGFuZCByZWFjdGl2YXRpbmcgd2lsbCByZXN1bHQgaW4gYSBuZXcgTW9kZWwgaW5zdGFuY2UgKGFuZFxuICAgKiBuZXcgaW5zdGFuY2VzIG9mIGV2ZXJ5dGhpbmcgZWxzZSkuIFRoaXMgb2JqZWN0IGV4aXN0cyBpbiBvdGhlciBwYWNrYWdlc1xuICAgKiBvdXRzaWRlIG9mIGFueSBtb2RlbCwgc28gb2JqZWN0cyB2ZW5kZWQgZWFybHkgbXVzdCBzdGlsbCBhbHdheXMgbWFuaXB1bGF0ZVxuICAgKiB0aGUgbGF0ZXN0IG1vZGVsJ3Mgc3RhdGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihnZXRNb2RlbDogKCkgPT4gP0RlYnVnZ2VyTW9kZWwpIHtcbiAgICB0aGlzLl9nZXRNb2RlbCA9IGdldE1vZGVsO1xuICB9XG5cbiAgZGVidWdMTERCKHBpZDogbnVtYmVyLCBiYXNlcGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gTnVsbGFibGUgdmFsdWVzIGFyZSBjYXB0dXJlZCBhcyBudWxsYWJsZSBpbiBsYW1iZGFzLCBhcyB0aGV5IG1heSBjaGFuZ2VcbiAgICAvLyBiZXR3ZWVuIGxhbWJkYSBjYXB0dXJlIGFuZCBsYW1iZGEgZXZhbHVhdGlvbi4gQXNzaWduaW5nIHRvIGFcbiAgICAvLyBub24tbnVsbGFibGUgdmFsdWUgYWZ0ZXIgY2hlY2tpbmcgcGxhY2F0ZXMgZmxvdyBpbiB0aGlzIHJlZ2FyZC5cbiAgICBjb25zdCBtb2RlbE51bGxhYmxlID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAoIW1vZGVsTnVsbGFibGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIGNvbnN0IG1vZGVsID0gbW9kZWxOdWxsYWJsZTtcbiAgICByZXR1cm4gbW9kZWwuZ2V0U3RvcmUoKS5nZXRQcm9jZXNzSW5mb0xpc3QoJ2xsZGInKVxuICAgICAgLnRoZW4ocHJvY2Vzc2VzID0+IHtcbiAgICAgICAgY29uc3QgcHJvY2VzcyA9IGFycmF5LmZpbmQocHJvY2Vzc2VzLCBwID0+IHAucGlkID09PSBwaWQpO1xuICAgICAgICBpZiAocHJvY2Vzcykge1xuICAgICAgICAgIHByb2Nlc3MuYmFzZXBhdGggPSBiYXNlcGF0aDtcbiAgICAgICAgICBtb2RlbC5nZXRBY3Rpb25zKCkuc3RhcnREZWJ1Z2dpbmcocHJvY2Vzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1ZXN0ZWQgcHJvY2VzcyBub3QgZm91bmQ6ICR7cGlkfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBkZWJ1Z0hodm0ocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtb2RlbE51bGxhYmxlID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAoIW1vZGVsTnVsbGFibGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIGNvbnN0IG1vZGVsID0gbW9kZWxOdWxsYWJsZTtcbiAgICByZXR1cm4gbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxuXG4gIGRlYnVnTm9kZShwaWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJykpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kZWwuZ2V0U3RvcmUoKS5nZXRQcm9jZXNzSW5mb0xpc3QoJ25vZGUnKVxuICAgICAgLnRoZW4ocHJvY2Vzc2VzID0+IHtcbiAgICAgICAgY29uc3QgcHJvYyA9IGFycmF5LmZpbmQocHJvY2Vzc2VzLCBwID0+IHAucGlkID09PSBwaWQpO1xuICAgICAgICBpZiAocHJvYykge1xuICAgICAgICAgIG1vZGVsLmdldEFjdGlvbnMoKS5zdGFydERlYnVnZ2luZyhwcm9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlamVjdCgnTm8gbm9kZSBwcm9jZXNzIHRvIGRlYnVnLicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmIChtb2RlbCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKTtcbiAgICB9XG4gICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlQ29udHJvbFNlcnZpY2U7XG4iXX0=