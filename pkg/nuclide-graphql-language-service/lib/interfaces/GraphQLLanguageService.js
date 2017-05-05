/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  DocumentNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  OperationDefinitionNode,
} from 'graphql/language';
import type {GraphQLCache} from '../server/GraphQLCache';
import type {GraphQLRC, GraphQLConfig} from '../config/GraphQLConfig';
import type {
  AutocompleteSuggestionType,
  DefinitionQueryResult,
  DiagnosticType,
  Uri,
} from '../types/Types';
import type {Point} from '../utils/Range';

import {
  FRAGMENT_SPREAD,
  FRAGMENT_DEFINITION,
  OPERATION_DEFINITION,
} from 'graphql/language/kinds';

import {parse, print} from 'graphql';
import {getAutocompleteSuggestions} from './getAutocompleteSuggestions';
import {getDiagnostics as getDiagnosticsImpl} from './getDiagnostics';
import {
  getDefinitionQueryResultForFragmentSpread,
  getDefinitionQueryResultForDefinitionNode,
} from './getDefinition';
import {getASTNodeAtPoint} from '../utils/getASTNodeAtPoint';

export class GraphQLLanguageService {
  _graphQLCache: GraphQLCache;
  _graphQLRC: GraphQLRC;

  constructor(cache: GraphQLCache) {
    this._graphQLCache = cache;
    this._graphQLRC = cache.getGraphQLRC();
  }

  async getDiagnostics(
    query: string,
    filePath: Uri,
  ): Promise<Array<DiagnosticType>> {
    let source = query;
    const graphQLConfig = this._graphQLRC.getConfigByFilePath(filePath);
    // If there's a matching config, proceed to prepare to run validation
    let schema;
    let customRules;
    if (graphQLConfig && graphQLConfig.getSchemaPath()) {
      schema = await this._graphQLCache.getSchema(
        graphQLConfig.getSchemaPath(),
      );
      const fragmentDefinitions = await this._graphQLCache.getFragmentDefinitions(
        graphQLConfig,
      );
      const fragmentDependencies = await this._graphQLCache.getFragmentDependencies(
        query,
        fragmentDefinitions,
      );
      const dependenciesSource = fragmentDependencies.reduce(
        (prev, cur) => `${prev} ${print(cur.definition)}`,
        '',
      );

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

    return getDiagnosticsImpl(filePath, source, schema, customRules);
  }

  async getAutocompleteSuggestions(
    query: string,
    position: Point,
    filePath: Uri,
  ): Promise<Array<AutocompleteSuggestionType>> {
    const graphQLConfig = this._graphQLRC.getConfigByFilePath(filePath);
    let schema;
    if (graphQLConfig && graphQLConfig.getSchemaPath()) {
      schema = await this._graphQLCache.getSchema(
        graphQLConfig.getSchemaPath(),
      );

      if (schema) {
        return getAutocompleteSuggestions(schema, query, position) || [];
      }
    }
    return [];
  }

  async getDefinition(
    query: string,
    position: Point,
    filePath: Uri,
  ): Promise<?DefinitionQueryResult> {
    const graphQLConfig = this._graphQLRC.getConfigByFilePath(filePath);
    if (!graphQLConfig) {
      return null;
    }

    let ast;
    try {
      ast = parse(query);
    } catch (error) {
      return null;
    }

    const node = getASTNodeAtPoint(query, ast, position);
    if (node) {
      switch (node.kind) {
        case FRAGMENT_SPREAD:
          return this._getDefinitionForFragmentSpread(
            query,
            ast,
            node,
            filePath,
            graphQLConfig,
          );
        case FRAGMENT_DEFINITION:
        case OPERATION_DEFINITION:
          return getDefinitionQueryResultForDefinitionNode(
            filePath,
            query,
            (node: FragmentDefinitionNode | OperationDefinitionNode),
          );
        default:
          return null;
      }
    }
  }

  async _getDefinitionForFragmentSpread(
    query: string,
    ast: DocumentNode,
    node: FragmentSpreadNode,
    filePath: Uri,
    graphQLConfig: GraphQLConfig,
  ): Promise<?DefinitionQueryResult> {
    const fragmentDefinitions = await this._graphQLCache.getFragmentDefinitions(
      graphQLConfig,
    );

    const dependencies = await this._graphQLCache.getFragmentDependenciesForAST(
      ast,
      fragmentDefinitions,
    );

    const localFragDefinitions = ast.definitions.filter(
      definition => definition.kind === FRAGMENT_DEFINITION,
    );
    const typeCastedDefs = ((localFragDefinitions: any): Array<
      FragmentDefinitionNode,
    >);
    const localFragInfos = typeCastedDefs.map(definition => ({
      file: filePath,
      content: query,
      definition,
    }));

    const result = await getDefinitionQueryResultForFragmentSpread(
      query,
      node,
      dependencies.concat(localFragInfos),
    );

    return result;
  }
}
