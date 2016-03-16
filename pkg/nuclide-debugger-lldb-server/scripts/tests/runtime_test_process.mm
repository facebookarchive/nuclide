// Copyright 2004-present Facebook. All Rights Reserved.

#import <Foundation/Foundation.h>

@interface ObjcClassWithIvars : NSObject
@end

@implementation ObjcClassWithIvars {
  NSArray *_arrayValue;
}

- (instancetype)init {
  if (self = [super init]) {
    self->_arrayValue = @[@1, @"foo"];
  }
  return self;
}

@end

/**
 * A test process that kills itself if its parent died by detecting that the
 * ppid has changed from the one passed in.
 */
int main(int argc, char *argv[]) {
  ObjcClassWithIvars *testObj = [ObjcClassWithIvars new];

  // ObjectC NSString
  NSString *make = @"Porsche";

  // ObjectC NSSet
  NSSet *americanMakes_set = [NSSet setWithObjects:@"Chrysler", @"Ford", @"General Motors", nil];

  // ObjectC NSArray
  NSArray *germanMakes_array = @[@"Mercedes-Benz", @"Porsche", @"Volkswagen"];

  // ObjectC NSDictionary
  // TODO[jeffreytan]: write test for it(t7809321)
  NSDictionary *inventory_dictionary = @{
    @"Mercedes-Benz SLK250" : @13,
    @"Mercedes-Benz E350" : @22,
    @"BMW M3 Coupe" : @19,
    };

  // Debugger will at this line.
  return 0;
}
