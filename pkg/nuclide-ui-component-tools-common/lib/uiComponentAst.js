/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// TODO: T29733418 Figure out a typed import for babylon or @babel/parser.
// flowlint-next-line untyped-import:off
import {File, Node, parse} from 'babylon';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {babylonOptions} from '../../nuclide-js-imports-server/src/lib/AutoImportsManager';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ComponentProp} from './types';

const babelParserOptions = babylonOptions;

export function getComponentNameFromUri(uri: NuclideUri): ?string {
  const basename = nuclideUri.basename(uri);
  const componentName = basename.split('.')[0];
  if (componentName.length === 0) {
    return null;
  }

  return componentName;
}

export function parseCode(code: string): ?File {
  try {
    return parse(code, babelParserOptions);
  } catch (_error) {
    // This will be a common error when parse fails on this string of code.
    // Logging this would likely be far more noise than signal.
    return null;
  }
}

function isComponent(node: Node): boolean {
  return node.type === 'ClassDeclaration' && node.superClass;
}

function getTypeParameterNames(
  componentName: string,
  ast: File,
): Array<string> {
  const componentNode = ast.program.body.find(
    n => isComponent(n) && n.id && n.id.name === componentName,
  );
  if (!componentNode) {
    return [];
  }
  if (
    componentNode.superTypeParameters == null ||
    componentNode.superTypeParameters.params == null
  ) {
    return [];
  }
  return componentNode.superTypeParameters.params.map(
    p => p.type === 'GenericTypeAnnotation' && p.id.name,
  );
}

function getTypeAnnotation(node: Node): string {
  // Get the actual name of the type instead of something like
  // 'GenericTypeAnnotation'.
  if (node.value.id) {
    return node.value.id.name;
  }

  // Primitive types such as 'string' and 'number' won't have an id.
  return node.value.type;
}

function removePrefix(prefix: string, input: string) {
  if (input.indexOf(prefix) === 0) {
    return input.substr(prefix.length);
  }
  return input;
}

function getLeadingComment(node: Node): ?string {
  if (!node.leadingComments) {
    return null;
  }

  // Remove trailing whitespace and leading asterisk.
  return node.leadingComments[node.leadingComments.length - 1].value
    .split('\n')
    .map(l => removePrefix('*', l.trim()).trim())
    .filter(l => l.length > 0)
    .join('\n');
}

export function getRequiredPropsFromAst(
  componentName: string,
  ast: File,
): Array<ComponentProp> {
  const typeParameterNames = getTypeParameterNames(componentName, ast);
  const requiredProps = ast.program.body
    .filter(
      node =>
        node.exportKind === 'type' &&
        node.declaration &&
        node.declaration.right &&
        // Ensure this type is in the component's class generics.
        // i.e., ``class Foo extends Component<Props>`` means this type should
        // be named "Props".
        typeParameterNames.includes(node.declaration.id.name),
    )
    .reduce((props: Array<string>, node: Node) => {
      // Ensure the node has a type annotation assigned to it.
      if (
        !node.declaration.right ||
        !node.declaration.right.properties ||
        node.declaration.right.type !== 'ObjectTypeAnnotation'
      ) {
        // It may not be an object of properties, ignore it if not. It may be
        // something like $Rest.
        return props;
      }

      const required = node.declaration.right.properties
        // There could be properties with a type such as
        // ObjectTypeSpreadProperty which would require more logic to
        // include.
        .filter(n => !n.optional && n.type === 'ObjectTypeProperty' && n.key)
        .map(n => {
          const leadingComment = getLeadingComment(n);
          return {
            name: n.key.name,
            typeAnnotation: getTypeAnnotation(n),
            ...(leadingComment == null ? {} : {leadingComment}),
          };
        });
      return props.concat(required);
    }, []);

  return requiredProps;
}

// This is used for testing purposes. ASTs are expensive to compute and thus
// should be re-used by passing instances to `getRequiredPropsFromAst`.
export function getRequiredProps(
  componentName: string,
  code: string,
): Array<ComponentProp> {
  const ast = parseCode(code);
  if (ast == null) {
    return [];
  }

  return getRequiredPropsFromAst(componentName, ast);
}
