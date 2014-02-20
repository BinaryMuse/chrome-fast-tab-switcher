var sections = function(haystack, needle, remaining, acc, offset) {
  if (!acc) acc = [];
  if (!remaining) remaining = "";
  if (!offset) offset = 0;

  needle = needle.trim();
  var index = haystack.toLowerCase().indexOf(needle.toLowerCase());
  if (index > -1) {
    if (remaining.length) {
      var remainingHaystack = haystack.substr(needle.length + index);
      var newAcc = acc.concat([[offset + index, offset + needle.length + index]]);
      return sections(remainingHaystack, remaining, null, newAcc, offset + needle.length + index);
    } else {
      return acc.concat([[offset + index, offset + needle.length + index]]);
    }
  } else if (needle.length > 1) {
    var nextNeedle = needle.substr(0, needle.length - 1);
    return sections(haystack, nextNeedle, needle.substr(needle.length - 1) + remaining, acc, offset);
  } else {
    return [];
  }
};

module.exports = function(haystack, needle, pre, post) {
  if (!pre) pre = '';
  if (!post) post = '';

  var matches = sections(haystack, needle);
  if (!matches.length) return haystack;
  var lastPos = 0;
  var result = '';

  for (var idx in matches) {
    var match = matches[idx];
    var start = match[0];
    var end = match[1];
    result += haystack.substring(lastPos, start);
    result += pre + haystack.substring(start, end) + post;
    lastPos = end;
  }

  result += haystack.substr(lastPos);

  return result;
};
