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

// Handles all 'Page.*' Chrome dev tools messages

var PageHandler = (function (_Handler) {
  _inherits(PageHandler, _Handler);

  function PageHandler(clientCallback) {
    _classCallCheck(this, PageHandler);

    _get(Object.getPrototypeOf(PageHandler.prototype), 'constructor', this).call(this, 'Page', clientCallback);
  }

  _createClass(PageHandler, [{
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {
      switch (method) {
        case 'canScreencast':
          this.replyToCommand(id, { result: false });
          break;

        case 'enable':
          this.replyToCommand(id, {});
          break;

        case 'getResourceTree':
          this.replyToCommand(id,
          // For now, return a dummy resource tree so various initializations in
          // client happens.
          {
            'frameTree': {
              'childFrames': [],
              'resources': [],
              'frame': {
                'id': _helpers.DUMMY_FRAME_ID,
                'loaderId': 'Loader.0',
                'mimeType': '',
                'name': 'HHVM',
                'securityOrigin': '',
                'url': 'hhvm:///'
              }
            }
          });
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }]);

  return PageHandler;
})(_Handler3['default']);

module.exports = PageHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhZ2VIYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQVk2QixXQUFXOzt3QkFDcEIsV0FBVzs7Ozs7O0lBS3pCLFdBQVc7WUFBWCxXQUFXOztBQUNKLFdBRFAsV0FBVyxDQUViLGNBQThCLEVBQzlCOzBCQUhFLFdBQVc7O0FBSWIsK0JBSkUsV0FBVyw2Q0FJUCxNQUFNLEVBQUUsY0FBYyxFQUFFO0dBQy9COztlQUxHLFdBQVc7OzZCQU9HLFdBQUMsRUFBVSxFQUFFLE1BQWMsRUFBRSxNQUFlLEVBQVc7QUFDdkUsY0FBUSxNQUFNO0FBQ1osYUFBSyxlQUFlO0FBQ2xCLGNBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDekMsZ0JBQU07O0FBQUEsQUFFUixhQUFLLFFBQVE7QUFDWCxjQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM1QixnQkFBTTs7QUFBQSxBQUVSLGFBQUssaUJBQWlCO0FBQ3BCLGNBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTs7O0FBR3BCO0FBQ0UsdUJBQVcsRUFBRTtBQUNYLDJCQUFhLEVBQUUsRUFBRTtBQUNqQix5QkFBVyxFQUFFLEVBQUU7QUFDZixxQkFBTyxFQUFFO0FBQ1Asb0JBQUkseUJBQWdCO0FBQ3BCLDBCQUFVLEVBQUUsVUFBVTtBQUN0QiwwQkFBVSxFQUFFLEVBQUU7QUFDZCxzQkFBTSxFQUFFLE1BQU07QUFDZCxnQ0FBZ0IsRUFBRSxFQUFFO0FBQ3BCLHFCQUFLLEVBQUUsVUFBVTtlQUNsQjthQUNGO1dBQ0YsQ0FBQyxDQUFDO0FBQ0wsZ0JBQU07O0FBQUEsQUFFUjtBQUNFLGNBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QyxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjs7O1NBekNHLFdBQVc7OztBQTRDakIsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiUGFnZUhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB7RFVNTVlfRlJBTUVfSUR9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuXG5pbXBvcnQgdHlwZSB7Q2xpZW50Q2FsbGJhY2t9IGZyb20gJy4vQ2xpZW50Q2FsbGJhY2snO1xuXG4vLyBIYW5kbGVzIGFsbCAnUGFnZS4qJyBDaHJvbWUgZGV2IHRvb2xzIG1lc3NhZ2VzXG5jbGFzcyBQYWdlSGFuZGxlciBleHRlbmRzIEhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2tcbiAgKSB7XG4gICAgc3VwZXIoJ1BhZ2UnLCBjbGllbnRDYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVNZXRob2QoaWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IFByb21pc2Uge1xuICAgIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgICBjYXNlICdjYW5TY3JlZW5jYXN0JzpcbiAgICAgICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge3Jlc3VsdDogZmFsc2V9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2VuYWJsZSc6XG4gICAgICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2dldFJlc291cmNlVHJlZSc6XG4gICAgICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsXG4gICAgICAgICAgLy8gRm9yIG5vdywgcmV0dXJuIGEgZHVtbXkgcmVzb3VyY2UgdHJlZSBzbyB2YXJpb3VzIGluaXRpYWxpemF0aW9ucyBpblxuICAgICAgICAgIC8vIGNsaWVudCBoYXBwZW5zLlxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdmcmFtZVRyZWUnOiB7XG4gICAgICAgICAgICAgICdjaGlsZEZyYW1lcyc6IFtdLFxuICAgICAgICAgICAgICAncmVzb3VyY2VzJzogW10sXG4gICAgICAgICAgICAgICdmcmFtZSc6IHtcbiAgICAgICAgICAgICAgICAnaWQnOiBEVU1NWV9GUkFNRV9JRCxcbiAgICAgICAgICAgICAgICAnbG9hZGVySWQnOiAnTG9hZGVyLjAnLFxuICAgICAgICAgICAgICAgICdtaW1lVHlwZSc6ICcnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ0hIVk0nLFxuICAgICAgICAgICAgICAgICdzZWN1cml0eU9yaWdpbic6ICcnLFxuICAgICAgICAgICAgICAgICd1cmwnOiAnaGh2bTovLy8nLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMudW5rbm93bk1ldGhvZChpZCwgbWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlSGFuZGxlcjtcbiJdfQ==