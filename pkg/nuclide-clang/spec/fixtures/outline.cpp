int global_var;

namespace test_namespace {
namespace {

void function(const int, bool param) {
}

}
}
#pragma mark - Section 1
template<typename T>
int templated_function(T x) {
  return 0;
}

class TestClass {
  template<typename T>
  void method(T param) {
  }

  void partialMethod();
  static int partialVar;
};

int TestClass::partialVar;

void TestClass::partialMethod() {
}
  #pragma mark Section 2
template<typename Ty>
class TemplateClass {
};

enum TestEnum {
  ENUM_VALUE_1,
  ENUM_VALUE_2,
};

#define TEST_F(x, y) 1

TEST_F ( a , b ) {}
