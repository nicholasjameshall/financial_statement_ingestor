/*
  This class contains static utility functions for global use.
*/
var UtilityClass = function() {};
UtilityClass.sortByDate = function(a, b) {
    if (a.date === b.date) {
      return 0;
    }
    
    return (a.date < b.date) ? 1 : -1;
}
