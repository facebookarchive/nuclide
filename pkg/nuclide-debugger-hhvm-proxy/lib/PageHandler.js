var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Handles all 'Page.*' Chrome dev tools messages

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _Handler2;

function _Handler() {
  return _Handler2 = _interopRequireDefault(require('./Handler'));
}

var PageHandler = (function (_default) {
  _inherits(PageHandler, _default);

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
            frameTree: {
              childFrames: [],
              resources: [],
              frame: {
                id: (_helpers2 || _helpers()).DUMMY_FRAME_ID,
                loaderId: 'Loader.0',
                mimeType: '',
                name: 'HHVM',
                securityOrigin: '',
                url: 'hhvm:///'
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
})((_Handler2 || _Handler()).default);

module.exports = PageHandler;