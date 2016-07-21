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

exports.getNPMHyperclickProvider = getNPMHyperclickProvider;
exports.getPackageUrlForRange = getPackageUrlForRange;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _semver2;

function _semver() {
  return _semver2 = _interopRequireDefault(require('semver'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _shell2;

function _shell() {
  return _shell2 = _interopRequireDefault(require('shell'));
}

var _parsing2;

function _parsing() {
  return _parsing2 = require('./parsing');
}

var DEPENDENCY_PROPERTIES = new Set(['dependencies', 'devDependencies', 'optionalDependencies']);

function getNPMHyperclickProvider() {
  return npmHyperclickProvider;
}

var npmHyperclickProvider = {
  priority: 1,
  providerName: 'npm-package-json',
  getSuggestionForWord: getSuggestionForWord,
  // Capture just text in quotes
  wordRegExp: /"[^"]*"/g
};

function getSuggestionForWord(textEditor, text, range) {

  if (text === '' || !isPackageJson(textEditor)) {
    return Promise.resolve(null);
  }

  var packageUrl = getPackageUrlForRange(textEditor.getText(), text, range);

  if (packageUrl == null) {
    return Promise.resolve(null);
  }

  var suggestion = {
    range: range,
    callback: function callback() {
      (_shell2 || _shell()).default.openExternal(packageUrl);
    }
  };
  return Promise.resolve(suggestion);
}

// Exported for testing. We could derive the token from the json text and the range, but since
// hyperclick provides it we may as well use it.

function getPackageUrlForRange(json, token, range) {
  var version = getDependencyVersion(json, range);
  if (version == null) {
    return null;
  }

  // Strip off the quotes
  var packageName = token.substring(1, token.length - 1);

  return getPackageUrl(packageName, version);
}

function isPackageJson(textEditor) {
  var scopeName = textEditor.getGrammar().scopeName;
  var filePath = textEditor.getPath();
  return scopeName === 'source.json' && filePath != null && (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath) === 'package.json';
}

function getPackageUrl(packageName, version) {
  if ((_semver2 || _semver()).default.valid(version)) {
    return 'https://www.npmjs.com/package/' + packageName + '/';
  }

  // - optionally prefixed with 'github:' (but don't capture that)
  // - all captured together:
  //   - username: alphanumeric characters, plus underscores and dashes
  //   - slash
  //   - repo name: same as username
  // - optionally followed by a revision:
  //   - starts with a hash (not captured)
  //   - then alphanumeric characters, underscores, dashes, periods (captured)
  var githubRegex = /^(?:github:)?([\w-]+\/[\w-]+)(?:#([\w-.]+))?$/;
  var githubMatch = version.match(githubRegex);
  if (githubMatch != null) {
    var commit = githubMatch[2];
    var commitSuffix = commit == null ? '' : '/tree/' + commit;
    return 'https://github.com/' + githubMatch[1] + commitSuffix;
  }

  return null;
}

// Return the version string, if it exists
function getDependencyVersion(json, range) {
  var ast = (0, (_parsing2 || _parsing()).parseJSON)(json);
  if (ast == null) {
    // parse error
    return null;
  }
  var pathToNode = getPathToNodeForRange(ast, range);

  if (pathToNode != null && pathToNode.length === 2 && DEPENDENCY_PROPERTIES.has(pathToNode[0].key.value) && isValidVersion(pathToNode[1].value)) {
    var valueNode = pathToNode[1].value;
    if (isValidVersion(valueNode)) {
      return valueNode.value;
    } else {
      return null;
    }
  }
  return null;
}

function isValidVersion(valueASTNode) {
  return valueASTNode.type === 'Literal' && typeof valueASTNode.value === 'string';
}

// return an array of property AST nodes
function getPathToNodeForRange(objectExpression, range) {
  var properties = objectExpression.properties;
  if (properties == null) {
    return null;
  }
  for (var property of properties) {
    var propertyRange = (0, (_parsing2 || _parsing()).babelLocToRange)(property.loc);
    if (propertyRange.containsRange(range)) {
      var keyRange = (0, (_parsing2 || _parsing()).babelLocToRange)(property.key.loc);
      if (keyRange.isEqual(range)) {
        return [property];
      }
      var subPath = getPathToNodeForRange(property.value, range);
      if (subPath == null) {
        return null;
      }
      subPath.unshift(property);
      return subPath;
    }
  }
  return null;
}