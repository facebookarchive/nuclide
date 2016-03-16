// Copyright 2013-present Facebook. All Rights Reserved.
// @nolint
#include "FoundationStub.h"

@interface Hello : NSObject
- (void)say:(int)i;
@end

@implementation Hello
- (void)say:(int)i {
  if (i > 0) {
    NSLog(@"Hello, world! (%d)", i);
  }
}
@end

int main(int argc, char *argv[])
{
  for (int i = 0; i < 3; i++) {
    @autoreleasepool {
      [[Hello new] say:i];
    }
  }
  return 0;
}
