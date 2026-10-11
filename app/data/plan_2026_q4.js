/* Biblia — 2026年聖經速讀進度表（第四季）
 * 週次：40 ~ 53 週
 * 日期：10/1 ~ 12/31
 * 依據 WOL 教會 2026 年聖經速讀進度表（第四季）
 */
(function() {
  'use strict';

  var BOOK_ABBR_MAP = {
    '斯': { no: 17, zh: '以斯帖記' },
    '詩': { no: 19, zh: '詩篇' },
    '賽': { no: 23, zh: '以賽亞書' },
    '耶': { no: 24, zh: '耶利米書' },
    '哀': { no: 25, zh: '耶利米哀歌' },
    '結': { no: 26, zh: '以西結書' },
    '但': { no: 27, zh: '但以理書' },
    '何': { no: 28, zh: '何西阿書' },
    '珥': { no: 29, zh: '約珥書' },
    '摩': { no: 30, zh: '阿摩司書' },
    '俄': { no: 31, zh: '俄巴底亞書' },
    '拿': { no: 32, zh: '約拿書' },
    '彌': { no: 33, zh: '彌迦書' },
    '鴻': { no: 34, zh: '那鴻書' },
    '哈': { no: 35, zh: '哈巴谷書' },
    '番': { no: 36, zh: '西番雅書' },
    '該': { no: 37, zh: '哈該書' },
    '亞': { no: 38, zh: '撒迦利亞書' },
    '瑪': { no: 39, zh: '瑪拉基書' }
  };

  var RAW_SCHEDULE = [
    // 第 40 週
    { week: 40, date: '10/1', text: '斯 8-10 詩 103' },
    { week: 40, date: '10/2', text: '俄 1 詩 104' },
    { week: 40, date: '10/3', text: '珥 1-3' },
    { week: 40, date: '10/4', text: '賽 1-4' },

    // 第 41 週
    { week: 41, date: '10/5', text: '賽 5-6 詩 105' },
    { week: 41, date: '10/6', text: '賽 7-8 詩 106' },
    { week: 41, date: '10/7', text: '賽 9 詩 107' },
    { week: 41, date: '10/8', text: '賽 10-13 詩 108' },
    { week: 41, date: '10/9', text: '賽 14-18' },
    { week: 41, date: '10/10', text: '賽 19-22' },
    { week: 41, date: '10/11', text: '賽 23-25 詩 109' },

    // 第 42 週
    { week: 42, date: '10/12', text: '賽 26-28 詩 110' },
    { week: 42, date: '10/13', text: '賽 29-31 詩 111' },
    { week: 42, date: '10/14', text: '賽 32-34 詩 112' },
    { week: 42, date: '10/15', text: '賽 35-37' },
    { week: 42, date: '10/16', text: '賽 38-40 詩 113' },
    { week: 42, date: '10/17', text: '賽 41-43' },
    { week: 42, date: '10/18', text: '賽 44-46 詩 114' },

    // 第 43 週
    { week: 43, date: '10/19', text: '賽 47-49 詩 115' },
    { week: 43, date: '10/20', text: '賽 50-53' },
    { week: 43, date: '10/21', text: '賽 54-57 詩 116' },
    { week: 43, date: '10/22', text: '賽 58-60 詩 117' },
    { week: 43, date: '10/23', text: '賽 61-63 詩 118' },
    { week: 43, date: '10/24', text: '賽 64-66' },
    { week: 43, date: '10/25', text: '詩 119:1-88' },

    // 第 44 週
    { week: 44, date: '10/26', text: '詩 119:89-176' },
    { week: 44, date: '10/27', text: '彌 1-4 詩 120' },
    { week: 44, date: '10/28', text: '彌 5-7 詩 121' },
    { week: 44, date: '10/29', text: '拿 1-4 詩 122' },
    { week: 44, date: '10/30', text: '摩 1-3 詩 123' },
    { week: 44, date: '10/31', text: '摩 4-6 詩 124' },
    { week: 44, date: '11/1', text: '摩 7-9 詩 125' },

    // 第 45 週
    { week: 45, date: '11/2', text: '何 1-4 詩 126' },
    { week: 45, date: '11/3', text: '何 5-9 詩 127' },
    { week: 45, date: '11/4', text: '何 10-14 詩 128' },
    { week: 45, date: '11/5', text: '番 1-3 詩 129' },
    { week: 45, date: '11/6', text: '鴻 1-3 詩 130' },
    { week: 45, date: '11/7', text: '耶 1-2 詩 131' },
    { week: 45, date: '11/8', text: '耶 3-4 詩 132' },

    // 第 46 週
    { week: 46, date: '11/9', text: '耶 5-6 詩 133' },
    { week: 46, date: '11/10', text: '耶 7-8 詩 134' },
    { week: 46, date: '11/11', text: '耶 9-10 詩 135' },
    { week: 46, date: '11/12', text: '耶 11-13' },
    { week: 46, date: '11/13', text: '耶 14-16' },
    { week: 46, date: '11/14', text: '耶 17-19' },
    { week: 46, date: '11/15', text: '耶 20-22' },

    // 第 47 週
    { week: 47, date: '11/16', text: '耶 23 詩 136' },
    { week: 47, date: '11/17', text: '耶 24-25 詩 137' },
    { week: 47, date: '11/18', text: '耶 26-28' },
    { week: 47, date: '11/19', text: '耶 29-30 詩 138' },
    { week: 47, date: '11/20', text: '耶 31-32' },
    { week: 47, date: '11/21', text: '耶 33-35' },
    { week: 47, date: '11/22', text: '耶 36-37 詩 139' },

    // 第 48 週
    { week: 48, date: '11/23', text: '耶 38-39 詩 140' },
    { week: 48, date: '11/24', text: '耶 40-42' },
    { week: 48, date: '11/25', text: '耶 43-45 詩 141' },
    { week: 48, date: '11/26', text: '耶 46-48' },
    { week: 48, date: '11/27', text: '耶 49-50' },
    { week: 48, date: '11/28', text: '耶 51-52' },
    { week: 48, date: '11/29', text: '哀 1-2 詩 142' },

    // 第 49 週
    { week: 49, date: '11/30', text: '哀 3-5' },
    { week: 49, date: '12/1', text: '哈 1-3 詩 143' },
    { week: 49, date: '12/2', text: '結 1-3' },
    { week: 49, date: '12/3', text: '結 4-7' },
    { week: 49, date: '12/4', text: '結 8-10 詩 144' },
    { week: 49, date: '12/5', text: '結 11-12 詩 145' },
    { week: 49, date: '12/6', text: '結 13-15 詩 146' },

    // 第 50 週
    { week: 50, date: '12/7', text: '結 16-17' },
    { week: 50, date: '12/8', text: '結 18-19 詩 147' },
    { week: 50, date: '12/9', text: '結 20-21' },
    { week: 50, date: '12/10', text: '結 22-23' },
    { week: 50, date: '12/11', text: '結 24-26 詩 148' },
    { week: 50, date: '12/12', text: '結 27-29' },
    { week: 50, date: '12/13', text: '結 30-32' },

    // 第 51 週
    { week: 51, date: '12/14', text: '結 33-35' },
    { week: 51, date: '12/15', text: '結 36-37 詩 149' },
    { week: 51, date: '12/16', text: '結 38-39 詩 150' },
    { week: 51, date: '12/17', text: '結 40-41' },
    { week: 51, date: '12/18', text: '結 42-44' },
    { week: 51, date: '12/19', text: '結 45-46' },
    { week: 51, date: '12/20', text: '結 47-48' },

    // 第 52 週
    { week: 52, date: '12/21', text: '但 1-2' },
    { week: 52, date: '12/22', text: '但 3-4' },
    { week: 52, date: '12/23', text: '但 5-6' },
    { week: 52, date: '12/24', text: '但 7-9' },
    { week: 52, date: '12/25', text: '但 10-12' },
    { week: 52, date: '12/26', text: '該 1-2' },
    { week: 52, date: '12/27', text: '亞 1-4' },

    // 第 53 週
    { week: 53, date: '12/28', text: '亞 5-8' },
    { week: 53, date: '12/29', text: '亞 9-11' },
    { week: 53, date: '12/30', text: '亞 12-14' },
    { week: 53, date: '12/31', text: '瑪 1-4' }
  ];

  function parsePassages(text) {
    var results = [];
    var regex = /(斯|俄|珥|賽|詩|彌|拿|摩|何|番|鴻|耶|哀|哈|結|但|該|亞|瑪)\s*(\d+)(?::(\d+)(?:-(\d+))?)?(?:-(\d+))?/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      var abbr = match[1];
      var startChap = parseInt(match[2], 10);
      var startVerse = match[3] ? parseInt(match[3], 10) : null;
      var endVerse = match[4] ? parseInt(match[4], 10) : (startVerse ? startVerse : null);
      var endChap = match[5] ? parseInt(match[5], 10) : startChap;
      var info = BOOK_ABBR_MAP[abbr];
      if (info) {
        var label = abbr + ' ' + (startVerse ? (startChap + ':' + startVerse + (endVerse && endVerse !== startVerse ? '-' + endVerse : '')) : (startChap === endChap ? startChap : startChap + '-' + endChap));
        var rangeText;
        if (startVerse) {
          rangeText = startChap + '章' + startVerse + (endVerse && endVerse !== startVerse ? ('-' + endVerse) : '') + '節';
        } else {
          rangeText = startChap === endChap ? (startChap + '章') : (startChap + '~' + endChap + '章');
        }
        var item = {
          abbr: abbr,
          bookNo: info.no,
          bookZh: info.zh,
          startChap: startChap,
          endChap: endChap,
          label: label,
          fullLabel: info.zh + ' ' + rangeText
        };
        if (startVerse) {
          item.startVerse = startVerse;
          item.endVerse = endVerse;
        }
        results.push(item);
      }
    }
    return results;
  }

  var processedData = RAW_SCHEDULE.map(function(item, index) {
    var parts = item.date.split('/');
    var m = parseInt(parts[0], 10);
    var d = parseInt(parts[1], 10);
    var monthStr = m < 10 ? '0' + m : '' + m;
    var dayStr = d < 10 ? '0' + d : '' + d;
    
    return {
      id: 'q4_day_' + (index + 1),
      week: item.week,
      date: item.date,
      month: m,
      day: d,
      isoDate: '2026-' + monthStr + '-' + dayStr,
      rawText: item.text,
      passages: parsePassages(item.text)
    };
  });

  if (typeof window !== 'undefined') {
    window.BIBLIA_PLAN_2026_Q4 = {
      id: 'church_q4_2026',
      title: 'WOL 教會 2026年聖經速讀進度表（第四季）',
      subtitle: '10/1 ~ 12/31 ・ 一年讀完聖經 ・ 週次 40 ~ 53',
      year: 2026,
      quarter: 4,
      items: processedData
    };
  }
})();
