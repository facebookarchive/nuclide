var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var isFlowInstalled = _asyncToGenerator(function* () {
  var flowPath = getPathToFlow();
  if (!flowPathCache.has(flowPath)) {
    flowPathCache.set(flowPath, (yield canFindFlow(flowPath)));
  }

  return flowPathCache.get(flowPath);
});

var canFindFlow = _asyncToGenerator(function* (flowPath) {
  try {
    yield asyncExecute('which', [flowPath]);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @return The path to Flow on the user's machine. It is recommended not to cache the result of this
 *   function in case the user updates his or her preferences in Atom, in which case the return
 *   value will be stale.
 */
);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');

var _require = require('../../commons');

var asyncExecute = _require.asyncExecute;
var findNearestFile = _require.findNearestFile;

var LRU = require('lru-cache');

var flowConfigDirCache = LRU({
  max: 10,
  length: function length(n) {
    return n.length;
  },
  maxAge: 1000 * 30 });
//30 seconds
var flowPathCache = LRU({
  max: 10,
  maxAge: 1000 * 30 });

// 30 seconds
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
  var description = flowItem['type'].length < 80 ? flowItem['type'] : flowItem['type'].substring(0, 80) + ' ...';
  var result = {
    description: description,
    displayText: flowItem['name'],
    replacementPrefix: replacementPrefix
  };
  var funcDetails = flowItem['func_details'];
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    var rightParamStrings = funcDetails['params'].map(function (param) {
      return param['name'] + ': ' + param['type'];
    });
    var snippetString = getSnippetString(funcDetails['params'].map(function (param) {
      return param['name'];
    }));
    result = _extends({}, result, {
      leftLabel: funcDetails['return_type'],
      rightLabel: '(' + rightParamStrings.join(', ') + ')',
      snippet: flowItem['name'] + '(' + snippetString + ')',
      type: 'function'
    });
  } else {
    result = _extends({}, result, {
      rightLabel: flowItem['type'],
      text: flowItem['name']
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
  (0, _assert2['default'])(param.length > 0);
  var lastChar = param[param.length - 1];
  return lastChar === '?';
}

function getPathToFlow() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  return global.atom && global.atom.config.get('nuclide.nuclide-flow.pathToFlow') || 'flow';
}

function getStopFlowOnExit() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit');
  }
  return true;
}

function findFlowConfigDir(localFile) {
  if (!flowConfigDirCache.has(localFile)) {
    flowConfigDirCache.set(localFile, findNearestFile('.flowconfig', path.dirname(localFile)));
  }
  return flowConfigDirCache.get(localFile);
}

module.exports = {
  findFlowConfigDir: findFlowConfigDir,
  getPathToFlow: getPathToFlow,
  getStopFlowOnExit: getStopFlowOnExit,
  insertAutocompleteToken: insertAutocompleteToken,
  isFlowInstalled: isFlowInstalled,
  processAutocompleteItem: processAutocompleteItem,
  groupParamNames: groupParamNames
};
// parameters after them.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dIZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUEySGUsZUFBZSxxQkFBOUIsYUFBbUQ7QUFDakQsTUFBTSxRQUFRLEdBQUcsYUFBYSxFQUFFLENBQUM7QUFDakMsTUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDaEMsaUJBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFFLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUMsQ0FBQztHQUMxRDs7QUFFRCxTQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDcEM7O0lBRWMsV0FBVyxxQkFBMUIsV0FBMkIsUUFBZ0IsRUFBb0I7QUFDN0QsTUFBSTtBQUNGLFVBQU0sWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBTyxLQUFLLENBQUM7R0FDZDtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7c0JBNUhxQixRQUFROzs7Ozs7Ozs7Ozs7QUFKOUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNXLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQXpELFlBQVksWUFBWixZQUFZO0lBQUUsZUFBZSxZQUFmLGVBQWU7O0FBQ3BDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFJakMsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFDN0IsS0FBRyxFQUFFLEVBQUU7QUFDUCxRQUFNLEVBQUUsZ0JBQVUsQ0FBQyxFQUFFO0FBQUUsV0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0dBQUU7QUFDekMsUUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQ2xCLENBQUMsQ0FBQzs7QUFDSCxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFDeEIsS0FBRyxFQUFFLEVBQUU7QUFDUCxRQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFDbEIsQ0FBQyxDQUFDOzs7QUFFSCxTQUFTLHVCQUF1QixDQUFDLFFBQWdCLEVBQUUsSUFBWSxFQUFFLEdBQVcsRUFBVTtBQUNwRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLE1BQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixTQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekUsT0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUN0QixTQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDekI7Ozs7Ozs7QUFPRCxTQUFTLHVCQUF1QixDQUFDLGlCQUF5QixFQUFFLFFBQWdCLEVBQVU7O0FBRXBGLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUM1QyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQ2hCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUM5QyxNQUFJLE1BQU0sR0FBRztBQUNYLGVBQVcsRUFBRSxXQUFXO0FBQ3hCLGVBQVcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQzdCLHFCQUFpQixFQUFqQixpQkFBaUI7R0FDbEIsQ0FBQztBQUNGLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxNQUFJLFdBQVcsRUFBRTs7QUFFZixRQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FDNUMsR0FBRyxDQUFDLFVBQUEsS0FBSzthQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBSyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQUUsQ0FBQyxDQUFDO0FBQ3RELFFBQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2FBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzFGLFVBQU0sZ0JBQ0QsTUFBTTtBQUNULGVBQVMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDO0FBQ3JDLGdCQUFVLFFBQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFHO0FBQy9DLGFBQU8sRUFBSyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQUksYUFBYSxNQUFHO0FBQ2hELFVBQUksRUFBRSxVQUFVO01BQ2pCLENBQUM7R0FDSCxNQUFNO0FBQ0wsVUFBTSxnQkFDRCxNQUFNO0FBQ1QsZ0JBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQzVCLFVBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDO01BQ3ZCLENBQUM7R0FDSDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxVQUF5QixFQUFVO0FBQzNELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbEQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQ3RDLEdBQUcsQ0FBQyxVQUFBLE1BQU07V0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztHQUFBLENBQUMsQ0FDaEMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFFLENBQUM7bUJBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxTQUFJLEtBQUs7R0FBRyxDQUFDLENBQUM7QUFDOUMsU0FBTyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkM7Ozs7Ozs7O0FBUUQsU0FBUyxlQUFlLENBQUMsVUFBeUIsRUFBd0I7Ozs7Z0NBS3RFLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBQyxJQUFvQixFQUFFLEtBQUssRUFBSzsrQkFBaEMsSUFBb0I7O1FBQW5CLFFBQVE7UUFBRSxRQUFROzs7O0FBR3pDLFFBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzlDLGNBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekIsTUFBTTtBQUNMLGNBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7QUFDRCxXQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQzdCLEVBQ0QsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ1Q7Ozs7TUFaTSxjQUFjO01BQUUsZ0JBQWdCOztBQWN2QyxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztXQUFJLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0FBQzNELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFELE1BQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixhQUFTLENBQUMsSUFBSSxNQUFBLENBQWQsU0FBUyxxQkFBUyxnQkFBZ0IsRUFBQyxDQUFDO0dBQ3JDLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3RDLGlCQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7R0FDdEM7O0FBRUQsU0FBTyxhQUFhLENBQUM7Q0FDdEI7O0FBRUQsU0FBUyxVQUFVLENBQUMsS0FBYSxFQUFXO0FBQzFDLDJCQUFVLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekMsU0FBTyxRQUFRLEtBQUssR0FBRyxDQUFDO0NBQ3pCOztBQXlCRCxTQUFTLGFBQWEsR0FBVzs7O0FBRy9CLFNBQU8sTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsSUFBSSxNQUFNLENBQUM7Q0FDM0Y7O0FBRUQsU0FBUyxpQkFBaUIsR0FBWTs7O0FBR3BDLE1BQUksTUFBTSxDQUFDLElBQUksRUFBRTtBQUNmLFdBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQWlCO0dBQ3hGO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQW9CO0FBQzlELE1BQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDdEMsc0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzVGO0FBQ0QsU0FBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDMUM7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsZUFBYSxFQUFiLGFBQWE7QUFDYixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsaUJBQWUsRUFBZixlQUFlO0FBQ2YseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixpQkFBZSxFQUFmLGVBQWU7Q0FDaEIsQ0FBQyIsImZpbGUiOiJGbG93SGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7YXN5bmNFeGVjdXRlLCBmaW5kTmVhcmVzdEZpbGV9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3QgTFJVID0gcmVxdWlyZSgnbHJ1LWNhY2hlJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgZmxvd0NvbmZpZ0RpckNhY2hlID0gTFJVKHtcbiAgbWF4OiAxMCxcbiAgbGVuZ3RoOiBmdW5jdGlvbiAobikgeyByZXR1cm4gbi5sZW5ndGg7IH0sXG4gIG1heEFnZTogMTAwMCAqIDMwLCAvLzMwIHNlY29uZHNcbn0pO1xuY29uc3QgZmxvd1BhdGhDYWNoZSA9IExSVSh7XG4gIG1heDogMTAsXG4gIG1heEFnZTogMTAwMCAqIDMwLCAvLyAzMCBzZWNvbmRzXG59KTtcblxuZnVuY3Rpb24gaW5zZXJ0QXV0b2NvbXBsZXRlVG9rZW4oY29udGVudHM6IHN0cmluZywgbGluZTogbnVtYmVyLCBjb2w6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gY29udGVudHMuc3BsaXQoJ1xcbicpO1xuICBsZXQgdGhlTGluZSA9IGxpbmVzW2xpbmVdO1xuICB0aGVMaW5lID0gdGhlTGluZS5zdWJzdHJpbmcoMCwgY29sKSArICdBVVRPMzMyJyArIHRoZUxpbmUuc3Vic3RyaW5nKGNvbCk7XG4gIGxpbmVzW2xpbmVdID0gdGhlTGluZTtcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGF1dG9jb21wbGV0ZSBpdGVtIGZyb20gRmxvdyBhbmQgcmV0dXJucyBhIHZhbGlkIGF1dG9jb21wbGV0ZS1wbHVzXG4gKiByZXNwb25zZSwgYXMgZG9jdW1lbnRlZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUElcbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0F1dG9jb21wbGV0ZUl0ZW0ocmVwbGFjZW1lbnRQcmVmaXg6IHN0cmluZywgZmxvd0l0ZW06IE9iamVjdCk6IE9iamVjdCB7XG4gIC8vIFRydW5jYXRlIGxvbmcgdHlwZXMgZm9yIHJlYWRhYmlsaXR5XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gZmxvd0l0ZW1bJ3R5cGUnXS5sZW5ndGggPCA4MFxuICAgID8gZmxvd0l0ZW1bJ3R5cGUnXVxuICAgIDogZmxvd0l0ZW1bJ3R5cGUnXS5zdWJzdHJpbmcoMCw4MCkgKyAnIC4uLic7XG4gIGxldCByZXN1bHQgPSB7XG4gICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgIGRpc3BsYXlUZXh0OiBmbG93SXRlbVsnbmFtZSddLFxuICAgIHJlcGxhY2VtZW50UHJlZml4LFxuICB9O1xuICBjb25zdCBmdW5jRGV0YWlscyA9IGZsb3dJdGVtWydmdW5jX2RldGFpbHMnXTtcbiAgaWYgKGZ1bmNEZXRhaWxzKSB7XG4gICAgLy8gVGhlIHBhcmFtZXRlcnMgaW4gaHVtYW4tcmVhZGFibGUgZm9ybSBmb3IgdXNlIG9uIHRoZSByaWdodCBsYWJlbC5cbiAgICBjb25zdCByaWdodFBhcmFtU3RyaW5ncyA9IGZ1bmNEZXRhaWxzWydwYXJhbXMnXVxuICAgICAgLm1hcChwYXJhbSA9PiBgJHtwYXJhbVsnbmFtZSddfTogJHtwYXJhbVsndHlwZSddfWApO1xuICAgIGNvbnN0IHNuaXBwZXRTdHJpbmcgPSBnZXRTbmlwcGV0U3RyaW5nKGZ1bmNEZXRhaWxzWydwYXJhbXMnXS5tYXAocGFyYW0gPT4gcGFyYW1bJ25hbWUnXSkpO1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIC4uLnJlc3VsdCxcbiAgICAgIGxlZnRMYWJlbDogZnVuY0RldGFpbHNbJ3JldHVybl90eXBlJ10sXG4gICAgICByaWdodExhYmVsOiBgKCR7cmlnaHRQYXJhbVN0cmluZ3Muam9pbignLCAnKX0pYCxcbiAgICAgIHNuaXBwZXQ6IGAke2Zsb3dJdGVtWyduYW1lJ119KCR7c25pcHBldFN0cmluZ30pYCxcbiAgICAgIHR5cGU6ICdmdW5jdGlvbicsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSB7XG4gICAgICAuLi5yZXN1bHQsXG4gICAgICByaWdodExhYmVsOiBmbG93SXRlbVsndHlwZSddLFxuICAgICAgdGV4dDogZmxvd0l0ZW1bJ25hbWUnXSxcbiAgICB9O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldFNuaXBwZXRTdHJpbmcocGFyYW1OYW1lczogQXJyYXk8c3RyaW5nPik6IHN0cmluZyB7XG4gIGNvbnN0IGdyb3VwZWRQYXJhbXMgPSBncm91cFBhcmFtTmFtZXMocGFyYW1OYW1lcyk7XG4gIC8vIFRoZSBwYXJhbWV0ZXJzIHR1cm5lZCBpbnRvIHNuaXBwZXQgc3RyaW5ncy5cbiAgY29uc3Qgc25pcHBldFBhcmFtU3RyaW5ncyA9IGdyb3VwZWRQYXJhbXNcbiAgICAubWFwKHBhcmFtcyA9PiBwYXJhbXMuam9pbignLCAnKSlcbiAgICAubWFwKChwYXJhbSwgaSkgPT4gYFxcJHske2kgKyAxfToke3BhcmFtfX1gKTtcbiAgcmV0dXJuIHNuaXBwZXRQYXJhbVN0cmluZ3Muam9pbignLCAnKTtcbn1cblxuLyoqXG4gKiBHcm91cCB0aGUgcGFyYW1ldGVyIG5hbWVzIHNvIHRoYXQgYWxsIG9mIHRoZSB0cmFpbGluZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSB0b2dldGhlciB3aXRoIHRoZVxuICogbGFzdCBub24tb3B0aW9uYWwgcGFyYW1ldGVyLiBUaGF0IG1ha2VzIGl0IGVhc3kgdG8gaWdub3JlIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXJzLCBzaW5jZSB0aGV5XG4gKiB3aWxsIGJlIHNlbGVjdGVkIGFsb25nIHdpdGggdGhlIGxhc3Qgbm9uLW9wdGlvbmFsIHBhcmFtZXRlciBhbmQgeW91IGNhbiBqdXN0IHR5cGUgdG8gb3ZlcndyaXRlXG4gKiB0aGVtLlxuICovXG5mdW5jdGlvbiBncm91cFBhcmFtTmFtZXMocGFyYW1OYW1lczogQXJyYXk8c3RyaW5nPik6IEFycmF5PEFycmF5PHN0cmluZz4+IHtcbiAgLy8gU3BsaXQgdGhlIHBhcmFtZXRlcnMgaW50byB0d28gZ3JvdXBzIC0tIGFsbCBvZiB0aGUgdHJhaWxpbmcgb3B0aW9uYWwgcGFyYW1hdGVycywgYW5kIHRoZSByZXN0XG4gIC8vIG9mIHRoZSBwYXJhbWV0ZXJzLiBUcmFpbGluZyBvcHRpb25hbCBtZWFucyBhbGwgb3B0aW9uYWwgcGFyYW1ldGVycyB0aGF0IGhhdmUgb25seSBvcHRpb25hbFxuICAvLyBwYXJhbWV0ZXJzIGFmdGVyIHRoZW0uXG4gIGNvbnN0IFtvcmRpbmFyeVBhcmFtcywgdHJhaWxpbmdPcHRpb25hbF0gPVxuICAgIHBhcmFtTmFtZXMucmVkdWNlUmlnaHQoKFtvcmRpbmFyeSwgb3B0aW9uYWxdLCBwYXJhbSkgPT4ge1xuICAgICAgLy8gSWYgdGhlcmUgaGF2ZSBvbmx5IGJlZW4gb3B0aW9uYWwgcGFyYW1zIHNvIGZhciwgYW5kIHRoaXMgb25lIGlzIG9wdGlvbmFsLCBhZGQgaXQgdG8gdGhlXG4gICAgICAvLyBsaXN0IG9mIHRyYWlsaW5nIG9wdGlvbmFsIHBhcmFtcy5cbiAgICAgIGlmIChpc09wdGlvbmFsKHBhcmFtKSAmJiBvcmRpbmFyeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgb3B0aW9uYWwudW5zaGlmdChwYXJhbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmRpbmFyeS51bnNoaWZ0KHBhcmFtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbb3JkaW5hcnksIG9wdGlvbmFsXTtcbiAgICB9LFxuICAgIFtbXSwgW11dXG4gICk7XG5cbiAgY29uc3QgZ3JvdXBlZFBhcmFtcyA9IG9yZGluYXJ5UGFyYW1zLm1hcChwYXJhbSA9PiBbcGFyYW1dKTtcbiAgY29uc3QgbGFzdFBhcmFtID0gZ3JvdXBlZFBhcmFtc1tncm91cGVkUGFyYW1zLmxlbmd0aCAtIDFdO1xuICBpZiAobGFzdFBhcmFtICE9IG51bGwpIHtcbiAgICBsYXN0UGFyYW0ucHVzaCguLi50cmFpbGluZ09wdGlvbmFsKTtcbiAgfSBlbHNlIGlmICh0cmFpbGluZ09wdGlvbmFsLmxlbmd0aCA+IDApIHtcbiAgICBncm91cGVkUGFyYW1zLnB1c2godHJhaWxpbmdPcHRpb25hbCk7XG4gIH1cblxuICByZXR1cm4gZ3JvdXBlZFBhcmFtcztcbn1cblxuZnVuY3Rpb24gaXNPcHRpb25hbChwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGludmFyaWFudChwYXJhbS5sZW5ndGggPiAwKTtcbiAgY29uc3QgbGFzdENoYXIgPSBwYXJhbVtwYXJhbS5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIGxhc3RDaGFyID09PSAnPyc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGlzRmxvd0luc3RhbGxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgZmxvd1BhdGggPSBnZXRQYXRoVG9GbG93KCk7XG4gIGlmICghZmxvd1BhdGhDYWNoZS5oYXMoZmxvd1BhdGgpKSB7XG4gICAgZmxvd1BhdGhDYWNoZS5zZXQoZmxvd1BhdGgsIGF3YWl0IGNhbkZpbmRGbG93KGZsb3dQYXRoKSk7XG4gIH1cblxuICByZXR1cm4gZmxvd1BhdGhDYWNoZS5nZXQoZmxvd1BhdGgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjYW5GaW5kRmxvdyhmbG93UGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXN5bmNFeGVjdXRlKCd3aGljaCcsIFtmbG93UGF0aF0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQHJldHVybiBUaGUgcGF0aCB0byBGbG93IG9uIHRoZSB1c2VyJ3MgbWFjaGluZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIGNhY2hlIHRoZSByZXN1bHQgb2YgdGhpc1xuICogICBmdW5jdGlvbiBpbiBjYXNlIHRoZSB1c2VyIHVwZGF0ZXMgaGlzIG9yIGhlciBwcmVmZXJlbmNlcyBpbiBBdG9tLCBpbiB3aGljaCBjYXNlIHRoZSByZXR1cm5cbiAqICAgdmFsdWUgd2lsbCBiZSBzdGFsZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvRmxvdygpOiBzdHJpbmcge1xuICAvLyAkVVBGaXhNZTogVGhpcyBzaG91bGQgdXNlIG51Y2xpZGUtZmVhdHVyZXMtY29uZmlnXG4gIC8vIERvZXMgbm90IGN1cnJlbnRseSBkbyBzbyBiZWNhdXNlIHRoaXMgaXMgYW4gbnBtIG1vZHVsZSB0aGF0IG1heSBydW4gb24gdGhlIHNlcnZlci5cbiAgcmV0dXJuIGdsb2JhbC5hdG9tICYmIGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUubnVjbGlkZS1mbG93LnBhdGhUb0Zsb3cnKSB8fCAnZmxvdyc7XG59XG5cbmZ1bmN0aW9uIGdldFN0b3BGbG93T25FeGl0KCk6IGJvb2xlYW4ge1xuICAvLyAkVVBGaXhNZTogVGhpcyBzaG91bGQgdXNlIG51Y2xpZGUtZmVhdHVyZXMtY29uZmlnXG4gIC8vIERvZXMgbm90IGN1cnJlbnRseSBkbyBzbyBiZWNhdXNlIHRoaXMgaXMgYW4gbnBtIG1vZHVsZSB0aGF0IG1heSBydW4gb24gdGhlIHNlcnZlci5cbiAgaWYgKGdsb2JhbC5hdG9tKSB7XG4gICAgcmV0dXJuICgoZ2xvYmFsLmF0b20uY29uZmlnLmdldCgnbnVjbGlkZS5udWNsaWRlLWZsb3cuc3RvcEZsb3dPbkV4aXQnKTogYW55KTogYm9vbGVhbik7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZpbmRGbG93Q29uZmlnRGlyKGxvY2FsRmlsZTogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIGlmICghZmxvd0NvbmZpZ0RpckNhY2hlLmhhcyhsb2NhbEZpbGUpKSB7XG4gICAgZmxvd0NvbmZpZ0RpckNhY2hlLnNldChsb2NhbEZpbGUsIGZpbmROZWFyZXN0RmlsZSgnLmZsb3djb25maWcnLCBwYXRoLmRpcm5hbWUobG9jYWxGaWxlKSkpO1xuICB9XG4gIHJldHVybiBmbG93Q29uZmlnRGlyQ2FjaGUuZ2V0KGxvY2FsRmlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kRmxvd0NvbmZpZ0RpcixcbiAgZ2V0UGF0aFRvRmxvdyxcbiAgZ2V0U3RvcEZsb3dPbkV4aXQsXG4gIGluc2VydEF1dG9jb21wbGV0ZVRva2VuLFxuICBpc0Zsb3dJbnN0YWxsZWQsXG4gIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtLFxuICBncm91cFBhcmFtTmFtZXMsXG59O1xuIl19