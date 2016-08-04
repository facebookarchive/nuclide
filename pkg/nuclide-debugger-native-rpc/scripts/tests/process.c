#include <unistd.h>
#include <stdio.h>
#include <string.h>

void test_function()
{
  printf("Printing\n");
}

int main(int argc, char **argv)
{
  sleep(1);

  test_function();

  return 0;
}
