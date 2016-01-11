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
          // Chrome may call 'evaluate' for other purposes like auto-completion etc..
          // and we are only interested in console evaluation.
          if (params.objectGroup === 'console') {
            yield this._evaluate(id, params);
          } else {
            this.unknownMethod(id, method, params);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJ1bnRpbWVIYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFZNkIsV0FBVzs7d0JBQ3BCLFdBQVc7Ozs7OztJQU1sQixjQUFjO1lBQWQsY0FBYzs7QUFHZCxXQUhBLGNBQWMsQ0FJdkIsY0FBOEIsRUFDOUIscUJBQTRDLEVBQzVDOzBCQU5TLGNBQWM7O0FBT3ZCLCtCQVBTLGNBQWMsNkNBT2pCLFNBQVMsRUFBRSxjQUFjLEVBQUU7QUFDakMsUUFBSSxDQUFDLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDO0dBQ3JEOztlQVRVLGNBQWM7OzZCQVdQLFdBQUMsRUFBVSxFQUFFLE1BQWMsRUFBRSxNQUFjLEVBQVc7QUFDdEUsY0FBUSxNQUFNO0FBQ1osYUFBSyxRQUFRO0FBQ1gsY0FBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxlQUFlO0FBQ2xCLGdCQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxVQUFVOzs7QUFHYixjQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO0FBQ3BDLGtCQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1dBQ2xDLE1BQU07QUFDTCxnQkFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1dBQ3hDO0FBQ0QsZ0JBQU07O0FBQUEsQUFFUjtBQUNFLGNBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QyxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjs7O1dBRXNCLGlDQUFDLEVBQVUsRUFBUTtBQUN4QyxVQUFJLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxFQUMvQztBQUNFLGlCQUFTLEVBQUU7QUFDVCxjQUFJLEVBQUUsQ0FBQztBQUNQLG1CQUFTLHlCQUFnQjtBQUN6QixnQkFBTSxFQUFFLDJEQUEyRDtTQUNwRTtPQUNGLENBQUMsQ0FBQztBQUNMLFVBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzdCOzs7NkJBRW1CLFdBQUMsRUFBVSxFQUFFLE1BQWMsRUFBVzs7OztVQUlqRCxRQUFRLEdBQTRCLE1BQU0sQ0FBMUMsUUFBUTtVQUFFLHNCQUFzQixHQUFJLE1BQU0sQ0FBaEMsc0JBQXNCOztBQUN2QyxVQUFJLE1BQU0sWUFBQSxDQUFDO0FBQ1gsVUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQzNCLGNBQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDcEUsTUFBTTs7QUFFTCxjQUFNLEdBQUcsRUFBRSxDQUFDO09BQ2I7QUFDRCxVQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ25DOzs7NkJBRWMsV0FBQyxFQUFVLEVBQUUsTUFBYyxFQUFXO0FBQ25ELFVBQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEYsVUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDakM7OztTQW5FVSxjQUFjIiwiZmlsZSI6IlJ1bnRpbWVIYW5kbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQge0RVTU1ZX0ZSQU1FX0lEfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IEhhbmRsZXIgZnJvbSAnLi9IYW5kbGVyJztcblxuaW1wb3J0IHR5cGUge0Nvbm5lY3Rpb25NdWx0aXBsZXhlcn0gZnJvbSAnLi9Db25uZWN0aW9uTXVsdGlwbGV4ZXInO1xuaW1wb3J0IHR5cGUge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuLy8gSGFuZGxlcyBhbGwgJ1J1bnRpbWUuKicgQ2hyb21lIGRldiB0b29scyBtZXNzYWdlc1xuZXhwb3J0IGNsYXNzIFJ1bnRpbWVIYW5kbGVyIGV4dGVuZHMgSGFuZGxlciB7XG4gIF9jb25uZWN0aW9uTXVsdGlwbGV4ZXI6IENvbm5lY3Rpb25NdWx0aXBsZXhlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2ssXG4gICAgY29ubmVjdGlvbk11bHRpcGxleGVyOiBDb25uZWN0aW9uTXVsdGlwbGV4ZXJcbiAgKSB7XG4gICAgc3VwZXIoJ1J1bnRpbWUnLCBjbGllbnRDYWxsYmFjayk7XG4gICAgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyID0gY29ubmVjdGlvbk11bHRpcGxleGVyO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlTWV0aG9kKGlkOiBudW1iZXIsIG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6IE9iamVjdCk6IFByb21pc2Uge1xuICAgIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgICBjYXNlICdlbmFibGUnOlxuICAgICAgICB0aGlzLl9ub3RpZnlFeGVjdXRpb25Db250ZXh0KGlkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2dldFByb3BlcnRpZXMnOlxuICAgICAgICBhd2FpdCB0aGlzLl9nZXRQcm9wZXJ0aWVzKGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZhbHVhdGUnOlxuICAgICAgICAvLyBDaHJvbWUgbWF5IGNhbGwgJ2V2YWx1YXRlJyBmb3Igb3RoZXIgcHVycG9zZXMgbGlrZSBhdXRvLWNvbXBsZXRpb24gZXRjLi5cbiAgICAgICAgLy8gYW5kIHdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gY29uc29sZSBldmFsdWF0aW9uLlxuICAgICAgICBpZiAocGFyYW1zLm9iamVjdEdyb3VwID09PSAnY29uc29sZScpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLl9ldmFsdWF0ZShpZCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVua25vd25NZXRob2QoaWQsIG1ldGhvZCwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy51bmtub3duTWV0aG9kKGlkLCBtZXRob2QsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9ub3RpZnlFeGVjdXRpb25Db250ZXh0KGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmRNZXRob2QoJ1J1bnRpbWUuZXhlY3V0aW9uQ29udGV4dENyZWF0ZWQnLFxuICAgICAge1xuICAgICAgICAnY29udGV4dCc6IHtcbiAgICAgICAgICAnaWQnOiAxLFxuICAgICAgICAgICdmcmFtZUlkJzogRFVNTVlfRlJBTUVfSUQsXG4gICAgICAgICAgJ25hbWUnOiAnaGh2bTogVE9ETzogbWFuZ2xlIGluIHBpZCwgaWRla2V5LCBzY3JpcHQgZnJvbSBjb25uZWN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRQcm9wZXJ0aWVzKGlkOiBudW1iZXIsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZSB7XG4gICAgLy8gcGFyYW1zIGFsc28gaGFzIHByb3BlcnRpZXM6XG4gICAgLy8gICAgb3duUHJvcGVydGllc1xuICAgIC8vICAgIGdlbmVyYXRlUHJldmlld1xuICAgIGNvbnN0IHtvYmplY3RJZCwgYWNjZXNzb3JQcm9wZXJ0aWVzT25seX0gPSBwYXJhbXM7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAoIWFjY2Vzc29yUHJvcGVydGllc09ubHkpIHtcbiAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5nZXRQcm9wZXJ0aWVzKG9iamVjdElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogSGFuZGxlIHJlbWFpbmluZyBwYXJhbXNcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgIH1cbiAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCB7cmVzdWx0fSk7XG4gIH1cblxuICBhc3luYyBfZXZhbHVhdGUoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIucnVudGltZUV2YWx1YXRlKHBhcmFtcy5leHByZXNzaW9uKTtcbiAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCByZXN1bHQpO1xuICB9XG59XG4iXX0=