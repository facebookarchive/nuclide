Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _helpers = require('./helpers');

var _Handler2 = require('./Handler');

var _Handler3 = _interopRequireDefault(_Handler2);

var _utils = require('./utils');

// Handles all 'Runtime.*' Chrome dev tools messages

var RuntimeHandler = (function (_Handler) {
  _inherits(RuntimeHandler, _Handler);

  function RuntimeHandler(clientCallback, connectionMultiplexer) {
    _classCallCheck(this, RuntimeHandler);

    _get(Object.getPrototypeOf(RuntimeHandler.prototype), 'constructor', this).call(this, 'Runtime', clientCallback);
    this._connectionMultiplexer = connectionMultiplexer;
  }

  _createClass(RuntimeHandler, [{
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {
      switch (method) {
        case 'enable':
          this._notifyExecutionContext(id);
          break;

        case 'getProperties':
          yield this._getProperties(id, params);
          break;

        case 'evaluate':
          var compatParams = (0, _utils.makeExpressionHphpdCompatible)(params);

          // Chrome may call 'evaluate' for other purposes like auto-completion etc..
          // and we are only interested in console evaluation.
          if (compatParams.objectGroup === 'console') {
            yield this._evaluate(id, compatParams);
          } else {
            this.unknownMethod(id, method, compatParams);
          }
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }, {
    key: '_notifyExecutionContext',
    value: function _notifyExecutionContext(id) {
      this.sendMethod('Runtime.executionContextCreated', {
        'context': {
          'id': 1,
          'frameId': _helpers.DUMMY_FRAME_ID,
          'name': 'hhvm: TODO: mangle in pid, idekey, script from connection'
        }
      });
      this.replyToCommand(id, {});
    }
  }, {
    key: '_getProperties',
    value: _asyncToGenerator(function* (id, params) {
      // params also has properties:
      //    ownProperties
      //    generatePreview
      var objectId = params.objectId;
      var accessorPropertiesOnly = params.accessorPropertiesOnly;

      var result = undefined;
      if (!accessorPropertiesOnly) {
        result = yield this._connectionMultiplexer.getProperties(objectId);
      } else {
        // TODO: Handle remaining params
        result = [];
      }
      this.replyToCommand(id, { result: result });
    })
  }, {
    key: '_evaluate',
    value: _asyncToGenerator(function* (id, params) {
      var result = yield this._connectionMultiplexer.runtimeEvaluate(params.expression);
      this.replyToCommand(id, result);
    })
  }]);

  return RuntimeHandler;
})(_Handler3['default']);

exports.RuntimeHandler = RuntimeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJ1bnRpbWVIYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFZNkIsV0FBVzs7d0JBQ3BCLFdBQVc7Ozs7cUJBQ2EsU0FBUzs7OztJQU14QyxjQUFjO1lBQWQsY0FBYzs7QUFHZCxXQUhBLGNBQWMsQ0FJdkIsY0FBOEIsRUFDOUIscUJBQTRDLEVBQzVDOzBCQU5TLGNBQWM7O0FBT3ZCLCtCQVBTLGNBQWMsNkNBT2pCLFNBQVMsRUFBRSxjQUFjLEVBQUU7QUFDakMsUUFBSSxDQUFDLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDO0dBQ3JEOztlQVRVLGNBQWM7OzZCQVdQLFdBQUMsRUFBVSxFQUFFLE1BQWMsRUFBRSxNQUFjLEVBQVc7QUFDdEUsY0FBUSxNQUFNO0FBQ1osYUFBSyxRQUFRO0FBQ1gsY0FBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxlQUFlO0FBQ2xCLGdCQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxVQUFVO0FBQ2IsY0FBTSxZQUFZLEdBQUcsMENBQThCLE1BQU0sQ0FBQyxDQUFDOzs7O0FBSTNELGNBQUksWUFBWSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7QUFDMUMsa0JBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7V0FDeEMsTUFBTTtBQUNMLGdCQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7V0FDOUM7QUFDRCxnQkFBTTs7QUFBQSxBQUVSO0FBQ0UsY0FBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFNO0FBQUEsT0FDVDtLQUNGOzs7V0FFc0IsaUNBQUMsRUFBVSxFQUFRO0FBQ3hDLFVBQUksQ0FBQyxVQUFVLENBQUMsaUNBQWlDLEVBQy9DO0FBQ0UsaUJBQVMsRUFBRTtBQUNULGNBQUksRUFBRSxDQUFDO0FBQ1AsbUJBQVMseUJBQWdCO0FBQ3pCLGdCQUFNLEVBQUUsMkRBQTJEO1NBQ3BFO09BQ0YsQ0FBQyxDQUFDO0FBQ0wsVUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDN0I7Ozs2QkFFbUIsV0FBQyxFQUFVLEVBQUUsTUFBYyxFQUFXOzs7O1VBSWpELFFBQVEsR0FBNEIsTUFBTSxDQUExQyxRQUFRO1VBQUUsc0JBQXNCLEdBQUksTUFBTSxDQUFoQyxzQkFBc0I7O0FBQ3ZDLFVBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxVQUFJLENBQUMsc0JBQXNCLEVBQUU7QUFDM0IsY0FBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNwRSxNQUFNOztBQUVMLGNBQU0sR0FBRyxFQUFFLENBQUM7T0FDYjtBQUNELFVBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUM7S0FDbkM7Ozs2QkFFYyxXQUFDLEVBQVUsRUFBRSxNQUFjLEVBQVc7QUFDbkQsVUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwRixVQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNqQzs7O1NBckVVLGNBQWMiLCJmaWxlIjoiUnVudGltZUhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB7RFVNTVlfRlJBTUVfSUR9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuaW1wb3J0IHttYWtlRXhwcmVzc2lvbkhwaHBkQ29tcGF0aWJsZX0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB0eXBlIHtDb25uZWN0aW9uTXVsdGlwbGV4ZXJ9IGZyb20gJy4vQ29ubmVjdGlvbk11bHRpcGxleGVyJztcbmltcG9ydCB0eXBlIHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbi8vIEhhbmRsZXMgYWxsICdSdW50aW1lLionIENocm9tZSBkZXYgdG9vbHMgbWVzc2FnZXNcbmV4cG9ydCBjbGFzcyBSdW50aW1lSGFuZGxlciBleHRlbmRzIEhhbmRsZXIge1xuICBfY29ubmVjdGlvbk11bHRpcGxleGVyOiBDb25uZWN0aW9uTXVsdGlwbGV4ZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrLFxuICAgIGNvbm5lY3Rpb25NdWx0aXBsZXhlcjogQ29ubmVjdGlvbk11bHRpcGxleGVyXG4gICkge1xuICAgIHN1cGVyKCdSdW50aW1lJywgY2xpZW50Q2FsbGJhY2spO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlciA9IGNvbm5lY3Rpb25NdWx0aXBsZXhlcjtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgICAgY2FzZSAnZW5hYmxlJzpcbiAgICAgICAgdGhpcy5fbm90aWZ5RXhlY3V0aW9uQ29udGV4dChpZCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdnZXRQcm9wZXJ0aWVzJzpcbiAgICAgICAgYXdhaXQgdGhpcy5fZ2V0UHJvcGVydGllcyhpZCwgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2V2YWx1YXRlJzpcbiAgICAgICAgY29uc3QgY29tcGF0UGFyYW1zID0gbWFrZUV4cHJlc3Npb25IcGhwZENvbXBhdGlibGUocGFyYW1zKTtcblxuICAgICAgICAvLyBDaHJvbWUgbWF5IGNhbGwgJ2V2YWx1YXRlJyBmb3Igb3RoZXIgcHVycG9zZXMgbGlrZSBhdXRvLWNvbXBsZXRpb24gZXRjLi5cbiAgICAgICAgLy8gYW5kIHdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gY29uc29sZSBldmFsdWF0aW9uLlxuICAgICAgICBpZiAoY29tcGF0UGFyYW1zLm9iamVjdEdyb3VwID09PSAnY29uc29sZScpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLl9ldmFsdWF0ZShpZCwgY29tcGF0UGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVua25vd25NZXRob2QoaWQsIG1ldGhvZCwgY29tcGF0UGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy51bmtub3duTWV0aG9kKGlkLCBtZXRob2QsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9ub3RpZnlFeGVjdXRpb25Db250ZXh0KGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmRNZXRob2QoJ1J1bnRpbWUuZXhlY3V0aW9uQ29udGV4dENyZWF0ZWQnLFxuICAgICAge1xuICAgICAgICAnY29udGV4dCc6IHtcbiAgICAgICAgICAnaWQnOiAxLFxuICAgICAgICAgICdmcmFtZUlkJzogRFVNTVlfRlJBTUVfSUQsXG4gICAgICAgICAgJ25hbWUnOiAnaGh2bTogVE9ETzogbWFuZ2xlIGluIHBpZCwgaWRla2V5LCBzY3JpcHQgZnJvbSBjb25uZWN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRQcm9wZXJ0aWVzKGlkOiBudW1iZXIsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZSB7XG4gICAgLy8gcGFyYW1zIGFsc28gaGFzIHByb3BlcnRpZXM6XG4gICAgLy8gICAgb3duUHJvcGVydGllc1xuICAgIC8vICAgIGdlbmVyYXRlUHJldmlld1xuICAgIGNvbnN0IHtvYmplY3RJZCwgYWNjZXNzb3JQcm9wZXJ0aWVzT25seX0gPSBwYXJhbXM7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAoIWFjY2Vzc29yUHJvcGVydGllc09ubHkpIHtcbiAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5nZXRQcm9wZXJ0aWVzKG9iamVjdElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogSGFuZGxlIHJlbWFpbmluZyBwYXJhbXNcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgIH1cbiAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCB7cmVzdWx0fSk7XG4gIH1cblxuICBhc3luYyBfZXZhbHVhdGUoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIucnVudGltZUV2YWx1YXRlKHBhcmFtcy5leHByZXNzaW9uKTtcbiAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCByZXN1bHQpO1xuICB9XG59XG4iXX0=