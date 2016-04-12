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
//# sourceMappingURL=data:application/json;base64,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Ozs7QUFHL0IsU0FBTyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztDQUMzRjs7QUFFRCxTQUFTLGlCQUFpQixHQUFZOzs7QUFHcEMsTUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2YsV0FBUyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBaUI7R0FDeEY7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsaUJBQWlCLENBQUMsU0FBaUIsRUFBb0I7QUFDOUQsTUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN0QyxzQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDNUY7QUFDRCxTQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUMxQzs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixlQUFhLEVBQWIsYUFBYTtBQUNiLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixpQkFBZSxFQUFmLGVBQWU7QUFDZix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLGlCQUFlLEVBQWYsZUFBZTtDQUNoQixDQUFDIiwiZmlsZSI6IkZsb3dIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHthc3luY0V4ZWN1dGUsIGZpbmROZWFyZXN0RmlsZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IExSVSA9IHJlcXVpcmUoJ2xydS1jYWNoZScpO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IGZsb3dDb25maWdEaXJDYWNoZSA9IExSVSh7XG4gIG1heDogMTAsXG4gIGxlbmd0aDogZnVuY3Rpb24obikgeyByZXR1cm4gbi5sZW5ndGg7IH0sXG4gIG1heEFnZTogMTAwMCAqIDMwLCAvLzMwIHNlY29uZHNcbn0pO1xuY29uc3QgZmxvd1BhdGhDYWNoZSA9IExSVSh7XG4gIG1heDogMTAsXG4gIG1heEFnZTogMTAwMCAqIDMwLCAvLyAzMCBzZWNvbmRzXG59KTtcblxuZnVuY3Rpb24gaW5zZXJ0QXV0b2NvbXBsZXRlVG9rZW4oY29udGVudHM6IHN0cmluZywgbGluZTogbnVtYmVyLCBjb2w6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gY29udGVudHMuc3BsaXQoJ1xcbicpO1xuICBsZXQgdGhlTGluZSA9IGxpbmVzW2xpbmVdO1xuICB0aGVMaW5lID0gdGhlTGluZS5zdWJzdHJpbmcoMCwgY29sKSArICdBVVRPMzMyJyArIHRoZUxpbmUuc3Vic3RyaW5nKGNvbCk7XG4gIGxpbmVzW2xpbmVdID0gdGhlTGluZTtcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGF1dG9jb21wbGV0ZSBpdGVtIGZyb20gRmxvdyBhbmQgcmV0dXJucyBhIHZhbGlkIGF1dG9jb21wbGV0ZS1wbHVzXG4gKiByZXNwb25zZSwgYXMgZG9jdW1lbnRlZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUElcbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0F1dG9jb21wbGV0ZUl0ZW0ocmVwbGFjZW1lbnRQcmVmaXg6IHN0cmluZywgZmxvd0l0ZW06IE9iamVjdCk6IE9iamVjdCB7XG4gIC8vIFRydW5jYXRlIGxvbmcgdHlwZXMgZm9yIHJlYWRhYmlsaXR5XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gZmxvd0l0ZW1bJ3R5cGUnXS5sZW5ndGggPCA4MFxuICAgID8gZmxvd0l0ZW1bJ3R5cGUnXVxuICAgIDogZmxvd0l0ZW1bJ3R5cGUnXS5zdWJzdHJpbmcoMCw4MCkgKyAnIC4uLic7XG4gIGxldCByZXN1bHQgPSB7XG4gICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgIGRpc3BsYXlUZXh0OiBmbG93SXRlbVsnbmFtZSddLFxuICAgIHJlcGxhY2VtZW50UHJlZml4LFxuICB9O1xuICBjb25zdCBmdW5jRGV0YWlscyA9IGZsb3dJdGVtWydmdW5jX2RldGFpbHMnXTtcbiAgaWYgKGZ1bmNEZXRhaWxzKSB7XG4gICAgLy8gVGhlIHBhcmFtZXRlcnMgaW4gaHVtYW4tcmVhZGFibGUgZm9ybSBmb3IgdXNlIG9uIHRoZSByaWdodCBsYWJlbC5cbiAgICBjb25zdCByaWdodFBhcmFtU3RyaW5ncyA9IGZ1bmNEZXRhaWxzWydwYXJhbXMnXVxuICAgICAgLm1hcChwYXJhbSA9PiBgJHtwYXJhbVsnbmFtZSddfTogJHtwYXJhbVsndHlwZSddfWApO1xuICAgIGNvbnN0IHNuaXBwZXRTdHJpbmcgPSBnZXRTbmlwcGV0U3RyaW5nKGZ1bmNEZXRhaWxzWydwYXJhbXMnXS5tYXAocGFyYW0gPT4gcGFyYW1bJ25hbWUnXSkpO1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIC4uLnJlc3VsdCxcbiAgICAgIGxlZnRMYWJlbDogZnVuY0RldGFpbHNbJ3JldHVybl90eXBlJ10sXG4gICAgICByaWdodExhYmVsOiBgKCR7cmlnaHRQYXJhbVN0cmluZ3Muam9pbignLCAnKX0pYCxcbiAgICAgIHNuaXBwZXQ6IGAke2Zsb3dJdGVtWyduYW1lJ119KCR7c25pcHBldFN0cmluZ30pYCxcbiAgICAgIHR5cGU6ICdmdW5jdGlvbicsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSB7XG4gICAgICAuLi5yZXN1bHQsXG4gICAgICByaWdodExhYmVsOiBmbG93SXRlbVsndHlwZSddLFxuICAgICAgdGV4dDogZmxvd0l0ZW1bJ25hbWUnXSxcbiAgICB9O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldFNuaXBwZXRTdHJpbmcocGFyYW1OYW1lczogQXJyYXk8c3RyaW5nPik6IHN0cmluZyB7XG4gIGNvbnN0IGdyb3VwZWRQYXJhbXMgPSBncm91cFBhcmFtTmFtZXMocGFyYW1OYW1lcyk7XG4gIC8vIFRoZSBwYXJhbWV0ZXJzIHR1cm5lZCBpbnRvIHNuaXBwZXQgc3RyaW5ncy5cbiAgY29uc3Qgc25pcHBldFBhcmFtU3RyaW5ncyA9IGdyb3VwZWRQYXJhbXNcbiAgICAubWFwKHBhcmFtcyA9PiBwYXJhbXMuam9pbignLCAnKSlcbiAgICAubWFwKChwYXJhbSwgaSkgPT4gYFxcJHske2kgKyAxfToke3BhcmFtfX1gKTtcbiAgcmV0dXJuIHNuaXBwZXRQYXJhbVN0cmluZ3Muam9pbignLCAnKTtcbn1cblxuLyoqXG4gKiBHcm91cCB0aGUgcGFyYW1ldGVyIG5hbWVzIHNvIHRoYXQgYWxsIG9mIHRoZSB0cmFpbGluZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSB0b2dldGhlciB3aXRoIHRoZVxuICogbGFzdCBub24tb3B0aW9uYWwgcGFyYW1ldGVyLiBUaGF0IG1ha2VzIGl0IGVhc3kgdG8gaWdub3JlIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXJzLCBzaW5jZSB0aGV5XG4gKiB3aWxsIGJlIHNlbGVjdGVkIGFsb25nIHdpdGggdGhlIGxhc3Qgbm9uLW9wdGlvbmFsIHBhcmFtZXRlciBhbmQgeW91IGNhbiBqdXN0IHR5cGUgdG8gb3ZlcndyaXRlXG4gKiB0aGVtLlxuICovXG5mdW5jdGlvbiBncm91cFBhcmFtTmFtZXMocGFyYW1OYW1lczogQXJyYXk8c3RyaW5nPik6IEFycmF5PEFycmF5PHN0cmluZz4+IHtcbiAgLy8gU3BsaXQgdGhlIHBhcmFtZXRlcnMgaW50byB0d28gZ3JvdXBzIC0tIGFsbCBvZiB0aGUgdHJhaWxpbmcgb3B0aW9uYWwgcGFyYW1hdGVycywgYW5kIHRoZSByZXN0XG4gIC8vIG9mIHRoZSBwYXJhbWV0ZXJzLiBUcmFpbGluZyBvcHRpb25hbCBtZWFucyBhbGwgb3B0aW9uYWwgcGFyYW1ldGVycyB0aGF0IGhhdmUgb25seSBvcHRpb25hbFxuICAvLyBwYXJhbWV0ZXJzIGFmdGVyIHRoZW0uXG4gIGNvbnN0IFtvcmRpbmFyeVBhcmFtcywgdHJhaWxpbmdPcHRpb25hbF0gPVxuICAgIHBhcmFtTmFtZXMucmVkdWNlUmlnaHQoKFtvcmRpbmFyeSwgb3B0aW9uYWxdLCBwYXJhbSkgPT4ge1xuICAgICAgLy8gSWYgdGhlcmUgaGF2ZSBvbmx5IGJlZW4gb3B0aW9uYWwgcGFyYW1zIHNvIGZhciwgYW5kIHRoaXMgb25lIGlzIG9wdGlvbmFsLCBhZGQgaXQgdG8gdGhlXG4gICAgICAvLyBsaXN0IG9mIHRyYWlsaW5nIG9wdGlvbmFsIHBhcmFtcy5cbiAgICAgIGlmIChpc09wdGlvbmFsKHBhcmFtKSAmJiBvcmRpbmFyeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgb3B0aW9uYWwudW5zaGlmdChwYXJhbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmRpbmFyeS51bnNoaWZ0KHBhcmFtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbb3JkaW5hcnksIG9wdGlvbmFsXTtcbiAgICB9LFxuICAgIFtbXSwgW11dXG4gICk7XG5cbiAgY29uc3QgZ3JvdXBlZFBhcmFtcyA9IG9yZGluYXJ5UGFyYW1zLm1hcChwYXJhbSA9PiBbcGFyYW1dKTtcbiAgY29uc3QgbGFzdFBhcmFtID0gZ3JvdXBlZFBhcmFtc1tncm91cGVkUGFyYW1zLmxlbmd0aCAtIDFdO1xuICBpZiAobGFzdFBhcmFtICE9IG51bGwpIHtcbiAgICBsYXN0UGFyYW0ucHVzaCguLi50cmFpbGluZ09wdGlvbmFsKTtcbiAgfSBlbHNlIGlmICh0cmFpbGluZ09wdGlvbmFsLmxlbmd0aCA+IDApIHtcbiAgICBncm91cGVkUGFyYW1zLnB1c2godHJhaWxpbmdPcHRpb25hbCk7XG4gIH1cblxuICByZXR1cm4gZ3JvdXBlZFBhcmFtcztcbn1cblxuZnVuY3Rpb24gaXNPcHRpb25hbChwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGludmFyaWFudChwYXJhbS5sZW5ndGggPiAwKTtcbiAgY29uc3QgbGFzdENoYXIgPSBwYXJhbVtwYXJhbS5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIGxhc3RDaGFyID09PSAnPyc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGlzRmxvd0luc3RhbGxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgZmxvd1BhdGggPSBnZXRQYXRoVG9GbG93KCk7XG4gIGlmICghZmxvd1BhdGhDYWNoZS5oYXMoZmxvd1BhdGgpKSB7XG4gICAgZmxvd1BhdGhDYWNoZS5zZXQoZmxvd1BhdGgsIGF3YWl0IGNhbkZpbmRGbG93KGZsb3dQYXRoKSk7XG4gIH1cblxuICByZXR1cm4gZmxvd1BhdGhDYWNoZS5nZXQoZmxvd1BhdGgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjYW5GaW5kRmxvdyhmbG93UGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXN5bmNFeGVjdXRlKCd3aGljaCcsIFtmbG93UGF0aF0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQHJldHVybiBUaGUgcGF0aCB0byBGbG93IG9uIHRoZSB1c2VyJ3MgbWFjaGluZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIGNhY2hlIHRoZSByZXN1bHQgb2YgdGhpc1xuICogICBmdW5jdGlvbiBpbiBjYXNlIHRoZSB1c2VyIHVwZGF0ZXMgaGlzIG9yIGhlciBwcmVmZXJlbmNlcyBpbiBBdG9tLCBpbiB3aGljaCBjYXNlIHRoZSByZXR1cm5cbiAqICAgdmFsdWUgd2lsbCBiZSBzdGFsZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvRmxvdygpOiBzdHJpbmcge1xuICAvLyAkVVBGaXhNZTogVGhpcyBzaG91bGQgdXNlIG51Y2xpZGUtZmVhdHVyZXMtY29uZmlnXG4gIC8vIERvZXMgbm90IGN1cnJlbnRseSBkbyBzbyBiZWNhdXNlIHRoaXMgaXMgYW4gbnBtIG1vZHVsZSB0aGF0IG1heSBydW4gb24gdGhlIHNlcnZlci5cbiAgcmV0dXJuIGdsb2JhbC5hdG9tICYmIGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUubnVjbGlkZS1mbG93LnBhdGhUb0Zsb3cnKSB8fCAnZmxvdyc7XG59XG5cbmZ1bmN0aW9uIGdldFN0b3BGbG93T25FeGl0KCk6IGJvb2xlYW4ge1xuICAvLyAkVVBGaXhNZTogVGhpcyBzaG91bGQgdXNlIG51Y2xpZGUtZmVhdHVyZXMtY29uZmlnXG4gIC8vIERvZXMgbm90IGN1cnJlbnRseSBkbyBzbyBiZWNhdXNlIHRoaXMgaXMgYW4gbnBtIG1vZHVsZSB0aGF0IG1heSBydW4gb24gdGhlIHNlcnZlci5cbiAgaWYgKGdsb2JhbC5hdG9tKSB7XG4gICAgcmV0dXJuICgoZ2xvYmFsLmF0b20uY29uZmlnLmdldCgnbnVjbGlkZS5udWNsaWRlLWZsb3cuc3RvcEZsb3dPbkV4aXQnKTogYW55KTogYm9vbGVhbik7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZpbmRGbG93Q29uZmlnRGlyKGxvY2FsRmlsZTogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIGlmICghZmxvd0NvbmZpZ0RpckNhY2hlLmhhcyhsb2NhbEZpbGUpKSB7XG4gICAgZmxvd0NvbmZpZ0RpckNhY2hlLnNldChsb2NhbEZpbGUsIGZpbmROZWFyZXN0RmlsZSgnLmZsb3djb25maWcnLCBwYXRoLmRpcm5hbWUobG9jYWxGaWxlKSkpO1xuICB9XG4gIHJldHVybiBmbG93Q29uZmlnRGlyQ2FjaGUuZ2V0KGxvY2FsRmlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kRmxvd0NvbmZpZ0RpcixcbiAgZ2V0UGF0aFRvRmxvdyxcbiAgZ2V0U3RvcEZsb3dPbkV4aXQsXG4gIGluc2VydEF1dG9jb21wbGV0ZVRva2VuLFxuICBpc0Zsb3dJbnN0YWxsZWQsXG4gIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtLFxuICBncm91cFBhcmFtTmFtZXMsXG59O1xuIl19