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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQzs7SUFBcEMsS0FBSyxZQUFMLEtBQUs7O0lBSU4sb0JBQW9COzs7Ozs7Ozs7OztBQVdiLFdBWFAsb0JBQW9CLENBV1osUUFBOEIsRUFBRTswQkFYeEMsb0JBQW9COztBQVl0QixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztHQUMzQjs7ZUFiRyxvQkFBb0I7O1dBZWYsbUJBQUMsR0FBVyxFQUFFLFFBQWdCLEVBQWlCOzs7O0FBSXRELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQzFELFlBQUksT0FBTyxFQUFFO0FBQ1gsaUJBQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzVCLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUMsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxtQ0FBaUMsR0FBRyxPQUFJLENBQUM7U0FDekQ7T0FDRixDQUFDLENBQUM7S0FDTjs7O1dBRVEsbUJBQUMsR0FBVyxFQUFpQjtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxhQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQ2pCLFlBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUEsQ0FBQztpQkFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUc7U0FBQSxDQUFDLENBQUM7QUFDdkQsWUFBSSxJQUFJLEVBQUU7QUFDUixlQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pDLE1BQU07QUFDTCxpQkFBTyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzdDO09BQ0YsQ0FBQyxDQUFDO0tBQ047Ozs2QkFFbUIsV0FBQyxXQUFnQyxFQUFpQjtBQUNwRSxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGNBQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztPQUM5QztBQUNELFdBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDaEQ7OztTQTFERyxvQkFBb0I7OztBQTZEMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyIsImZpbGUiOiJSZW1vdGVDb250cm9sU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHthcnJheX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJyk7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlck1vZGVsIGZyb20gJy4vRGVidWdnZXJNb2RlbCc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5cbmNsYXNzIFJlbW90ZUNvbnRyb2xTZXJ2aWNlIHtcbiAgX2dldE1vZGVsOiAoKSA9PiA/RGVidWdnZXJNb2RlbDtcblxuICAvKipcbiAgICogQHBhcmFtIGdldE1vZGVsIGZ1bmN0aW9uIGFsd2F5cyByZXR1cm5pbmcgdGhlIGxhdGVzdCBzaW5nbGV0b24gbW9kZWwuXG4gICAqXG4gICAqIE5COiBEZWFjdGl2YXRpbmcgYW5kIHJlYWN0aXZhdGluZyB3aWxsIHJlc3VsdCBpbiBhIG5ldyBNb2RlbCBpbnN0YW5jZSAoYW5kXG4gICAqIG5ldyBpbnN0YW5jZXMgb2YgZXZlcnl0aGluZyBlbHNlKS4gVGhpcyBvYmplY3QgZXhpc3RzIGluIG90aGVyIHBhY2thZ2VzXG4gICAqIG91dHNpZGUgb2YgYW55IG1vZGVsLCBzbyBvYmplY3RzIHZlbmRlZCBlYXJseSBtdXN0IHN0aWxsIGFsd2F5cyBtYW5pcHVsYXRlXG4gICAqIHRoZSBsYXRlc3QgbW9kZWwncyBzdGF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGdldE1vZGVsOiAoKSA9PiA/RGVidWdnZXJNb2RlbCkge1xuICAgIHRoaXMuX2dldE1vZGVsID0gZ2V0TW9kZWw7XG4gIH1cblxuICBkZWJ1Z0xMREIocGlkOiBudW1iZXIsIGJhc2VwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBOdWxsYWJsZSB2YWx1ZXMgYXJlIGNhcHR1cmVkIGFzIG51bGxhYmxlIGluIGxhbWJkYXMsIGFzIHRoZXkgbWF5IGNoYW5nZVxuICAgIC8vIGJldHdlZW4gbGFtYmRhIGNhcHR1cmUgYW5kIGxhbWJkYSBldmFsdWF0aW9uLiBBc3NpZ25pbmcgdG8gYVxuICAgIC8vIG5vbi1udWxsYWJsZSB2YWx1ZSBhZnRlciBjaGVja2luZyBwbGFjYXRlcyBmbG93IGluIHRoaXMgcmVnYXJkLlxuICAgIGNvbnN0IG1vZGVsTnVsbGFibGUgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWxOdWxsYWJsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpKTtcbiAgICB9XG4gICAgY29uc3QgbW9kZWwgPSBtb2RlbE51bGxhYmxlO1xuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnbGxkYicpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICBjb25zdCBwcm9jZXNzID0gYXJyYXkuZmluZChwcm9jZXNzZXMsIHAgPT4gcC5waWQgPT09IHBpZCk7XG4gICAgICAgIGlmIChwcm9jZXNzKSB7XG4gICAgICAgICAgcHJvY2Vzcy5iYXNlcGF0aCA9IGJhc2VwYXRoO1xuICAgICAgICAgIG1vZGVsLmdldEFjdGlvbnMoKS5zdGFydERlYnVnZ2luZyhwcm9jZXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3RlZCBwcm9jZXNzIG5vdCBmb3VuZDogJHtwaWR9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIGRlYnVnTm9kZShwaWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJykpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kZWwuZ2V0U3RvcmUoKS5nZXRQcm9jZXNzSW5mb0xpc3QoJ25vZGUnKVxuICAgICAgLnRoZW4ocHJvY2Vzc2VzID0+IHtcbiAgICAgICAgY29uc3QgcHJvYyA9IGFycmF5LmZpbmQocHJvY2Vzc2VzLCBwID0+IHAucGlkID09PSBwaWQpO1xuICAgICAgICBpZiAocHJvYykge1xuICAgICAgICAgIG1vZGVsLmdldEFjdGlvbnMoKS5zdGFydERlYnVnZ2luZyhwcm9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlamVjdCgnTm8gbm9kZSBwcm9jZXNzIHRvIGRlYnVnLicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmIChtb2RlbCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKTtcbiAgICB9XG4gICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZUNvbnRyb2xTZXJ2aWNlO1xuIl19