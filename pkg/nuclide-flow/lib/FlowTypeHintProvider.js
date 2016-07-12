Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getTypeHintTree = getTypeHintTree;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _FlowServiceFactory2;

function _FlowServiceFactory() {
  return _FlowServiceFactory2 = require('./FlowServiceFactory');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var FlowTypeHintProvider = (function () {
  function FlowTypeHintProvider() {
    _classCallCheck(this, FlowTypeHintProvider);
  }

  // TODO Import from type-hints package once it exposes it.

  _createClass(FlowTypeHintProvider, [{
    key: 'typeHint',
    value: _asyncToGenerator(function* (editor, position) {
      var enabled = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-flow.enableTypeHints');
      if (!enabled) {
        return null;
      }
      var filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }
      var contents = editor.getText();
      var flowService = yield (0, (_FlowServiceFactory2 || _FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);
      (0, (_assert2 || _assert()).default)(flowService);

      var enableStructuredTypeHints = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-flow.enableStructuredTypeHints');
      var getTypeResult = yield flowService.flowGetType(filePath, contents, position.row, position.column, enableStructuredTypeHints);
      if (getTypeResult == null) {
        return null;
      }
      var type = getTypeResult.type;
      var rawType = getTypeResult.rawType;

      // TODO(nmote) refine this regex to better capture JavaScript expressions.
      // Having this regex be not quite right is just a display issue, though --
      // it only affects the location of the tooltip.
      var word = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, (_constants2 || _constants()).JAVASCRIPT_WORD_REGEX);
      var range = undefined;
      if (word) {
        range = word.range;
      } else {
        range = new (_atom2 || _atom()).Range(position, position);
      }
      var result = {
        hint: type,
        range: range
      };
      var hintTree = getTypeHintTree(rawType);
      if (hintTree) {
        return _extends({}, result, {
          hintTree: hintTree
        });
      } else {
        return result;
      }
    })
  }]);

  return FlowTypeHintProvider;
})();

exports.FlowTypeHintProvider = FlowTypeHintProvider;

function getTypeHintTree(typeHint) {
  if (!typeHint) {
    return null;
  }
  try {
    var json = JSON.parse(typeHint);
    return jsonToTree(json);
  } catch (e) {
    var logger = require('../../nuclide-logging').getLogger();
    logger.error('Problem parsing type hint: ' + e.message);
    // If there is any problem parsing just fall back on the original string
    return null;
  }
}

var OBJECT = 'ObjT';
var NUMBER = 'NumT';
var STRING = 'StrT';
var BOOLEAN = 'BoolT';
var MAYBE = 'MaybeT';
var ANYOBJECT = 'AnyObjT';
var ARRAY = 'ArrT';
var FUNCTION = 'FunT';

function jsonToTree(json) {
  var kind = json.kind;
  switch (kind) {
    case OBJECT:
      var propTypes = json.type.propTypes;
      var children = [];
      for (var prop of propTypes) {
        var propName = prop.name;
        var _childTree = jsonToTree(prop.type);
        // Instead of making single child node just for the type name, we'll graft the type onto the
        // end of the property name.
        children.push({
          value: propName + ': ' + _childTree.value,
          children: _childTree.children
        });
      }
      return {
        value: 'Object',
        children: children
      };
    case NUMBER:
      return {
        value: 'number'
      };
    case STRING:
      return {
        value: 'string'
      };
    case BOOLEAN:
      return {
        value: 'boolean'
      };
    case MAYBE:
      var childTree = jsonToTree(json.type);
      return {
        value: '?' + childTree.value,
        children: childTree.children
      };
    case ANYOBJECT:
      return {
        value: 'Object'
      };
    case ARRAY:
      var elemType = jsonToTree(json.elemType);
      return {
        value: 'Array<' + elemType.value + '>',
        children: elemType.children
      };
    case FUNCTION:
      var paramNames = json.funType.paramNames;
      var paramTypes = json.funType.paramTypes;
      (0, (_assert2 || _assert()).default)(Array.isArray(paramNames));
      var parameters = paramNames.map(function (name, i) {
        var type = jsonToTree(paramTypes[i]);
        return {
          value: name + ': ' + type.value,
          children: type.children
        };
      });
      var returnType = jsonToTree(json.funType.returnType);
      return {
        value: 'Function',
        children: [{
          value: 'Parameters',
          children: parameters
        }, {
          value: 'Return Type: ' + returnType.value,
          children: returnType.children
        }]
      };
    default:
      throw new Error('Kind ' + kind + ' not supported');
  }
}