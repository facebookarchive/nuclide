// flow-typed signature: 62bc5615b7c27f8f00718fec93336e7f
// flow-typed version: ef0148e929/classnames_v2.x.x/flow_>=v0.28.x

type $npm$classnames$Classes =
  string |
  {[className: string]: ?boolean } |
  Array<string> |
  void |
  null

declare module 'classnames' {
  declare function exports(
    ...classes: Array<$npm$classnames$Classes>
  ): string;
}
