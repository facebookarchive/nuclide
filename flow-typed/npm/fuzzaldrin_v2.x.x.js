// flow-typed signature: d9ff3723a1f6adeed7c35e7e68a8cd43
// flow-typed version: 1cd29c0f1f/fuzzaldrin_v2.x.x/flow_>=v0.25.x

declare module 'fuzzaldrin' {
  declare module.exports: {
    score(string: string, query: string): number,
    filter<T: string|Object>(candidates: Array<T>, query: string, options?: {
      key?: string,
      maxResults?: number,
    }): Array<T>,
  }
}
