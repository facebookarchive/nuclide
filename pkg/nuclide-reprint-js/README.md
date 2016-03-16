# Reprint

Takes in an AST and pretty prints it.

```javascript
(function foo(someLongArgument, anotherLongArgument,
   aThirdReallyLongArgumentNameThatCouldBreakThings) { dosomething()})(1, 2, 3);

(function bar(
  a,
  b,
  c
){})();
```

Becomes:

```javascript
(function foo(
  someLongArgument,
  anotherLongArgument,
  aThirdReallyLongArgumentNameThatCouldBreakThings,
) {
  dosomething();
})(1, 2, 3);

(function bar(a, b, c) {})();
```

## Ideology

This only reprints the existing AST, it should not result in a change that
alters the AST in any way. Fixing the AST is the job of another tool.

### We do:

* Add trailing commas
* Add parens around the single argument in an arrow function

### We don't:

* Separate long string literals with `+` so the line can break
  * May be worth doing this since it almost has to be done within a formatter,
  it doesn't make much sense for this to be done as a transform with no context
  of how the code will be printed.
* Switch the type of quotes around string literals
  * This can change how things must be escaped
  * Could potentially fix this by not considering `literal.raw` part of the AST,
  but `literal.raw` is required in order to print integral number literals that
  exceed `MAX_SAFE_INTEGER`
* Simplify unnecessary parenthesis around series of expressions

## Code Patterns and Terminology

### Simple

Simple means that no context is needed in order to produce the output. Nodes
below the tree rooted at the current node are not considered additional context.

### Complex

Complex means that context is required to produce the output. This means nodes
above, or siblings of the current node are required.

### Printer

A printer takes in a node and any context in order to produce an array of lines.

### Wrapper

A wrapper is similar to a printer except that it also takes in some already
printed lines.

### Resolver

A resolver works on lines and options (not the full context) in order to remove
markers.

### Marker

A marker is a special string that conveys some information to a resolver. It may
tell the resolver to add a space, or that it's okay to break at the current
location.
