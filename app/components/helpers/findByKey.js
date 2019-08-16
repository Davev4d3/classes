/**
 * Searches an array of objects' keys for a specific property value.
 *
 * @param arr {Object[]}
 * @param key {string}
 * @param needle - The target value
 * @returns {*} - The object, if found, or undefined.
 * @author Dawei Wu
 */
export function findByKey(arr, key, needle) {
  return arr.find(x => x[key] === needle);
}

export function findIndexByKey(arr, key, needle) {
  return arr.findIndex(x => x[key] === needle);
}

export function findByKeyNested(arr, key, nestedKey, needle) {
  return arr.find(x => x[key][nestedKey] === needle);
}

export function findByKeyNestedWith(arr, key, nestedKey, needle, comparator) {
  return arr.find(x => comparator(x[key][nestedKey], needle));
}

/**
 * Same as findByKey, but performs an un-type-script comparison on the property values.
 *
 * @see findByKey
 * @param arr {Object[]}
 * @param key {string}
 * @param needle - The target parameter value. Does not have to be the same type.
 * @returns {*} - The object, if found, otherwise undefined.
 * @author Dawei Wu
 */
export function findByKeyUnstrict(arr, key, needle) {
  return arr.find(x => x[key] == needle);
}