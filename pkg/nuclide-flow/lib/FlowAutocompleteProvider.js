'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getSuggestionsFromFlow = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (request) {
    const { bufferPosition, editor, prefix } = request;
    const filePath = editor.getPath();
    const contents = editor.getText();
    const replacementPrefix = getReplacementPrefix(request.prefix);
    if (filePath == null) {
      return null;
    }

    const flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);

    if (!flowService) {
      throw new Error('Invariant violation: "flowService"');
    }

    const flowSuggestions = yield flowService.flowGetAutocompleteSuggestions(filePath, contents, bufferPosition, prefix);

    if (flowSuggestions == null) {
      return null;
    }

    const atomSuggestions = yield flowSuggestions.map(function (item) {
      return processAutocompleteItem(replacementPrefix, item);
    });
    return updateResults(request, atomSuggestions);
  });

  return function getSuggestionsFromFlow(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.processAutocompleteItem = processAutocompleteItem;
exports.groupParamNames = groupParamNames;

var _fuzzaldrin;

function _load_fuzzaldrin() {
  return _fuzzaldrin = require('fuzzaldrin');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _AutocompleteCacher;

function _load_AutocompleteCacher() {
  return _AutocompleteCacher = _interopRequireDefault(require('../../commons-atom/AutocompleteCacher'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FlowAutocompleteProvider {
  constructor() {
    this._cacher = new (_AutocompleteCacher || _load_AutocompleteCacher()).default({
      getSuggestions: getSuggestionsFromFlow,
      updateResults
    });
  }

  getSuggestions(request) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('flow.autocomplete', () => this._getSuggestions(request));
  }

  _getSuggestions(request) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { prefix, activatedManually } = request;
      // We may want to make this configurable, but if it is ever higher than one we need to make sure
      // it works properly when the user manually activates it (e.g. with ctrl+space). See
      // https://github.com/atom/autocomplete-plus/issues/597
      //
      // If this is made configurable, consider using autocomplete-plus' minimumWordLength setting, as
      // per https://github.com/atom/autocomplete-plus/issues/594
      const minimumPrefixLength = 1;

      // Allows completions to immediately appear when we are completing off of object properties.
      // This also needs to be changed if minimumPrefixLength goes above 1, since after you type a
      // single alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
      const prefixHasDot = prefix.indexOf('.') !== -1;

      const replacementPrefix = getReplacementPrefix(prefix);

      if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
        return null;
      }

      if (yield (0, (_passesGK || _load_passesGK()).default)('nuclide_fast_autocomplete')) {
        return _this._cacher.getSuggestions(request);
      } else {
        return getSuggestionsFromFlow(request);
      }
    })();
  }
}

exports.default = FlowAutocompleteProvider;


function updateResults(request, results) {
  if (results == null) {
    return null;
  }
  const replacementPrefix = getReplacementPrefix(request.prefix);
  const resultsWithCurrentPrefix = results.map(result => {
    return Object.assign({}, result, {
      replacementPrefix
    });
  });
  return (0, (_fuzzaldrin || _load_fuzzaldrin()).filter)(resultsWithCurrentPrefix, replacementPrefix, { key: 'displayText' });
}

function getReplacementPrefix(originalPrefix) {
  // If it is just whitespace and punctuation, ignore it (this keeps us
  // from eating leading dots).
  return (/^[\s.]*$/.test(originalPrefix) ? '' : originalPrefix
  );
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */
function processAutocompleteItem(replacementPrefix, flowItem) {
  // Truncate long types for readability
  const description = flowItem.type.length < 80 ? flowItem.type : flowItem.type.substring(0, 80) + ' ...';
  let result = {
    description,
    displayText: flowItem.name,
    replacementPrefix
  };
  const funcDetails = flowItem.func_details;
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    const rightParamStrings = funcDetails.params.map(param => `${ param.name }: ${ param.type }`);
    const snippetString = getSnippetString(funcDetails.params.map(param => param.name));
    result = Object.assign({}, result, {
      leftLabel: funcDetails.return_type,
      rightLabel: `(${ rightParamStrings.join(', ') })`,
      snippet: `${ flowItem.name }(${ snippetString })`,
      type: 'function'
    });
  } else {
    result = Object.assign({}, result, {
      rightLabel: flowItem.type,
      text: flowItem.name
    });
  }
  return result;
}

function getSnippetString(paramNames) {
  const groupedParams = groupParamNames(paramNames);
  // The parameters turned into snippet strings.
  const snippetParamStrings = groupedParams.map(params => params.join(', ')).map((param, i) => `\${${ i + 1 }:${ param }}`);
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
  const [ordinaryParams, trailingOptional] = paramNames.reduceRight(([ordinary, optional], param) => {
    // If there have only been optional params so far, and this one is optional, add it to the
    // list of trailing optional params.
    if (isOptional(param) && ordinary.length === 0) {
      optional.unshift(param);
    } else {
      ordinary.unshift(param);
    }
    return [ordinary, optional];
  }, [[], []]);

  const groupedParams = ordinaryParams.map(param => [param]);
  const lastParam = groupedParams[groupedParams.length - 1];
  if (lastParam != null) {
    lastParam.push(...trailingOptional);
  } else if (trailingOptional.length > 0) {
    groupedParams.push(trailingOptional);
  }

  return groupedParams;
}

function isOptional(param) {
  if (!(param.length > 0)) {
    throw new Error('Invariant violation: "param.length > 0"');
  }

  const lastChar = param[param.length - 1];
  return lastChar === '?';
}