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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.insertAutocompleteToken = insertAutocompleteToken;
exports.processAutocompleteItem = processAutocompleteItem;
exports.groupParamNames = groupParamNames;
exports.getStopFlowOnExit = getStopFlowOnExit;
exports.flowCoordsToAtomCoords = flowCoordsToAtomCoords;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function insertAutocompleteToken(contents, line, col) {
  var lines = contents.split('\n');
  var theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */

function processAutocompleteItem(replacementPrefix, flowItem) {
  // Truncate long types for readability
  var description = flowItem.type.length < 80 ? flowItem.type : flowItem.type.substring(0, 80) + ' ...';
  var result = {
    description: description,
    displayText: flowItem.name,
    replacementPrefix: replacementPrefix
  };
  var funcDetails = flowItem.func_details;
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    var rightParamStrings = funcDetails.params.map(function (param) {
      return param.name + ': ' + param.type;
    });
    var snippetString = getSnippetString(funcDetails.params.map(function (param) {
      return param.name;
    }));
    result = _extends({}, result, {
      leftLabel: funcDetails.return_type,
      rightLabel: '(' + rightParamStrings.join(', ') + ')',
      snippet: flowItem.name + '(' + snippetString + ')',
      type: 'function'
    });
  } else {
    result = _extends({}, result, {
      rightLabel: flowItem.type,
      text: flowItem.name
    });
  }
  return result;
}

function getSnippetString(paramNames) {
  var groupedParams = groupParamNames(paramNames);
  // The parameters turned into snippet strings.
  var snippetParamStrings = groupedParams.map(function (params) {
    return params.join(', ');
  }).map(function (param, i) {
    return '${' + (i + 1) + ':' + param + '}';
  });
  return snippetParamStrings.join(', ');
}

/**
 * Group the parameter names so that all of the trailing optional parameters are together with the
 * last non-optional parameter. That makes it easy to ignore the optional parameters, since they
 * will be selected along with the last non-optional parameter and you can just type to overwrite
 * them.
 */

function groupParamNames(paramNames) {
  // Split the parameters into two groups -- all of the trailing optional paramaters, and the rest
  // of the parameters. Trailing optional means all optional parameters that have only optional

  var _paramNames$reduceRight = paramNames.reduceRight(function (_ref, param) {
    var _ref2 = _slicedToArray(_ref, 2);

    var ordinary = _ref2[0];
    var optional = _ref2[1];

    // If there have only been optional params so far, and this one is optional, add it to the
    // list of trailing optional params.
    if (isOptional(param) && ordinary.length === 0) {
      optional.unshift(param);
    } else {
      ordinary.unshift(param);
    }
    return [ordinary, optional];
  }, [[], []]);

  var _paramNames$reduceRight2 = _slicedToArray(_paramNames$reduceRight, 2);

  var ordinaryParams = _paramNames$reduceRight2[0];
  var trailingOptional = _paramNames$reduceRight2[1];

  var groupedParams = ordinaryParams.map(function (param) {
    return [param];
  });
  var lastParam = groupedParams[groupedParams.length - 1];
  if (lastParam != null) {
    lastParam.push.apply(lastParam, _toConsumableArray(trailingOptional));
  } else if (trailingOptional.length > 0) {
    groupedParams.push(trailingOptional);
  }

  return groupedParams;
}

function isOptional(param) {
  (0, (_assert2 || _assert()).default)(param.length > 0);
  var lastChar = param[param.length - 1];
  return lastChar === '?';
}

function getStopFlowOnExit() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit');
  }
  return true;
}

function flowCoordsToAtomCoords(flowCoords) {
  return {
    start: {
      line: flowCoords.start.line - 1,
      column: flowCoords.start.column - 1
    },
    end: {
      line: flowCoords.end.line - 1,
      // Yes, this is inconsistent. Yes, it works as expected in practice.
      column: flowCoords.end.column
    }
  };
}

// parameters after them.