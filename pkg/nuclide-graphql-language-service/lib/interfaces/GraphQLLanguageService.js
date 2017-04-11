'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _kinds;

function _load_kinds() {
  return _kinds = require('graphql/language/kinds');
}

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _getAutocompleteSuggestions;

function _load_getAutocompleteSuggestions() {
  return _getAutocompleteSuggestions = require('./getAutocompleteSuggestions');
}

var _getDiagnostics;

function _load_getDiagnostics() {
  return _getDiagnostics = require('./getDiagnostics');
}

var _getDefinition;

function _load_getDefinition() {
  return _getDefinition = require('./getDefinition');
}

var _getASTNodeAtPoint;

function _load_getASTNodeAtPoint() {
  return _getASTNodeAtPoint = require('../utils/getASTNodeAtPoint');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GraphQLLanguageService {

  constructor(cache) {
    this._graphQLCache = cache;
    this._graphQLRC = cache.getGraphQLRC();
  }

  getDiagnostics(query, filePath) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let source = query;
      const graphQLConfig = _this._graphQLRC.getConfigByFilePath(filePath);
      // If there's a matching config, proceed to prepare to run validation
      let schema;
      let customRules;
      if (graphQLConfig && graphQLConfig.getSchemaPath()) {
        schema = yield _this._graphQLCache.getSchema(graphQLConfig.getSchemaPath());
        const fragmentDefinitions = yield _this._graphQLCache.getFragmentDefinitions(graphQLConfig);
        const fragmentDependencies = yield _this._graphQLCache.getFragmentDependencies(query, fragmentDefinitions);
        const dependenciesSource = fragmentDependencies.reduce(function (prev, cur) {
          return `${prev} ${(0, (_graphql || _load_graphql()).print)(cur.definition)}`;
        }, '');

        source = `${source} ${dependenciesSource}`;

        // Check if there are custom validation rules to be used
        const customRulesModulePath = graphQLConfig.getCustomValidationRulesModulePath();
        if (customRulesModulePath) {
          const rulesPath = require.resolve(customRulesModulePath);
          if (rulesPath) {
            customRules = require(rulesPath)(graphQLConfig);
          }
        }
      }

      return (0, (_getDiagnostics || _load_getDiagnostics()).getDiagnostics)(filePath, source, schema, customRules);
    })();
  }

  getAutocompleteSuggestions(query, position, filePath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const graphQLConfig = _this2._graphQLRC.getConfigByFilePath(filePath);
      let schema;
      if (graphQLConfig && graphQLConfig.getSchemaPath()) {
        schema = yield _this2._graphQLCache.getSchema(graphQLConfig.getSchemaPath());

        return (0, (_getAutocompleteSuggestions || _load_getAutocompleteSuggestions()).getAutocompleteSuggestions)(schema, query, position) || [];
      }
      return [];
    })();
  }

  getDefinition(query, position, filePath) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const graphQLConfig = _this3._graphQLRC.getConfigByFilePath(filePath);
      if (!graphQLConfig) {
        return null;
      }

      let ast;
      try {
        ast = (0, (_graphql || _load_graphql()).parse)(query);
      } catch (error) {
        return null;
      }

      const node = (0, (_getASTNodeAtPoint || _load_getASTNodeAtPoint()).getASTNodeAtPoint)(query, ast, position);
      switch (node ? node.kind : null) {
        case (_kinds || _load_kinds()).FRAGMENT_SPREAD:
          return _this3._getDefinitionForFragmentSpread(query, ast, node, filePath, graphQLConfig);
        case (_kinds || _load_kinds()).FRAGMENT_DEFINITION:
        case (_kinds || _load_kinds()).OPERATION_DEFINITION:
          return (0, (_getDefinition || _load_getDefinition()).getDefinitionQueryResultForDefinitionNode)(filePath, query, node);
        default:
          return null;
      }
    })();
  }

  _getDefinitionForFragmentSpread(query, ast, node, filePath, graphQLConfig) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const fragmentDefinitions = yield _this4._graphQLCache.getFragmentDefinitions(graphQLConfig);

      const dependencies = yield _this4._graphQLCache.getFragmentDependenciesForAST(ast, fragmentDefinitions);

      const localFragDefinitions = ast.definitions.filter(function (definition) {
        return definition.kind === (_kinds || _load_kinds()).FRAGMENT_DEFINITION;
      }).map(function (definition) {
        return {
          file: filePath,
          content: query,
          definition
        };
      });

      const result = yield (0, (_getDefinition || _load_getDefinition()).getDefinitionQueryResultForFragmentSpread)(query, node, dependencies.concat(localFragDefinitions));

      return result;
    })();
  }
}
exports.GraphQLLanguageService = GraphQLLanguageService; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          */