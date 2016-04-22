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
var fsPromise = _require.fsPromise;

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
    var flowConfigDir = fsPromise.findNearestFile('.flowconfig', path.dirname(localFile));
    flowConfigDirCache.set(localFile, flowConfigDir);
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
//# sourceMappingURL=data:application/json;base64,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Ozs7QUFHL0IsU0FBTyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztDQUMzRjs7QUFFRCxTQUFTLGlCQUFpQixHQUFZOzs7QUFHcEMsTUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2YsV0FBUyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBaUI7R0FDeEY7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsaUJBQWlCLENBQUMsU0FBaUIsRUFBb0I7QUFDOUQsTUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN0QyxRQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDeEYsc0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztHQUNsRDtBQUNELFNBQU8sa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzFDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLGVBQWEsRUFBYixhQUFhO0FBQ2IsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLGlCQUFlLEVBQWYsZUFBZTtBQUNmLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsaUJBQWUsRUFBZixlQUFlO0NBQ2hCLENBQUMiLCJmaWxlIjoiRmxvd0hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qge2FzeW5jRXhlY3V0ZSwgZnNQcm9taXNlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3QgTFJVID0gcmVxdWlyZSgnbHJ1LWNhY2hlJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgZmxvd0NvbmZpZ0RpckNhY2hlID0gTFJVKHtcbiAgbWF4OiAxMCxcbiAgbGVuZ3RoOiBmdW5jdGlvbihuKSB7IHJldHVybiBuLmxlbmd0aDsgfSxcbiAgbWF4QWdlOiAxMDAwICogMzAsIC8vMzAgc2Vjb25kc1xufSk7XG5jb25zdCBmbG93UGF0aENhY2hlID0gTFJVKHtcbiAgbWF4OiAxMCxcbiAgbWF4QWdlOiAxMDAwICogMzAsIC8vIDMwIHNlY29uZHNcbn0pO1xuXG5mdW5jdGlvbiBpbnNlcnRBdXRvY29tcGxldGVUb2tlbihjb250ZW50czogc3RyaW5nLCBsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSBjb250ZW50cy5zcGxpdCgnXFxuJyk7XG4gIGxldCB0aGVMaW5lID0gbGluZXNbbGluZV07XG4gIHRoZUxpbmUgPSB0aGVMaW5lLnN1YnN0cmluZygwLCBjb2wpICsgJ0FVVE8zMzInICsgdGhlTGluZS5zdWJzdHJpbmcoY29sKTtcbiAgbGluZXNbbGluZV0gPSB0aGVMaW5lO1xuICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXV0b2NvbXBsZXRlIGl0ZW0gZnJvbSBGbG93IGFuZCByZXR1cm5zIGEgdmFsaWQgYXV0b2NvbXBsZXRlLXBsdXNcbiAqIHJlc3BvbnNlLCBhcyBkb2N1bWVudGVkIGhlcmU6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSVxuICovXG5mdW5jdGlvbiBwcm9jZXNzQXV0b2NvbXBsZXRlSXRlbShyZXBsYWNlbWVudFByZWZpeDogc3RyaW5nLCBmbG93SXRlbTogT2JqZWN0KTogT2JqZWN0IHtcbiAgLy8gVHJ1bmNhdGUgbG9uZyB0eXBlcyBmb3IgcmVhZGFiaWxpdHlcbiAgY29uc3QgZGVzY3JpcHRpb24gPSBmbG93SXRlbVsndHlwZSddLmxlbmd0aCA8IDgwXG4gICAgPyBmbG93SXRlbVsndHlwZSddXG4gICAgOiBmbG93SXRlbVsndHlwZSddLnN1YnN0cmluZygwLDgwKSArICcgLi4uJztcbiAgbGV0IHJlc3VsdCA9IHtcbiAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgZGlzcGxheVRleHQ6IGZsb3dJdGVtWyduYW1lJ10sXG4gICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gIH07XG4gIGNvbnN0IGZ1bmNEZXRhaWxzID0gZmxvd0l0ZW1bJ2Z1bmNfZGV0YWlscyddO1xuICBpZiAoZnVuY0RldGFpbHMpIHtcbiAgICAvLyBUaGUgcGFyYW1ldGVycyBpbiBodW1hbi1yZWFkYWJsZSBmb3JtIGZvciB1c2Ugb24gdGhlIHJpZ2h0IGxhYmVsLlxuICAgIGNvbnN0IHJpZ2h0UGFyYW1TdHJpbmdzID0gZnVuY0RldGFpbHNbJ3BhcmFtcyddXG4gICAgICAubWFwKHBhcmFtID0+IGAke3BhcmFtWyduYW1lJ119OiAke3BhcmFtWyd0eXBlJ119YCk7XG4gICAgY29uc3Qgc25pcHBldFN0cmluZyA9IGdldFNuaXBwZXRTdHJpbmcoZnVuY0RldGFpbHNbJ3BhcmFtcyddLm1hcChwYXJhbSA9PiBwYXJhbVsnbmFtZSddKSk7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgLi4ucmVzdWx0LFxuICAgICAgbGVmdExhYmVsOiBmdW5jRGV0YWlsc1sncmV0dXJuX3R5cGUnXSxcbiAgICAgIHJpZ2h0TGFiZWw6IGAoJHtyaWdodFBhcmFtU3RyaW5ncy5qb2luKCcsICcpfSlgLFxuICAgICAgc25pcHBldDogYCR7Zmxvd0l0ZW1bJ25hbWUnXX0oJHtzbmlwcGV0U3RyaW5nfSlgLFxuICAgICAgdHlwZTogJ2Z1bmN0aW9uJyxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIC4uLnJlc3VsdCxcbiAgICAgIHJpZ2h0TGFiZWw6IGZsb3dJdGVtWyd0eXBlJ10sXG4gICAgICB0ZXh0OiBmbG93SXRlbVsnbmFtZSddLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0U25pcHBldFN0cmluZyhwYXJhbU5hbWVzOiBBcnJheTxzdHJpbmc+KTogc3RyaW5nIHtcbiAgY29uc3QgZ3JvdXBlZFBhcmFtcyA9IGdyb3VwUGFyYW1OYW1lcyhwYXJhbU5hbWVzKTtcbiAgLy8gVGhlIHBhcmFtZXRlcnMgdHVybmVkIGludG8gc25pcHBldCBzdHJpbmdzLlxuICBjb25zdCBzbmlwcGV0UGFyYW1TdHJpbmdzID0gZ3JvdXBlZFBhcmFtc1xuICAgIC5tYXAocGFyYW1zID0+IHBhcmFtcy5qb2luKCcsICcpKVxuICAgIC5tYXAoKHBhcmFtLCBpKSA9PiBgXFwkeyR7aSArIDF9OiR7cGFyYW19fWApO1xuICByZXR1cm4gc25pcHBldFBhcmFtU3RyaW5ncy5qb2luKCcsICcpO1xufVxuXG4vKipcbiAqIEdyb3VwIHRoZSBwYXJhbWV0ZXIgbmFtZXMgc28gdGhhdCBhbGwgb2YgdGhlIHRyYWlsaW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHRvZ2V0aGVyIHdpdGggdGhlXG4gKiBsYXN0IG5vbi1vcHRpb25hbCBwYXJhbWV0ZXIuIFRoYXQgbWFrZXMgaXQgZWFzeSB0byBpZ25vcmUgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMsIHNpbmNlIHRoZXlcbiAqIHdpbGwgYmUgc2VsZWN0ZWQgYWxvbmcgd2l0aCB0aGUgbGFzdCBub24tb3B0aW9uYWwgcGFyYW1ldGVyIGFuZCB5b3UgY2FuIGp1c3QgdHlwZSB0byBvdmVyd3JpdGVcbiAqIHRoZW0uXG4gKi9cbmZ1bmN0aW9uIGdyb3VwUGFyYW1OYW1lcyhwYXJhbU5hbWVzOiBBcnJheTxzdHJpbmc+KTogQXJyYXk8QXJyYXk8c3RyaW5nPj4ge1xuICAvLyBTcGxpdCB0aGUgcGFyYW1ldGVycyBpbnRvIHR3byBncm91cHMgLS0gYWxsIG9mIHRoZSB0cmFpbGluZyBvcHRpb25hbCBwYXJhbWF0ZXJzLCBhbmQgdGhlIHJlc3RcbiAgLy8gb2YgdGhlIHBhcmFtZXRlcnMuIFRyYWlsaW5nIG9wdGlvbmFsIG1lYW5zIGFsbCBvcHRpb25hbCBwYXJhbWV0ZXJzIHRoYXQgaGF2ZSBvbmx5IG9wdGlvbmFsXG4gIC8vIHBhcmFtZXRlcnMgYWZ0ZXIgdGhlbS5cbiAgY29uc3QgW29yZGluYXJ5UGFyYW1zLCB0cmFpbGluZ09wdGlvbmFsXSA9XG4gICAgcGFyYW1OYW1lcy5yZWR1Y2VSaWdodCgoW29yZGluYXJ5LCBvcHRpb25hbF0sIHBhcmFtKSA9PiB7XG4gICAgICAvLyBJZiB0aGVyZSBoYXZlIG9ubHkgYmVlbiBvcHRpb25hbCBwYXJhbXMgc28gZmFyLCBhbmQgdGhpcyBvbmUgaXMgb3B0aW9uYWwsIGFkZCBpdCB0byB0aGVcbiAgICAgIC8vIGxpc3Qgb2YgdHJhaWxpbmcgb3B0aW9uYWwgcGFyYW1zLlxuICAgICAgaWYgKGlzT3B0aW9uYWwocGFyYW0pICYmIG9yZGluYXJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBvcHRpb25hbC51bnNoaWZ0KHBhcmFtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9yZGluYXJ5LnVuc2hpZnQocGFyYW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtvcmRpbmFyeSwgb3B0aW9uYWxdO1xuICAgIH0sXG4gICAgW1tdLCBbXV1cbiAgKTtcblxuICBjb25zdCBncm91cGVkUGFyYW1zID0gb3JkaW5hcnlQYXJhbXMubWFwKHBhcmFtID0+IFtwYXJhbV0pO1xuICBjb25zdCBsYXN0UGFyYW0gPSBncm91cGVkUGFyYW1zW2dyb3VwZWRQYXJhbXMubGVuZ3RoIC0gMV07XG4gIGlmIChsYXN0UGFyYW0gIT0gbnVsbCkge1xuICAgIGxhc3RQYXJhbS5wdXNoKC4uLnRyYWlsaW5nT3B0aW9uYWwpO1xuICB9IGVsc2UgaWYgKHRyYWlsaW5nT3B0aW9uYWwubGVuZ3RoID4gMCkge1xuICAgIGdyb3VwZWRQYXJhbXMucHVzaCh0cmFpbGluZ09wdGlvbmFsKTtcbiAgfVxuXG4gIHJldHVybiBncm91cGVkUGFyYW1zO1xufVxuXG5mdW5jdGlvbiBpc09wdGlvbmFsKHBhcmFtOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaW52YXJpYW50KHBhcmFtLmxlbmd0aCA+IDApO1xuICBjb25zdCBsYXN0Q2hhciA9IHBhcmFtW3BhcmFtLmxlbmd0aCAtIDFdO1xuICByZXR1cm4gbGFzdENoYXIgPT09ICc/Jztcbn1cblxuYXN5bmMgZnVuY3Rpb24gaXNGbG93SW5zdGFsbGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBmbG93UGF0aCA9IGdldFBhdGhUb0Zsb3coKTtcbiAgaWYgKCFmbG93UGF0aENhY2hlLmhhcyhmbG93UGF0aCkpIHtcbiAgICBmbG93UGF0aENhY2hlLnNldChmbG93UGF0aCwgYXdhaXQgY2FuRmluZEZsb3coZmxvd1BhdGgpKTtcbiAgfVxuXG4gIHJldHVybiBmbG93UGF0aENhY2hlLmdldChmbG93UGF0aCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbkZpbmRGbG93KGZsb3dQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBhc3luY0V4ZWN1dGUoJ3doaWNoJywgW2Zsb3dQYXRoXSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBwYXRoIHRvIEZsb3cgb24gdGhlIHVzZXIncyBtYWNoaW5lLiBJdCBpcyByZWNvbW1lbmRlZCBub3QgdG8gY2FjaGUgdGhlIHJlc3VsdCBvZiB0aGlzXG4gKiAgIGZ1bmN0aW9uIGluIGNhc2UgdGhlIHVzZXIgdXBkYXRlcyBoaXMgb3IgaGVyIHByZWZlcmVuY2VzIGluIEF0b20sIGluIHdoaWNoIGNhc2UgdGhlIHJldHVyblxuICogICB2YWx1ZSB3aWxsIGJlIHN0YWxlLlxuICovXG5mdW5jdGlvbiBnZXRQYXRoVG9GbG93KCk6IHN0cmluZyB7XG4gIC8vICRVUEZpeE1lOiBUaGlzIHNob3VsZCB1c2UgbnVjbGlkZS1mZWF0dXJlcy1jb25maWdcbiAgLy8gRG9lcyBub3QgY3VycmVudGx5IGRvIHNvIGJlY2F1c2UgdGhpcyBpcyBhbiBucG0gbW9kdWxlIHRoYXQgbWF5IHJ1biBvbiB0aGUgc2VydmVyLlxuICByZXR1cm4gZ2xvYmFsLmF0b20gJiYgZ2xvYmFsLmF0b20uY29uZmlnLmdldCgnbnVjbGlkZS5udWNsaWRlLWZsb3cucGF0aFRvRmxvdycpIHx8ICdmbG93Jztcbn1cblxuZnVuY3Rpb24gZ2V0U3RvcEZsb3dPbkV4aXQoKTogYm9vbGVhbiB7XG4gIC8vICRVUEZpeE1lOiBUaGlzIHNob3VsZCB1c2UgbnVjbGlkZS1mZWF0dXJlcy1jb25maWdcbiAgLy8gRG9lcyBub3QgY3VycmVudGx5IGRvIHNvIGJlY2F1c2UgdGhpcyBpcyBhbiBucG0gbW9kdWxlIHRoYXQgbWF5IHJ1biBvbiB0aGUgc2VydmVyLlxuICBpZiAoZ2xvYmFsLmF0b20pIHtcbiAgICByZXR1cm4gKChnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdudWNsaWRlLm51Y2xpZGUtZmxvdy5zdG9wRmxvd09uRXhpdCcpOiBhbnkpOiBib29sZWFuKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZmluZEZsb3dDb25maWdEaXIobG9jYWxGaWxlOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgaWYgKCFmbG93Q29uZmlnRGlyQ2FjaGUuaGFzKGxvY2FsRmlsZSkpIHtcbiAgICBjb25zdCBmbG93Q29uZmlnRGlyID0gZnNQcm9taXNlLmZpbmROZWFyZXN0RmlsZSgnLmZsb3djb25maWcnLCBwYXRoLmRpcm5hbWUobG9jYWxGaWxlKSk7XG4gICAgZmxvd0NvbmZpZ0RpckNhY2hlLnNldChsb2NhbEZpbGUsIGZsb3dDb25maWdEaXIpO1xuICB9XG4gIHJldHVybiBmbG93Q29uZmlnRGlyQ2FjaGUuZ2V0KGxvY2FsRmlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kRmxvd0NvbmZpZ0RpcixcbiAgZ2V0UGF0aFRvRmxvdyxcbiAgZ2V0U3RvcEZsb3dPbkV4aXQsXG4gIGluc2VydEF1dG9jb21wbGV0ZVRva2VuLFxuICBpc0Zsb3dJbnN0YWxsZWQsXG4gIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtLFxuICBncm91cFBhcmFtTmFtZXMsXG59O1xuIl19