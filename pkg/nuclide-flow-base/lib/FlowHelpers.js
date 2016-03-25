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

var _require = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dIZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUEySGUsZUFBZSxxQkFBOUIsYUFBbUQ7QUFDakQsTUFBTSxRQUFRLEdBQUcsYUFBYSxFQUFFLENBQUM7QUFDakMsTUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDaEMsaUJBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFFLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUMsQ0FBQztHQUMxRDs7QUFFRCxTQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDcEM7O0lBRWMsV0FBVyxxQkFBMUIsV0FBMkIsUUFBZ0IsRUFBb0I7QUFDN0QsTUFBSTtBQUNGLFVBQU0sWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDeEMsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBTyxLQUFLLENBQUM7R0FDZDtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7c0JBNUhxQixRQUFROzs7Ozs7Ozs7Ozs7QUFKOUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNXLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBakUsWUFBWSxZQUFaLFlBQVk7SUFBRSxlQUFlLFlBQWYsZUFBZTs7QUFDcEMsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUlqQyxJQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztBQUM3QixLQUFHLEVBQUUsRUFBRTtBQUNQLFFBQU0sRUFBRSxnQkFBVSxDQUFDLEVBQUU7QUFBRSxXQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7R0FBRTtBQUN6QyxRQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFDbEIsQ0FBQyxDQUFDOztBQUNILElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUN4QixLQUFHLEVBQUUsRUFBRTtBQUNQLFFBQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUNsQixDQUFDLENBQUM7OztBQUVILFNBQVMsdUJBQXVCLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsR0FBVyxFQUFVO0FBQ3BGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsTUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLFNBQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RSxPQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLFNBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN6Qjs7Ozs7OztBQU9ELFNBQVMsdUJBQXVCLENBQUMsaUJBQXlCLEVBQUUsUUFBZ0IsRUFBVTs7QUFFcEYsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQzVDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FDaEIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQzlDLE1BQUksTUFBTSxHQUFHO0FBQ1gsZUFBVyxFQUFFLFdBQVc7QUFDeEIsZUFBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDN0IscUJBQWlCLEVBQWpCLGlCQUFpQjtHQUNsQixDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLE1BQUksV0FBVyxFQUFFOztBQUVmLFFBQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUM1QyxHQUFHLENBQUMsVUFBQSxLQUFLO2FBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFLLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FBRSxDQUFDLENBQUM7QUFDdEQsUUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7YUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQUEsQ0FBQyxDQUFDLENBQUM7QUFDMUYsVUFBTSxnQkFDRCxNQUFNO0FBQ1QsZUFBUyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUM7QUFDckMsZ0JBQVUsUUFBTSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUc7QUFDL0MsYUFBTyxFQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBSSxhQUFhLE1BQUc7QUFDaEQsVUFBSSxFQUFFLFVBQVU7TUFDakIsQ0FBQztHQUNILE1BQU07QUFDTCxVQUFNLGdCQUNELE1BQU07QUFDVCxnQkFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDNUIsVUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUM7TUFDdkIsQ0FBQztHQUNIO0FBQ0QsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFVBQXlCLEVBQVU7QUFDM0QsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVsRCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FDdEMsR0FBRyxDQUFDLFVBQUEsTUFBTTtXQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUNoQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsQ0FBQzttQkFBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBLFNBQUksS0FBSztHQUFHLENBQUMsQ0FBQztBQUM5QyxTQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN2Qzs7Ozs7Ozs7QUFRRCxTQUFTLGVBQWUsQ0FBQyxVQUF5QixFQUF3Qjs7OztnQ0FLdEUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFDLElBQW9CLEVBQUUsS0FBSyxFQUFLOytCQUFoQyxJQUFvQjs7UUFBbkIsUUFBUTtRQUFFLFFBQVE7Ozs7QUFHekMsUUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUMsY0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QixNQUFNO0FBQ0wsY0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtBQUNELFdBQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDN0IsRUFDRCxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FDVDs7OztNQVpNLGNBQWM7TUFBRSxnQkFBZ0I7O0FBY3ZDLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksQ0FBQyxLQUFLLENBQUM7R0FBQSxDQUFDLENBQUM7QUFDM0QsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsTUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLGFBQVMsQ0FBQyxJQUFJLE1BQUEsQ0FBZCxTQUFTLHFCQUFTLGdCQUFnQixFQUFDLENBQUM7R0FDckMsTUFBTSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdEMsaUJBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztHQUN0Qzs7QUFFRCxTQUFPLGFBQWEsQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxLQUFhLEVBQVc7QUFDMUMsMkJBQVUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6QyxTQUFPLFFBQVEsS0FBSyxHQUFHLENBQUM7Q0FDekI7O0FBeUJELFNBQVMsYUFBYSxHQUFXOzs7QUFHL0IsU0FBTyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztDQUMzRjs7QUFFRCxTQUFTLGlCQUFpQixHQUFZOzs7QUFHcEMsTUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2YsV0FBUyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBaUI7R0FDeEY7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsaUJBQWlCLENBQUMsU0FBaUIsRUFBb0I7QUFDOUQsTUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN0QyxzQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDNUY7QUFDRCxTQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUMxQzs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixlQUFhLEVBQWIsYUFBYTtBQUNiLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixpQkFBZSxFQUFmLGVBQWU7QUFDZix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLGlCQUFlLEVBQWYsZUFBZTtDQUNoQixDQUFDIiwiZmlsZSI6IkZsb3dIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHthc3luY0V4ZWN1dGUsIGZpbmROZWFyZXN0RmlsZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IExSVSA9IHJlcXVpcmUoJ2xydS1jYWNoZScpO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IGZsb3dDb25maWdEaXJDYWNoZSA9IExSVSh7XG4gIG1heDogMTAsXG4gIGxlbmd0aDogZnVuY3Rpb24gKG4pIHsgcmV0dXJuIG4ubGVuZ3RoOyB9LFxuICBtYXhBZ2U6IDEwMDAgKiAzMCwgLy8zMCBzZWNvbmRzXG59KTtcbmNvbnN0IGZsb3dQYXRoQ2FjaGUgPSBMUlUoe1xuICBtYXg6IDEwLFxuICBtYXhBZ2U6IDEwMDAgKiAzMCwgLy8gMzAgc2Vjb25kc1xufSk7XG5cbmZ1bmN0aW9uIGluc2VydEF1dG9jb21wbGV0ZVRva2VuKGNvbnRlbnRzOiBzdHJpbmcsIGxpbmU6IG51bWJlciwgY29sOiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IGNvbnRlbnRzLnNwbGl0KCdcXG4nKTtcbiAgbGV0IHRoZUxpbmUgPSBsaW5lc1tsaW5lXTtcbiAgdGhlTGluZSA9IHRoZUxpbmUuc3Vic3RyaW5nKDAsIGNvbCkgKyAnQVVUTzMzMicgKyB0aGVMaW5lLnN1YnN0cmluZyhjb2wpO1xuICBsaW5lc1tsaW5lXSA9IHRoZUxpbmU7XG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhdXRvY29tcGxldGUgaXRlbSBmcm9tIEZsb3cgYW5kIHJldHVybnMgYSB2YWxpZCBhdXRvY29tcGxldGUtcGx1c1xuICogcmVzcG9uc2UsIGFzIGRvY3VtZW50ZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtKHJlcGxhY2VtZW50UHJlZml4OiBzdHJpbmcsIGZsb3dJdGVtOiBPYmplY3QpOiBPYmplY3Qge1xuICAvLyBUcnVuY2F0ZSBsb25nIHR5cGVzIGZvciByZWFkYWJpbGl0eVxuICBjb25zdCBkZXNjcmlwdGlvbiA9IGZsb3dJdGVtWyd0eXBlJ10ubGVuZ3RoIDwgODBcbiAgICA/IGZsb3dJdGVtWyd0eXBlJ11cbiAgICA6IGZsb3dJdGVtWyd0eXBlJ10uc3Vic3RyaW5nKDAsODApICsgJyAuLi4nO1xuICBsZXQgcmVzdWx0ID0ge1xuICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICBkaXNwbGF5VGV4dDogZmxvd0l0ZW1bJ25hbWUnXSxcbiAgICByZXBsYWNlbWVudFByZWZpeCxcbiAgfTtcbiAgY29uc3QgZnVuY0RldGFpbHMgPSBmbG93SXRlbVsnZnVuY19kZXRhaWxzJ107XG4gIGlmIChmdW5jRGV0YWlscykge1xuICAgIC8vIFRoZSBwYXJhbWV0ZXJzIGluIGh1bWFuLXJlYWRhYmxlIGZvcm0gZm9yIHVzZSBvbiB0aGUgcmlnaHQgbGFiZWwuXG4gICAgY29uc3QgcmlnaHRQYXJhbVN0cmluZ3MgPSBmdW5jRGV0YWlsc1sncGFyYW1zJ11cbiAgICAgIC5tYXAocGFyYW0gPT4gYCR7cGFyYW1bJ25hbWUnXX06ICR7cGFyYW1bJ3R5cGUnXX1gKTtcbiAgICBjb25zdCBzbmlwcGV0U3RyaW5nID0gZ2V0U25pcHBldFN0cmluZyhmdW5jRGV0YWlsc1sncGFyYW1zJ10ubWFwKHBhcmFtID0+IHBhcmFtWyduYW1lJ10pKTtcbiAgICByZXN1bHQgPSB7XG4gICAgICAuLi5yZXN1bHQsXG4gICAgICBsZWZ0TGFiZWw6IGZ1bmNEZXRhaWxzWydyZXR1cm5fdHlwZSddLFxuICAgICAgcmlnaHRMYWJlbDogYCgke3JpZ2h0UGFyYW1TdHJpbmdzLmpvaW4oJywgJyl9KWAsXG4gICAgICBzbmlwcGV0OiBgJHtmbG93SXRlbVsnbmFtZSddfSgke3NuaXBwZXRTdHJpbmd9KWAsXG4gICAgICB0eXBlOiAnZnVuY3Rpb24nLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgLi4ucmVzdWx0LFxuICAgICAgcmlnaHRMYWJlbDogZmxvd0l0ZW1bJ3R5cGUnXSxcbiAgICAgIHRleHQ6IGZsb3dJdGVtWyduYW1lJ10sXG4gICAgfTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXRTbmlwcGV0U3RyaW5nKHBhcmFtTmFtZXM6IEFycmF5PHN0cmluZz4pOiBzdHJpbmcge1xuICBjb25zdCBncm91cGVkUGFyYW1zID0gZ3JvdXBQYXJhbU5hbWVzKHBhcmFtTmFtZXMpO1xuICAvLyBUaGUgcGFyYW1ldGVycyB0dXJuZWQgaW50byBzbmlwcGV0IHN0cmluZ3MuXG4gIGNvbnN0IHNuaXBwZXRQYXJhbVN0cmluZ3MgPSBncm91cGVkUGFyYW1zXG4gICAgLm1hcChwYXJhbXMgPT4gcGFyYW1zLmpvaW4oJywgJykpXG4gICAgLm1hcCgocGFyYW0sIGkpID0+IGBcXCR7JHtpICsgMX06JHtwYXJhbX19YCk7XG4gIHJldHVybiBzbmlwcGV0UGFyYW1TdHJpbmdzLmpvaW4oJywgJyk7XG59XG5cbi8qKlxuICogR3JvdXAgdGhlIHBhcmFtZXRlciBuYW1lcyBzbyB0aGF0IGFsbCBvZiB0aGUgdHJhaWxpbmcgb3B0aW9uYWwgcGFyYW1ldGVycyBhcmUgdG9nZXRoZXIgd2l0aCB0aGVcbiAqIGxhc3Qgbm9uLW9wdGlvbmFsIHBhcmFtZXRlci4gVGhhdCBtYWtlcyBpdCBlYXN5IHRvIGlnbm9yZSB0aGUgb3B0aW9uYWwgcGFyYW1ldGVycywgc2luY2UgdGhleVxuICogd2lsbCBiZSBzZWxlY3RlZCBhbG9uZyB3aXRoIHRoZSBsYXN0IG5vbi1vcHRpb25hbCBwYXJhbWV0ZXIgYW5kIHlvdSBjYW4ganVzdCB0eXBlIHRvIG92ZXJ3cml0ZVxuICogdGhlbS5cbiAqL1xuZnVuY3Rpb24gZ3JvdXBQYXJhbU5hbWVzKHBhcmFtTmFtZXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxBcnJheTxzdHJpbmc+PiB7XG4gIC8vIFNwbGl0IHRoZSBwYXJhbWV0ZXJzIGludG8gdHdvIGdyb3VwcyAtLSBhbGwgb2YgdGhlIHRyYWlsaW5nIG9wdGlvbmFsIHBhcmFtYXRlcnMsIGFuZCB0aGUgcmVzdFxuICAvLyBvZiB0aGUgcGFyYW1ldGVycy4gVHJhaWxpbmcgb3B0aW9uYWwgbWVhbnMgYWxsIG9wdGlvbmFsIHBhcmFtZXRlcnMgdGhhdCBoYXZlIG9ubHkgb3B0aW9uYWxcbiAgLy8gcGFyYW1ldGVycyBhZnRlciB0aGVtLlxuICBjb25zdCBbb3JkaW5hcnlQYXJhbXMsIHRyYWlsaW5nT3B0aW9uYWxdID1cbiAgICBwYXJhbU5hbWVzLnJlZHVjZVJpZ2h0KChbb3JkaW5hcnksIG9wdGlvbmFsXSwgcGFyYW0pID0+IHtcbiAgICAgIC8vIElmIHRoZXJlIGhhdmUgb25seSBiZWVuIG9wdGlvbmFsIHBhcmFtcyBzbyBmYXIsIGFuZCB0aGlzIG9uZSBpcyBvcHRpb25hbCwgYWRkIGl0IHRvIHRoZVxuICAgICAgLy8gbGlzdCBvZiB0cmFpbGluZyBvcHRpb25hbCBwYXJhbXMuXG4gICAgICBpZiAoaXNPcHRpb25hbChwYXJhbSkgJiYgb3JkaW5hcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG9wdGlvbmFsLnVuc2hpZnQocGFyYW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3JkaW5hcnkudW5zaGlmdChwYXJhbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW29yZGluYXJ5LCBvcHRpb25hbF07XG4gICAgfSxcbiAgICBbW10sIFtdXVxuICApO1xuXG4gIGNvbnN0IGdyb3VwZWRQYXJhbXMgPSBvcmRpbmFyeVBhcmFtcy5tYXAocGFyYW0gPT4gW3BhcmFtXSk7XG4gIGNvbnN0IGxhc3RQYXJhbSA9IGdyb3VwZWRQYXJhbXNbZ3JvdXBlZFBhcmFtcy5sZW5ndGggLSAxXTtcbiAgaWYgKGxhc3RQYXJhbSAhPSBudWxsKSB7XG4gICAgbGFzdFBhcmFtLnB1c2goLi4udHJhaWxpbmdPcHRpb25hbCk7XG4gIH0gZWxzZSBpZiAodHJhaWxpbmdPcHRpb25hbC5sZW5ndGggPiAwKSB7XG4gICAgZ3JvdXBlZFBhcmFtcy5wdXNoKHRyYWlsaW5nT3B0aW9uYWwpO1xuICB9XG5cbiAgcmV0dXJuIGdyb3VwZWRQYXJhbXM7XG59XG5cbmZ1bmN0aW9uIGlzT3B0aW9uYWwocGFyYW06IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpbnZhcmlhbnQocGFyYW0ubGVuZ3RoID4gMCk7XG4gIGNvbnN0IGxhc3RDaGFyID0gcGFyYW1bcGFyYW0ubGVuZ3RoIC0gMV07XG4gIHJldHVybiBsYXN0Q2hhciA9PT0gJz8nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpc0Zsb3dJbnN0YWxsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGZsb3dQYXRoID0gZ2V0UGF0aFRvRmxvdygpO1xuICBpZiAoIWZsb3dQYXRoQ2FjaGUuaGFzKGZsb3dQYXRoKSkge1xuICAgIGZsb3dQYXRoQ2FjaGUuc2V0KGZsb3dQYXRoLCBhd2FpdCBjYW5GaW5kRmxvdyhmbG93UGF0aCkpO1xuICB9XG5cbiAgcmV0dXJuIGZsb3dQYXRoQ2FjaGUuZ2V0KGZsb3dQYXRoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FuRmluZEZsb3coZmxvd1BhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGF3YWl0IGFzeW5jRXhlY3V0ZSgnd2hpY2gnLCBbZmxvd1BhdGhdKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEByZXR1cm4gVGhlIHBhdGggdG8gRmxvdyBvbiB0aGUgdXNlcidzIG1hY2hpbmUuIEl0IGlzIHJlY29tbWVuZGVkIG5vdCB0byBjYWNoZSB0aGUgcmVzdWx0IG9mIHRoaXNcbiAqICAgZnVuY3Rpb24gaW4gY2FzZSB0aGUgdXNlciB1cGRhdGVzIGhpcyBvciBoZXIgcHJlZmVyZW5jZXMgaW4gQXRvbSwgaW4gd2hpY2ggY2FzZSB0aGUgcmV0dXJuXG4gKiAgIHZhbHVlIHdpbGwgYmUgc3RhbGUuXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhUb0Zsb3coKTogc3RyaW5nIHtcbiAgLy8gJFVQRml4TWU6IFRoaXMgc2hvdWxkIHVzZSBudWNsaWRlLWZlYXR1cmVzLWNvbmZpZ1xuICAvLyBEb2VzIG5vdCBjdXJyZW50bHkgZG8gc28gYmVjYXVzZSB0aGlzIGlzIGFuIG5wbSBtb2R1bGUgdGhhdCBtYXkgcnVuIG9uIHRoZSBzZXJ2ZXIuXG4gIHJldHVybiBnbG9iYWwuYXRvbSAmJiBnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdudWNsaWRlLm51Y2xpZGUtZmxvdy5wYXRoVG9GbG93JykgfHwgJ2Zsb3cnO1xufVxuXG5mdW5jdGlvbiBnZXRTdG9wRmxvd09uRXhpdCgpOiBib29sZWFuIHtcbiAgLy8gJFVQRml4TWU6IFRoaXMgc2hvdWxkIHVzZSBudWNsaWRlLWZlYXR1cmVzLWNvbmZpZ1xuICAvLyBEb2VzIG5vdCBjdXJyZW50bHkgZG8gc28gYmVjYXVzZSB0aGlzIGlzIGFuIG5wbSBtb2R1bGUgdGhhdCBtYXkgcnVuIG9uIHRoZSBzZXJ2ZXIuXG4gIGlmIChnbG9iYWwuYXRvbSkge1xuICAgIHJldHVybiAoKGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUubnVjbGlkZS1mbG93LnN0b3BGbG93T25FeGl0Jyk6IGFueSk6IGJvb2xlYW4pO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBmaW5kRmxvd0NvbmZpZ0Rpcihsb2NhbEZpbGU6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICBpZiAoIWZsb3dDb25maWdEaXJDYWNoZS5oYXMobG9jYWxGaWxlKSkge1xuICAgIGZsb3dDb25maWdEaXJDYWNoZS5zZXQobG9jYWxGaWxlLCBmaW5kTmVhcmVzdEZpbGUoJy5mbG93Y29uZmlnJywgcGF0aC5kaXJuYW1lKGxvY2FsRmlsZSkpKTtcbiAgfVxuICByZXR1cm4gZmxvd0NvbmZpZ0RpckNhY2hlLmdldChsb2NhbEZpbGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZEZsb3dDb25maWdEaXIsXG4gIGdldFBhdGhUb0Zsb3csXG4gIGdldFN0b3BGbG93T25FeGl0LFxuICBpbnNlcnRBdXRvY29tcGxldGVUb2tlbixcbiAgaXNGbG93SW5zdGFsbGVkLFxuICBwcm9jZXNzQXV0b2NvbXBsZXRlSXRlbSxcbiAgZ3JvdXBQYXJhbU5hbWVzLFxufTtcbiJdfQ==