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

var _require = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBekMsS0FBSyxZQUFMLEtBQUs7O0lBSU4sb0JBQW9COzs7Ozs7Ozs7OztBQVdiLFdBWFAsb0JBQW9CLENBV1osUUFBOEIsRUFBRTswQkFYeEMsb0JBQW9COztBQVl0QixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztHQUMzQjs7ZUFiRyxvQkFBb0I7O1dBZWYsbUJBQUMsR0FBVyxFQUFFLFFBQWdCLEVBQWlCOzs7O0FBSXRELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQzFELFlBQUksT0FBTyxFQUFFO0FBQ1gsaUJBQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzVCLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUMsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxtQ0FBaUMsR0FBRyxPQUFJLENBQUM7U0FDekQ7T0FDRixDQUFDLENBQUM7S0FDTjs7O1dBRVEsbUJBQUMsR0FBVyxFQUFpQjtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxhQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQ2pCLFlBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUEsQ0FBQztpQkFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUc7U0FBQSxDQUFDLENBQUM7QUFDdkQsWUFBSSxJQUFJLEVBQUU7QUFDUixlQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pDLE1BQU07QUFDTCxpQkFBTyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzdDO09BQ0YsQ0FBQyxDQUFDO0tBQ047Ozs2QkFFbUIsV0FBQyxXQUFnQyxFQUFpQjtBQUNwRSxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGNBQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztPQUM5QztBQUNELFdBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDaEQ7OztTQTFERyxvQkFBb0I7OztBQTZEMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyIsImZpbGUiOiJSZW1vdGVDb250cm9sU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHthcnJheX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmltcG9ydCB0eXBlIERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcblxuY2xhc3MgUmVtb3RlQ29udHJvbFNlcnZpY2Uge1xuICBfZ2V0TW9kZWw6ICgpID0+ID9EZWJ1Z2dlck1vZGVsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ2V0TW9kZWwgZnVuY3Rpb24gYWx3YXlzIHJldHVybmluZyB0aGUgbGF0ZXN0IHNpbmdsZXRvbiBtb2RlbC5cbiAgICpcbiAgICogTkI6IERlYWN0aXZhdGluZyBhbmQgcmVhY3RpdmF0aW5nIHdpbGwgcmVzdWx0IGluIGEgbmV3IE1vZGVsIGluc3RhbmNlIChhbmRcbiAgICogbmV3IGluc3RhbmNlcyBvZiBldmVyeXRoaW5nIGVsc2UpLiBUaGlzIG9iamVjdCBleGlzdHMgaW4gb3RoZXIgcGFja2FnZXNcbiAgICogb3V0c2lkZSBvZiBhbnkgbW9kZWwsIHNvIG9iamVjdHMgdmVuZGVkIGVhcmx5IG11c3Qgc3RpbGwgYWx3YXlzIG1hbmlwdWxhdGVcbiAgICogdGhlIGxhdGVzdCBtb2RlbCdzIHN0YXRlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZ2V0TW9kZWw6ICgpID0+ID9EZWJ1Z2dlck1vZGVsKSB7XG4gICAgdGhpcy5fZ2V0TW9kZWwgPSBnZXRNb2RlbDtcbiAgfVxuXG4gIGRlYnVnTExEQihwaWQ6IG51bWJlciwgYmFzZXBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIE51bGxhYmxlIHZhbHVlcyBhcmUgY2FwdHVyZWQgYXMgbnVsbGFibGUgaW4gbGFtYmRhcywgYXMgdGhleSBtYXkgY2hhbmdlXG4gICAgLy8gYmV0d2VlbiBsYW1iZGEgY2FwdHVyZSBhbmQgbGFtYmRhIGV2YWx1YXRpb24uIEFzc2lnbmluZyB0byBhXG4gICAgLy8gbm9uLW51bGxhYmxlIHZhbHVlIGFmdGVyIGNoZWNraW5nIHBsYWNhdGVzIGZsb3cgaW4gdGhpcyByZWdhcmQuXG4gICAgY29uc3QgbW9kZWxOdWxsYWJsZSA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKCFtb2RlbE51bGxhYmxlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJykpO1xuICAgIH1cbiAgICBjb25zdCBtb2RlbCA9IG1vZGVsTnVsbGFibGU7XG4gICAgcmV0dXJuIG1vZGVsLmdldFN0b3JlKCkuZ2V0UHJvY2Vzc0luZm9MaXN0KCdsbGRiJylcbiAgICAgIC50aGVuKHByb2Nlc3NlcyA9PiB7XG4gICAgICAgIGNvbnN0IHByb2Nlc3MgPSBhcnJheS5maW5kKHByb2Nlc3NlcywgcCA9PiBwLnBpZCA9PT0gcGlkKTtcbiAgICAgICAgaWYgKHByb2Nlc3MpIHtcbiAgICAgICAgICBwcm9jZXNzLmJhc2VwYXRoID0gYmFzZXBhdGg7XG4gICAgICAgICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWVzdGVkIHByb2Nlc3Mgbm90IGZvdW5kOiAke3BpZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVidWdOb2RlKHBpZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnbm9kZScpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICBjb25zdCBwcm9jID0gYXJyYXkuZmluZChwcm9jZXNzZXMsIHAgPT4gcC5waWQgPT09IHBpZCk7XG4gICAgICAgIGlmIChwcm9jKSB7XG4gICAgICAgICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFByb21pc2UucmVqZWN0KCdObyBub2RlIHByb2Nlc3MgdG8gZGVidWcuJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKG1vZGVsID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpO1xuICAgIH1cbiAgICBtb2RlbC5nZXRBY3Rpb25zKCkuc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm8pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlQ29udHJvbFNlcnZpY2U7XG4iXX0=