// SYNTAX TEST "text.html.hack"
<?hh

function example(): Awaitable<SomeType, bool> {
  //              ^ punctuation.definition.type.php
  //                     ^ support.class.php
  //                            ^ support.class.php
  //                                     ^ support.class.php
  //                                          ^ punctuation.section.scope.begin.php
}

interface ISomething {

  function example(): void;
  //                ^ punctuation.definition.type.php
  //                   ^ support.class.php
  //                      ^ punctuation.terminator.expression.php
  function example2(): void;
  //                 ^ punctuation.definition.type.php
  //                    ^ support.class.php
  //                       ^ punctuation.terminator.expression.php
}

function exampleWithDefaultParameters(
  URI $href_uri,
  ?Something $filter = null,
  //                 ^ keyword.operator.assignment.php
  //                   ^^^^ constant.language.php
  //                       ^ meta.function.arguments.php
  bool $notfilter = false,
  //              ^ keyword.operator.assignment.php
  //                ^^^^^ constant.language.php
  //                     ^ meta.function.arguments.php
  SomeEnum $mode = SomeEnum::NORMAL,
  //             ^ keyword.operator.assignment.php
  //               ^^^^^^^^^^^^^^^^ constant.language.php
  //                               ^ meta.function.arguments.php
): void {

}
