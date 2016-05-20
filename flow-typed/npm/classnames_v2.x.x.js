// flow-typed signature: 64bf47cd0ce3dc174bb7368c3ac9b071
// flow-typed version: f4c8529b8e/classnames_v2.x.x/flow_>=v0.23.x

type $npm$classnames$Classes =
  string |
  // We need both of these because if we just have the latter it won't accept objects typed
  // explicitly as the former, due to mutation concerns.
  {[className: string]: boolean } |
  {[className: string]: ?boolean } |
  Array<string> |
  void |
  null

declare module 'classnames' {
  declare function exports(
    ...classes: Array<$npm$classnames$Classes>
  ): string;
}
