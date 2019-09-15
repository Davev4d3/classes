const subjects = ['math', 'art', 'visual', 'french', 'latin', 'chinese', 'english', 'music', 'german', 'geo', 'hist'];

function isYearSevenSubject(str) {
  for (const s of subjects) {
    if (str.indexOf(s) > -1) {
      return true
    }
  }
  return false
}

export function changeSubjectName(str) {
  if (str.substr(0, 3) === '12 ') {
    str = '7 ' + str.substr(3)
  } else return str;

  const lower = str.toLowerCase();
  const isY7 = isYearSevenSubject(lower);

  if (!isY7) str += ' Acc';

  return str
}

window.changeSubjectName = changeSubjectName;

export function checkJuniorDay(dateRaw) {
  return dateRaw === '2019-09-16'
}