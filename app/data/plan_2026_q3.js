/* Biblia — 2026年聖經速讀進度表（第三季）
 * 週次：27 ~ 40 週
 * 日期：7/1 ~ 9/30
 */
(function() {
  'use strict';

  var BOOK_ABBR_MAP = {
    '士': { no: 7, zh: '士師記' },
    '得': { no: 8, zh: '路得記' },
    '撒上': { no: 9, zh: '撒母耳記上' },
    '撒下': { no: 10, zh: '撒母耳記下' },
    '王上': { no: 11, zh: '列王紀上' },
    '王下': { no: 12, zh: '列王紀下' },
    '代上': { no: 13, zh: '歷代志上' },
    '代下': { no: 14, zh: '歷代志下' },
    '拉': { no: 15, zh: '以斯拉記' },
    '尼': { no: 16, zh: '尼希米記' },
    '斯': { no: 17, zh: '以斯帖記' },
    '詩': { no: 19, zh: '詩篇' }
  };

  var RAW_SCHEDULE = [
    // 第 27 週
    { week: 27, date: '7/1', text: '士 8-9' },
    { week: 27, date: '7/2', text: '士 10-12' },
    { week: 27, date: '7/3', text: '士 13-15 詩 33' },
    { week: 27, date: '7/4', text: '士 16-17 詩 31' },
    { week: 27, date: '7/5', text: '士 18-19 詩 35' },
    { week: 27, date: '7/6', text: '士 20-21 詩 36' },
    { week: 27, date: '7/7', text: '得 1-4' },

    // 第 28 週
    { week: 28, date: '7/8', text: '撒上 1-2 詩 37' },
    { week: 28, date: '7/9', text: '撒上 3-5 詩 38' },
    { week: 28, date: '7/10', text: '撒上 6-8 詩 39' },
    { week: 28, date: '7/11', text: '撒上 9-10 詩 40' },
    { week: 28, date: '7/12', text: '撒上 11-13 詩 41' },
    { week: 28, date: '7/13', text: '撒上 14-15' },
    { week: 28, date: '7/14', text: '撒上 16-17' },

    // 第 29 週
    { week: 29, date: '7/15', text: '撒上 18-19 詩 42' },
    { week: 29, date: '7/16', text: '撒上 20-21 詩 43' },
    { week: 29, date: '7/17', text: '撒上 22-23 詩 44' },
    { week: 29, date: '7/18', text: '撒上 24-25 詩 45' },
    { week: 29, date: '7/19', text: '撒上 26-28 詩 16' },
    { week: 29, date: '7/20', text: '撒上 29-31 詩 17' },
    { week: 29, date: '7/21', text: '撒下 1-2 詩 48' },

    // 第 30 週
    { week: 30, date: '7/22', text: '撒下 3-5' },
    { week: 30, date: '7/23', text: '撒下 6-9' },
    { week: 30, date: '7/24', text: '撒下 10-11 詩 49' },
    { week: 30, date: '7/25', text: '撒下 12-13 詩 50' },
    { week: 30, date: '7/26', text: '撒下 14-15' },
    { week: 30, date: '7/27', text: '撒下 16-17 詩 51' },
    { week: 30, date: '7/28', text: '撒下 18-19' },

    // 第 31 週
    { week: 31, date: '7/29', text: '撒下 20-22' },
    { week: 31, date: '7/30', text: '撒下 23-24 詩 52' },
    { week: 31, date: '7/31', text: '王上 1 詩 53-54' },
    { week: 31, date: '8/1', text: '王上 2-3' },
    { week: 31, date: '8/2', text: '王上 4-5 詩 55' },
    { week: 31, date: '8/3', text: '王上 6-7 詩 56' },
    { week: 31, date: '8/4', text: '王上 8 詩 57' },

    // 第 32 週
    { week: 32, date: '8/5', text: '王上 9-10 詩 58' },
    { week: 32, date: '8/6', text: '王上 11-12' },
    { week: 32, date: '8/7', text: '王上 13-14 詩 59' },
    { week: 32, date: '8/8', text: '王上 15-16' },
    { week: 32, date: '8/9', text: '王上 17-18 詩 60' },
    { week: 32, date: '8/10', text: '王上 19-20 詩 61' },
    { week: 32, date: '8/11', text: '王上 21-22' },

    // 第 33 週
    { week: 33, date: '8/12', text: '王下 1-3' },
    { week: 33, date: '8/13', text: '王下 4-5' },
    { week: 33, date: '8/14', text: '王下 6-7 詩 62' },
    { week: 33, date: '8/15', text: '王下 8-9 詩 63' },
    { week: 33, date: '8/16', text: '王下 10-11 詩 64' },
    { week: 33, date: '8/17', text: '王下 12-14' },
    { week: 33, date: '8/18', text: '王下 15-16 詩 65' },

    // 第 34 週
    { week: 34, date: '8/19', text: '王下 17-18' },
    { week: 34, date: '8/20', text: '王下 19-21' },
    { week: 34, date: '8/21', text: '王下 22-23 詩 66' },
    { week: 34, date: '8/22', text: '詩 67-70' },
    { week: 34, date: '8/23', text: '王下 24-25 詩 71' },
    { week: 34, date: '8/24', text: '代上 1-2' },
    { week: 34, date: '8/25', text: '代上 3-5' },

    // 第 35 週
    { week: 35, date: '8/26', text: '代上 6-7' },
    { week: 35, date: '8/27', text: '代上 8-10' },
    { week: 35, date: '8/28', text: '代上 11-12' },
    { week: 35, date: '8/29', text: '代上 13-15 詩 72' },
    { week: 35, date: '8/30', text: '代上 16-18' },
    { week: 35, date: '8/31', text: '代上 19-21 詩 73' },
    { week: 35, date: '9/1', text: '代上 22-24 詩 74' },

    // 第 36 週
    { week: 36, date: '9/2', text: '代上 25-27' },
    { week: 36, date: '9/3', text: '代上 28-29 詩 75' },
    { week: 36, date: '9/4', text: '代下 1-3 詩 76' },
    { week: 36, date: '9/5', text: '代下 4-6 詩 77' },
    { week: 36, date: '9/6', text: '代下 7-9' },
    { week: 36, date: '9/7', text: '代下 10 詩 78' },
    { week: 36, date: '9/8', text: '代下 11-13 詩 79' },

    // 第 37 週
    { week: 37, date: '9/9', text: '代下 14-16 詩 80' },
    { week: 37, date: '9/10', text: '代下 17-19 詩 81' },
    { week: 37, date: '9/11', text: '代下 20-22' },
    { week: 37, date: '9/12', text: '代下 23-24 詩 82' },
    { week: 37, date: '9/13', text: '代下 25-27 詩 83' },
    { week: 37, date: '9/14', text: '代下 28-29 詩 84' },
    { week: 37, date: '9/15', text: '代下 30-31 詩 85' },

    // 第 38 週
    { week: 38, date: '9/16', text: '代下 32-33 詩 86' },
    { week: 38, date: '9/17', text: '代下 34-35 詩 87' },
    { week: 38, date: '9/18', text: '代下 36 詩 88-89' },
    { week: 38, date: '9/19', text: '拉 1-3 詩 90' },
    { week: 38, date: '9/20', text: '拉 4-6 詩 91' },
    { week: 38, date: '9/21', text: '拉 7-8' },
    { week: 38, date: '9/22', text: '拉 9-10 詩 92' },

    // 第 39 週
    { week: 39, date: '9/23', text: '尼 1-3 詩 93' },
    { week: 39, date: '9/24', text: '尼 4-6 詩 94' },
    { week: 39, date: '9/25', text: '尼 7-8 詩 95' },
    { week: 39, date: '9/26', text: '尼 9-10 詩 96' },
    { week: 39, date: '9/27', text: '尼 11-12 詩 97' },
    { week: 39, date: '9/28', text: '尼 13 詩 98-100' },
    { week: 39, date: '9/29', text: '斯 1-3 詩 101' },

    // 第 40 週
    { week: 40, date: '9/30', text: '斯 4-7 詩 102' }
  ];

  function parsePassages(text) {
    var results = [];
    var regex = /(撒上|撒下|王上|王下|代上|代下|士|得|拉|尼|斯|詩)\s*(\d+)(?:-(\d+))?/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      var abbr = match[1];
      var startChap = parseInt(match[2], 10);
      var endChap = match[3] ? parseInt(match[3], 10) : startChap;
      var info = BOOK_ABBR_MAP[abbr];
      if (info) {
        var rangeText = startChap === endChap ? (startChap + '章') : (startChap + '~' + endChap + '章');
        results.push({
          abbr: abbr,
          bookNo: info.no,
          bookZh: info.zh,
          startChap: startChap,
          endChap: endChap,
          label: abbr + ' ' + (startChap === endChap ? startChap : startChap + '-' + endChap),
          fullLabel: info.zh + ' ' + rangeText
        });
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
      id: 'day_' + (index + 1),
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
    window.BIBLIA_PLAN_2026_Q3 = {
      title: '2026年聖經速讀進度表（第三季）',
      subtitle: '7/1 ~ 9/30 ・ 週次 27 ~ 40',
      year: 2026,
      quarter: 3,
      items: processedData
    };
  }
})();
