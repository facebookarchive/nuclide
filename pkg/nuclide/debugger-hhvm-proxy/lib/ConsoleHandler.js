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

var _Handler2 = require('./Handler');

var _Handler3 = _interopRequireDefault(_Handler2);

// Handles all 'Console.*' Chrome dev tools messages

var ConsoleHandler = (function (_Handler) {
  _inherits(ConsoleHandler, _Handler);

  function ConsoleHandler(clientCallback) {
    _classCallCheck(this, ConsoleHandler);

    _get(Object.getPrototypeOf(ConsoleHandler.prototype), 'constructor', this).call(this, 'Console', clientCallback);
  }

  _createClass(ConsoleHandler, [{
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {
      switch (method) {
        case 'enable':
        case 'disable':
          this.replyToCommand(id, {});
          break;

        case 'clearMessages':
          this.sendMethod('Console.messagesCleared');
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }]);

  return ConsoleHandler;
})(_Handler3['default']);

module.exports = ConsoleHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGVIYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQVlvQixXQUFXOzs7Ozs7SUFJekIsY0FBYztZQUFkLGNBQWM7O0FBQ1AsV0FEUCxjQUFjLENBRWhCLGNBQThCLEVBQzlCOzBCQUhFLGNBQWM7O0FBSWhCLCtCQUpFLGNBQWMsNkNBSVYsU0FBUyxFQUFFLGNBQWMsRUFBRTtHQUNsQzs7ZUFMRyxjQUFjOzs2QkFPQSxXQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsTUFBZSxFQUFXO0FBQ3ZFLGNBQVEsTUFBTTtBQUNaLGFBQUssUUFBUSxDQUFDO0FBQ2QsYUFBSyxTQUFTO0FBQ1osY0FBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDNUIsZ0JBQU07O0FBQUEsQUFFUixhQUFLLGVBQWU7QUFDbEIsY0FBSSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzNDLGdCQUFNOztBQUFBLEFBRVI7QUFDRSxjQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkMsZ0JBQU07QUFBQSxPQUNUO0tBQ0Y7OztTQXRCRyxjQUFjOzs7QUF5QnBCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkNvbnNvbGVIYW5kbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuaW1wb3J0IHR5cGUge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuLy8gSGFuZGxlcyBhbGwgJ0NvbnNvbGUuKicgQ2hyb21lIGRldiB0b29scyBtZXNzYWdlc1xuY2xhc3MgQ29uc29sZUhhbmRsZXIgZXh0ZW5kcyBIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrLFxuICApIHtcbiAgICBzdXBlcignQ29uc29sZScsIGNsaWVudENhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiA/T2JqZWN0KTogUHJvbWlzZSB7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ2VuYWJsZSc6XG4gICAgICBjYXNlICdkaXNhYmxlJzpcbiAgICAgICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge30pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnY2xlYXJNZXNzYWdlcyc6XG4gICAgICAgIHRoaXMuc2VuZE1ldGhvZCgnQ29uc29sZS5tZXNzYWdlc0NsZWFyZWQnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMudW5rbm93bk1ldGhvZChpZCwgbWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlSGFuZGxlcjtcbiJdfQ==