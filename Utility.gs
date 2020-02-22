/*
  This class contains static utility functions for global use.
*/
class UtilityClass {
  static sortByDate(a, b) {
    if (a.date === b.date) {
      return 0;
    }
    
    return (a.date < b.date) ? 1 : -1;
  }
}
