# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from find_lldb import get_lldb

def get_category_value(category_sbvalue, category_extract_mask):
    return category_sbvalue.unsigned & category_extract_mask


def folly_stl_string_formatter(valobj, internal_dict):
    '''Type summary formatter for std::string implemented by folly fbstring_core.
    '''
    folly_fbstring_sbvalue = valobj.GetValueForExpressionPath('.store_')
    return folly_fbstring_core_formatter(folly_fbstring_sbvalue, internal_dict)


def folly_fbstring_core_formatter(valobj, internal_dict):
    '''Type summary formatter for folly fbstring_core.
    Please refer to https://github.com/facebook/folly/blob/master/folly/FBString.h
    for implementation details.
    '''
    lldb = get_lldb()
    target_byte_order = lldb.target.GetByteOrder()
    capacity_sbvalue = valobj.GetValueForExpressionPath('.ml_.capacity_')
    category_extract_mask = 0x3 if target_byte_order == lldb.eByteOrderBig else \
        (0xC0000000 if capacity_sbvalue.size == 4 else 0xC000000000000000)

    class Category:
        Small = 0
        Medium = (0x2 if target_byte_order == lldb.eByteOrderBig else
                  (0x80000000 if capacity_sbvalue.size == 4 else 0x8000000000000000))
        Large = (0x2 if target_byte_order == lldb.eByteOrderBig else
                 (0x40000000 if capacity_sbvalue.size == 4 else 0x4000000000000000))

    category = get_category_value(capacity_sbvalue, category_extract_mask)
    if category == Category.Small:
        return valobj.GetValueForExpressionPath('.small_').GetSummary()
    else:
        assert category == Category.Medium or category == Category.Large, \
            'Unknown category: %d' % category
        return valobj.GetValueForExpressionPath('.ml_.data_').GetSummary()


def __lldb_init_module(debugger, internal_dict):
    debugger.HandleCommand('type summary add -F data_formatter.folly_fbstring_core_formatter \
        std::fbstring_core<char>')
    debugger.HandleCommand('type summary add -F data_formatter.folly_fbstring_core_formatter \
        std::fbstring_core<wchar_t>')
    debugger.HandleCommand('type summary add -F data_formatter.folly_stl_string_formatter \
        std::string')
    debugger.HandleCommand('type summary add -F data_formatter.folly_stl_string_formatter \
        std::wstring')
