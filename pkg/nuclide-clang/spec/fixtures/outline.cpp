int global_var;

namespace test_namespace {
namespace {

void function(const int, bool param) {
}

}
}

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

template<typename Ty>
class TemplateClass {
};

enum TestEnum {
  ENUM_VALUE_1,
  ENUM_VALUE_2,
};
