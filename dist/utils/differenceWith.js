"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.differenceWith = differenceWith;
function differenceWith(pred, list1, list2) {
    if (!Array.isArray(list1) || list1.length === 0)
        return [];
    if (!Array.isArray(list2) || list2.length === 0)
        return [...list1];
    // Return items from list1 that do not match any item in list2 by the predicate
    return list1.filter((a) => !list2.some((b) => pred(a, b)));
}
