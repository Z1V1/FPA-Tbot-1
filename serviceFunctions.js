const sliceLongStr = function (str, arr, start, end) {
  if (end == -1) {
    return str.slice(str.indexOf(arr[start][0].replace('\n', '')), -1);
  };
  return str.slice(str.indexOf(arr[start][0].replace('\n', '')), str.indexOf(arr[end][0].replace('\n', '')));
}

module.exports.sliceLongStr = sliceLongStr;