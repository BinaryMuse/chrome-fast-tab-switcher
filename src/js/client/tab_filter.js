/**
 * A tab filter is simply a function that takes a string to filter
 * on and an array of tabs; it will determine if the tab title or URL
 * match, based on the passed in `scorer`, and will rank them accordingly.
 *
 * `scorer` is simply a function that takes two strings and returns
 * a number between 0 and 1 representing how closely the strings
 * match; a value of `1` is an exact match, and a value of `0`
 * is no match at all. Tabs with a score of 0 for both the title
 * and URL will not be returned from the filter.
 */
module.exports = function(scorer) {
  return function(query, array) {
    return array.map(function(item) {
      var titleScore = scorer(item.title.trim(), query.trim()) * 2;
      var urlScore = scorer(item.url.trim(), query.trim());
      var higherScore = titleScore >= urlScore ?
        titleScore : urlScore;
      return {
        tab: item,
        score: higherScore
      };
    }).filter(function(result) {
      return result.score > 0;
    }).sort(function(a, b) {
      return b.score - a.score;
    });
  };
};
