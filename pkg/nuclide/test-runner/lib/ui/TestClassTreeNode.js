var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var Immutable = require('immutable');

var _require = require('../../../ui/tree');

var LazyTreeNode = _require.LazyTreeNode;

var TestClassTreeNode = (function (_LazyTreeNode) {
  _inherits(TestClassTreeNode, _LazyTreeNode);

  function TestClassTreeNode(testClass) {
    _classCallCheck(this, TestClassTreeNode);

    _get(Object.getPrototypeOf(TestClassTreeNode.prototype), 'constructor', this).call(this, testClass, null, true, _asyncToGenerator(function* () {
      return Immutable.List.of();
    }));
  }

  _createClass(TestClassTreeNode, [{
    key: 'getLabel',
    value: function getLabel() {
      return this.getItem()['name'];
    }
  }]);

  return TestClassTreeNode;
})(LazyTreeNode);

module.exports = TestClassTreeNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RDbGFzc1RyZWVOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7ZUFDaEIsT0FBTyxDQUFDLGtCQUFrQixDQUFDOztJQUEzQyxZQUFZLFlBQVosWUFBWTs7SUFFYixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUVWLFdBRlAsaUJBQWlCLENBRVQsU0FBaUIsRUFBRTswQkFGM0IsaUJBQWlCOztBQUduQiwrQkFIRSxpQkFBaUIsNkNBR2IsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLG9CQUFFO2FBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FBQSxHQUFFO0dBQy9EOztlQUpHLGlCQUFpQjs7V0FNYixvQkFBVztBQUNqQixhQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMvQjs7O1NBUkcsaUJBQWlCO0dBQVMsWUFBWTs7QUFZNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJUZXN0Q2xhc3NUcmVlTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xuY29uc3Qge0xhenlUcmVlTm9kZX0gPSByZXF1aXJlKCcuLi8uLi8uLi91aS90cmVlJyk7XG5cbmNsYXNzIFRlc3RDbGFzc1RyZWVOb2RlIGV4dGVuZHMgTGF6eVRyZWVOb2RlIHtcblxuICBjb25zdHJ1Y3Rvcih0ZXN0Q2xhc3M6IE9iamVjdCkge1xuICAgIHN1cGVyKHRlc3RDbGFzcywgbnVsbCwgdHJ1ZSwgYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKSk7XG4gIH1cblxuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEl0ZW0oKVsnbmFtZSddO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0Q2xhc3NUcmVlTm9kZTtcbiJdfQ==