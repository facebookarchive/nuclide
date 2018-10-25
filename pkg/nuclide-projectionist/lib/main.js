"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _micromatch() {
  const data = _interopRequireDefault(require("micromatch"));

  _micromatch = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
class Projectionist {
  constructor(rules) {
    this.rules = rules;
  }

  getAlternates(projectRelativePath) {
    return mapProjections(this.rules, projectRelativePath, (projection, matches) => {
      const alternate = projection.alternate;

      if (alternate == null) {
        return [];
      }

      const alternates = typeof alternate === 'string' ? [alternate] : alternate;
      return alternates.map(alt => replaceTargetsWithMatches(alt, matches, projectRelativePath));
    });
  }

  getType(projectRelativePath) {
    return (0, _collection().arrayCompact)(mapProjections(this.rules, projectRelativePath, projection => [projection.type]))[0];
  }

}

exports.default = Projectionist;

function mapProjections(rules, projectRelativePath, mapFn) {
  const toFlatten = Object.keys(rules).map(pattern => {
    const value = rules[pattern];

    if (isProjection(value)) {
      const innerRules = value;
      return mapProjections(innerRules, projectRelativePath, mapFn);
    } else {
      const projection = value;

      const matches = _micromatch().default.capture(normalizePattern(pattern), projectRelativePath);

      const matchesBaseName = _micromatch().default.isMatch(projectRelativePath, pattern, {
        matchBase: true
      });

      const shouldBeExcluded = projection.exclude != null && matchesAny(projectRelativePath, projection.exclude);

      if (shouldBeExcluded) {
        return;
      }

      const doesMatch = matches != null || // basename matches ('*.c' to glob any c file) are treated specially
      matchesBaseName || // an exact prefix match is okay too
      projectRelativePath.startsWith(pattern);

      if (doesMatch) {
        return mapFn(projection, matches);
      }
    }
  });
  return (0, _collection().arrayUnique)((0, _collection().arrayFlatten)((0, _collection().arrayCompact)(toFlatten)));
}

const RULES_KEY_RE = /\*|\//;

function isProjection(maybeProjection) {
  return Object.keys(maybeProjection).some(key => key.match(RULES_KEY_RE));
}

const keywordReplacements = {
  '{}': match => match,
  '{basename}': match => basenameWithoutExtension(match),
  '{dirname}': match => match
};

function replaceTargetsWithMatches(stringWithTargets, matches, projectRelativePath) {
  if (matches == null) {
    return _path.default.join(_path.default.dirname(projectRelativePath), stringWithTargets.replace('{}', basenameWithoutExtension));
  }

  const targets = stringWithTargets.match(/({.*?})/g);

  if (targets == null) {
    return stringWithTargets;
  }

  let replaced = stringWithTargets;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    if (i === targets.length - 1 && targets.length < matches.length) {
      replaced = replaced.replace(target, keywordReplacements[target](_path.default.join(...matches.slice(i))));
    } else {
      replaced = replaced.replace(target, keywordReplacements[target](matches[i]));
    }
  }

  return replaced;
} // vim-projectionist seems to treat the last star as **/* rather than *


function normalizePattern(pattern) {
  const lastStarIndex = pattern.lastIndexOf('*');

  if (lastStarIndex === -1) {
    return pattern;
  }

  return pattern.slice(0, lastStarIndex) + '**/*' + pattern.slice(lastStarIndex + 1);
}

function basenameWithoutExtension(pathString) {
  return _path.default.basename(pathString, _path.default.extname(pathString));
}

function matchesAny(projectRelativePath, patterns) {
  if (Array.isArray(patterns)) {
    return patterns.some(pattern => _micromatch().default.isMatch(projectRelativePath, normalizePattern(pattern)));
  }

  return _micromatch().default.isMatch(projectRelativePath, normalizePattern(patterns));
}