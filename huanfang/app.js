"use strict";
(() => {
  // src/config.ts
  var MONETIZATION = {
    enabled: true,
    coverAd: false,
    rewardAfterQuota: true,
    membership: false,
    interstitial: false,
    lockLevels: false,
    freePlaysPerDay: 10
  };
  var ADS = {
    fakeRewardEnabled: true,
    rewardDurationSec: 15,
    skipAfterSec: 5,
    title: "\u4ECA\u5929\u7684\u514D\u8D39\u63D0\u793A\u7528\u5B8C\u5566\uFF083/3\uFF09",
    sub: "\u770B\u77ED\u89C6\u9891\u5F97 1 \u6B21\u63D0\u793A",
    primary: "\u770B\u89C6\u9891\u6362\u63D0\u793A",
    secondary: "\u7A0D\u540E\u518D\u8BF4",
    footer: "\u6BCF\u5929\u514D\u8D39 3 \u6B21 \xB7 \u4E0D\u7528\u5F00\u901A\u4F1A\u5458",
    playingHint: "\u5927\u6982\u5341\u51E0\u79D2 \xB7 \u770B\u5B8C\u5C31\u9001\u63D0\u793A",
    claim: "\u770B\u5B8C\u9886\u53D6"
  };
  var ADVANCED = {
    freeBank: 50,
    unlockPerReward: 10
  };
  var ADS_ADVANCED = {
    title: "\u8FDB\u9636\u9898\u9700\u8981\u89E3\u9501",
    sub: "\u770B\u77ED\u89C6\u9891\u89E3\u9501 10 \u9053\u8FDB\u9636\u9898",
    primary: "\u770B\u89C6\u9891\u89E3\u9501 10 \u9898",
    secondary: "\u7A0D\u540E\u518D\u8BF4",
    footer: "\u4E0D\u7528\u5F00\u901A\u4F1A\u5458 \xB7 \u8DF3\u8FC7\u4E0D\u89E3\u9501",
    playingHint: "\u5927\u6982\u5341\u51E0\u79D2 \xB7 \u770B\u5B8C\u89E3\u9501 10 \u9053",
    claim: "\u770B\u5B8C\u89E3\u9501"
  };
  var APP_NAME = "\u5E7B\u65B9";
  var QUESTION_BANK_SIZE = ADVANCED.freeBank;
  var HINT_DAILY_LIMIT = 3;
  var STORAGE_KEY = "huanfang:v0.6";
  var LEGACY_STORAGE_KEYS = ["huanfang:v0.4", "huanfang:v0.3", "huanfang:v0.2", "huanfang:v0.1"];
  var UI_ICONS = {
    play: "assets/ui/icons/icon_play.png",
    levels: "assets/ui/icons/icon_levels.png",
    rules: "assets/ui/icons/icon_rules.png",
    undo: "assets/ui/icons/icon_undo.png",
    hint: "assets/ui/icons/icon_hint.png",
    share: "assets/ui/icons/icon_share.png",
    check: "assets/ui/icons/icon_check.png"
  };
  var SHARE_CARD_IMG = "assets/ui/share/share_card.png";
  var SHARE_URL = "https://xueyinkd.github.io/Demo/huanfang/";

  // src/magic.ts
  function makeLines(order) {
    const lines = [];
    for (let r = 0; r < order; r++) {
      const cells = [];
      for (let c = 0; c < order; c++) cells.push(r * order + c);
      lines.push({ id: `r${r}`, label: `\u884C${r + 1}`, cells });
    }
    for (let c = 0; c < order; c++) {
      const cells = [];
      for (let r = 0; r < order; r++) cells.push(r * order + c);
      lines.push({ id: `c${c}`, label: `\u5217${c + 1}`, cells });
    }
    const main = [];
    const anti = [];
    for (let i = 0; i < order; i++) {
      main.push(i * order + i);
      anti.push(i * order + (order - 1 - i));
    }
    lines.push({ id: "d0", label: "\u4E3B\u5BF9\u89D2", cells: main });
    lines.push({ id: "d1", label: "\u526F\u5BF9\u89D2", cells: anti });
    return lines;
  }
  function emptyBoard(order) {
    return Array(order * order).fill(null);
  }
  function cloneBoard(b) {
    return b.slice();
  }
  function usedNumbers(board) {
    const s = /* @__PURE__ */ new Set();
    for (const v of board) if (v != null) s.add(v);
    return s;
  }
  function lineSum(board, cells) {
    let sum = 0;
    let filled = 0;
    for (const i of cells) {
      const v = board[i];
      if (v != null) {
        sum += v;
        filled++;
      }
    }
    return { sum, filled, full: filled === cells.length };
  }
  function lineStatus(board, cells, magicSum) {
    const { sum, full } = lineSum(board, cells);
    if (full && sum === magicSum) return "correct";
    if (full && sum !== magicSum) return "wrong";
    return "neutral";
  }
  function allLinesStatus(board, order, magicSum) {
    return makeLines(order).map((l) => {
      const { sum, filled } = lineSum(board, l.cells);
      return { id: l.id, label: l.label, sum, filled, status: lineStatus(board, l.cells, magicSum) };
    });
  }
  function isWin(board, digits, magicSum, order) {
    const n = order * order;
    if (board.length !== n || board.some((c) => c == null)) return false;
    const used = usedNumbers(board);
    if (used.size !== digits.length) return false;
    for (const d of digits) if (!used.has(d)) return false;
    return makeLines(order).every((l) => lineSum(board, l.cells).sum === magicSum);
  }

  // src/questions.ts
  var FREE_BANK = 50;
  var ADVANCED_COUNT = 80;
  var QUESTION_COUNT = 130;
  var QUESTIONS = [
    { id: "Q1", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [null, 3, 4, 1, 5, null, 6, 7, null] },
    { id: "Q2", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [6, 7, 2, null, 5, 9, null, 3, null] },
    { id: "Q3", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [2, 7, null, 9, null, 1, 4, 3, 8] },
    { id: "Q4", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [null, 3, 4, 1, null, 9, 6, 7, null] },
    { id: "Q5", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [4, 9, null, 3, 5, null, 8, null, 6] },
    { id: "Q6", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [2, 7, 6, 9, 5, null, 4, 3, null] },
    { id: "Q7", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [8, 1, 6, 3, 5, 7, null, null, 2] },
    { id: "Q8", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [4, 3, 8, 9, 5, 1, null, null, 6] },
    { id: "Q9", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [6, 1, 8, null, 5, 3, null, null, 4] },
    { id: "Q10", order: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9], magicSum: 15, given: [4, 3, null, 9, 5, null, 2, 7, null] },
    { id: "Q11", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [9, 2, null, 4, 6, 8, null, null, 3] },
    { id: "Q12", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [null, null, 9, 10, 6, 2, 3, 8, 7] },
    { id: "Q13", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [4, 9, null, 11, 7, 3, null, null, 10] },
    { id: "Q14", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [9, null, null, 4, 6, 8, 5, 10, 3] },
    { id: "Q15", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [7, 8, 3, null, null, 10, 9, 4, 5] },
    { id: "Q16", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [10, null, 6, 3, 7, 11, 8, 9, null] },
    { id: "Q17", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [8, 3, 10, null, null, 5, 4, null, 6] },
    { id: "Q18", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [9, 4, null, null, 6, 10, 7, 8, null] },
    { id: "Q19", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [10, 3, null, 5, 7, null, 6, 11, 4] },
    { id: "Q20", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [3, 8, 7, null, 6, 2, null, 4, 9] },
    { id: "Q21", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [null, 4, 5, 2, 6, 10, 7, 8, null] },
    { id: "Q22", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [5, 4, 9, null, 6, null, 3, 8, null] },
    { id: "Q23", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [5, 10, 3, null, 6, 8, null, 2, 7] },
    { id: "Q24", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [3, 10, null, 8, 6, 4, 7, null, null] },
    { id: "Q25", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [5, 10, 3, 4, null, 8, null, null, 7] },
    { id: "Q26", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [null, null, 8, null, 7, 3, 6, 5, 10] },
    { id: "Q27", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [null, null, null, 11, 7, 3, 6, 5, 10] },
    { id: "Q28", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [6, 11, 4, null, null, 9, null, 3, 8] },
    { id: "Q29", order: 3, digits: [3, 4, 5, 6, 7, 8, 9, 10, 11], magicSum: 21, given: [6, 11, 4, 5, null, 9, 10, null, 8] },
    { id: "Q30", order: 3, digits: [2, 3, 4, 5, 6, 7, 8, 9, 10], magicSum: 18, given: [5, null, null, 4, 6, 8, null, 2, 7] },
    { id: "Q31", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [8, 15, null, 13, null, null, 12, 7, null] },
    { id: "Q32", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [14, null, null, 7, 11, null, 12, null, null] },
    { id: "Q33", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [null, 13, null, null, 9, 11, 12, null, null] },
    { id: "Q34", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [10, 5, null, null, 9, null, null, 13, 8] },
    { id: "Q35", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [6, 11, null, null, null, 5, 8, 7, null] },
    { id: "Q36", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [null, null, 8, 5, 9, null, 10, 11, null] },
    { id: "Q37", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [null, 11, 6, 5, null, null, null, 7, 8] },
    { id: "Q38", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [12, null, null, 7, null, 11, 8, null, null] },
    { id: "Q39", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [null, 9, null, 15, null, 7, null, 13, 12] },
    { id: "Q40", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [12, null, 8, 7, null, null, null, null, 10] },
    { id: "Q41", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [null, null, 10, null, null, 9, 12, null, 14] },
    { id: "Q42", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [14, null, 12, null, null, 13, null, null, 8] },
    { id: "Q43", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [null, null, null, null, 9, 5, null, 11, 10] },
    { id: "Q44", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [10, 11, 6, null, null, null, 12, null, null] },
    { id: "Q45", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [12, null, null, null, 9, 11, 8, null, 6] },
    { id: "Q46", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [6, 13, 8, null, 9, null, 10, null, null] },
    { id: "Q47", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [null, 15, 8, null, 11, 13, null, null, null] },
    { id: "Q48", order: 3, digits: [5, 6, 7, 8, 9, 10, 11, 12, 13], magicSum: 27, given: [null, 5, null, null, null, null, 8, 13, 6] },
    { id: "Q49", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [8, 15, 10, null, null, null, 12, null, null] },
    { id: "Q50", order: 3, digits: [7, 8, 9, 10, 11, 12, 13, 14, 15], magicSum: 33, given: [null, null, 10, 13, null, 9, null, 7, null] },
    { id: "Q51", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, null, 17, null, 14, 12, null, 18, 13] },
    { id: "Q52", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [null, 12, 19, 18, 16, null, null, null, 15] },
    { id: "Q53", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [15, null, 11, 10, null, 18, 17, null, null] },
    { id: "Q54", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [17, null, 13, null, 16, null, null, 14, 15] },
    { id: "Q55", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [19, null, 17, 14, 16, null, null, null, null] },
    { id: "Q56", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, 12, 13, null, null, 18, null, 16, null] },
    { id: "Q57", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, null, 13, null, 14, 18, 15, null, null] },
    { id: "Q58", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [15, 10, null, 16, null, null, 11, 18, null] },
    { id: "Q59", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [17, 12, null, null, 16, null, 13, 20, null] },
    { id: "Q60", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, 12, 17, 18, null, null, 11, null, null] },
    { id: "Q61", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [15, null, null, 14, 16, null, null, 12, null] },
    { id: "Q62", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, null, null, 10, 14, 18, 15, null, 11] },
    { id: "Q63", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [15, null, null, null, 16, 12, null, 18, null] },
    { id: "Q64", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [13, null, null, 12, null, 16, 17, 10, null] },
    { id: "Q65", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [null, 16, null, 10, null, 18, 17, 12, null] },
    { id: "Q66", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [null, 12, 17, null, 16, null, null, 20, 13] },
    { id: "Q67", order: 3, digits: [10, 11, 12, 13, 14, 15, 16, 17, 18], magicSum: 42, given: [11, 16, null, 18, null, null, 13, 12, null] },
    { id: "Q68", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [17, null, 19, 18, 16, null, null, null, null] },
    { id: "Q69", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [13, null, null, 18, null, 14, null, 12, null] },
    { id: "Q70", order: 3, digits: [12, 13, 14, 15, 16, 17, 18, 19, 20], magicSum: 48, given: [19, null, null, null, 16, 20, 17, null, 13] },
    { id: "Q71", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [null, null, null, 20, null, 28, null, null, 23] },
    { id: "Q72", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [20, null, 16, null, null, 23, null, 17, null] },
    { id: "Q73", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, 18, null, 19, null, null, 21, null] },
    { id: "Q74", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, 16, null, 19, null, null, null, 20] },
    { id: "Q75", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [20, null, 16, null, null, 23, null, null, null] },
    { id: "Q76", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [null, null, null, null, 24, null, null, 20, 25] },
    { id: "Q77", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [null, 20, 25, 22, null, null, null, 28, null] },
    { id: "Q78", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [25, null, null, null, null, 22, 21, null, 23] },
    { id: "Q79", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, 22, null, 19, null, null, 21, null] },
    { id: "Q80", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [null, 22, 23, null, null, null, 25, null, null] },
    { id: "Q81", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, null, 21, null, 17, null, null, 18] },
    { id: "Q82", order: 3, digits: [20, 21, 22, 23, 24, 25, 26, 27, 28], magicSum: 72, given: [null, null, null, null, null, 26, null, 20, 25] },
    { id: "Q83", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, null, 15, null, null, null, 17, 18] },
    { id: "Q84", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, 17, 22, 23, null, null, null, null, 20] },
    { id: "Q85", order: 3, digits: [15, 16, 17, 18, 19, 20, 21, 22, 23], magicSum: 57, given: [null, null, null, null, null, 17, null, 23, 18] },
    { id: "Q86", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [null, null, null, 32, null, null, 37, 30, null] },
    { id: "Q87", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [null, null, null, 58, null, 50, null, null, 57] },
    { id: "Q88", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [null, null, null, 58, null, 50, 53, null, 57] },
    { id: "Q89", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [null, null, 37, null, 34, null, 31, null, 35] },
    { id: "Q90", order: 3, digits: [25, 26, 27, 28, 29, 30, 31, 32, 33], magicSum: 87, given: [null, null, null, null, 29, 25, 28, null, 32] },
    { id: "Q91", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [33, 32, null, 38, null, null, null, null, null] },
    { id: "Q92", order: 3, digits: [25, 26, 27, 28, 29, 30, 31, 32, 33], magicSum: 87, given: [null, null, null, null, 29, 27, null, null, 32] },
    { id: "Q93", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [null, 32, null, 38, 34, null, 31, null, null] },
    { id: "Q94", order: 3, digits: [25, 26, 27, 28, 29, 30, 31, 32, 33], magicSum: 87, given: [null, 33, 26, null, null, null, null, 25, null] },
    { id: "Q95", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [55, null, 57, null, null, null, null, 58, null] },
    { id: "Q96", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [51, 56, null, null, 54, null, null, null, null] },
    { id: "Q97", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [null, null, null, null, null, 38, 37, null, 33] },
    { id: "Q98", order: 3, digits: [30, 31, 32, 33, 34, 35, 36, 37, 38], magicSum: 102, given: [null, 38, null, null, null, 32, null, 30, null] },
    { id: "Q99", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [null, null, 53, null, 54, null, null, 50, 57] },
    { id: "Q100", order: 3, digits: [50, 51, 52, 53, 54, 55, 56, 57, 58], magicSum: 162, given: [55, null, 57, null, null, 52, null, null, null] },
    { id: "Q101", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [83, null, null, 88, null, 80, null, null, null] },
    { id: "Q102", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [null, null, null, 80, null, 88, 87, null, null] },
    { id: "Q103", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [87, null, null, null, 84, null, 85, null, null] },
    { id: "Q104", order: 3, digits: [60, 61, 62, 63, 64, 65, 66, 67, 68], magicSum: 192, given: [null, 66, 65, null, null, null, 63, null, null] },
    { id: "Q105", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [87, null, null, null, null, null, null, 88, 81] },
    { id: "Q106", order: 3, digits: [60, 61, 62, 63, 64, 65, 66, 67, 68], magicSum: 192, given: [null, null, null, null, 64, 62, null, null, 67] },
    { id: "Q107", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, 106, null, null, 104, null, null, null, 103] },
    { id: "Q108", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [101, 106, null, null, null, 100, null, null, null] },
    { id: "Q109", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [87, 82, null, 80, null, null, null, null, null] },
    { id: "Q110", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, null, null, 106, null, 102, 105, null, null] },
    { id: "Q111", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, 102, null, null, null, null, 105, null, 101] },
    { id: "Q112", order: 3, digits: [80, 81, 82, 83, 84, 85, 86, 87, 88], magicSum: 252, given: [null, null, null, null, null, null, 87, 80, 85] },
    { id: "Q113", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, null, null, null, 104, 108, null, null, 101] },
    { id: "Q114", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, null, null, 108, 104, null, 101, null, null] },
    { id: "Q115", order: 3, digits: [100, 101, 102, 103, 104, 105, 106, 107, 108], magicSum: 312, given: [null, null, null, null, null, 108, 107, 102, null] },
    { id: "Q116", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, null, 210, 216, 208, null, null, null, null] },
    { id: "Q117", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, null, 210, null, 208, 212, null, null, null] },
    { id: "Q118", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, null, null, 204, null, null, null, 216, 202] },
    { id: "Q119", order: 3, digits: [120, 121, 122, 123, 124, 125, 126, 127, 128], magicSum: 372, given: [null, null, null, 126, null, 122, 121, null, null] },
    { id: "Q120", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, 212, null, null, 208, 216, null, null, null] },
    { id: "Q121", order: 3, digits: [150, 151, 152, 153, 154, 155, 156, 157, 158], magicSum: 462, given: [null, 158, null, 152, null, null, null, 150, null] },
    { id: "Q122", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, null, null, 200, 208, null, 214, null, null] },
    { id: "Q123", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, 200, null, null, null, 204, null, 216, null] },
    { id: "Q124", order: 3, digits: [120, 121, 122, 123, 124, 125, 126, 127, 128], magicSum: 372, given: [null, null, 127, 126, null, null, 121, null, null] },
    { id: "Q125", order: 3, digits: [120, 121, 122, 123, 124, 125, 126, 127, 128], magicSum: 372, given: [null, null, null, null, null, 122, 121, 128, null] },
    { id: "Q126", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [214, 204, null, null, null, null, null, null, 202] },
    { id: "Q127", order: 3, digits: [120, 121, 122, 123, 124, 125, 126, 127, 128], magicSum: 372, given: [127, null, null, null, null, null, 123, null, 121] },
    { id: "Q128", order: 3, digits: [150, 151, 152, 153, 154, 155, 156, 157, 158], magicSum: 462, given: [null, null, null, 158, 154, null, null, 152, null] },
    { id: "Q129", order: 3, digits: [150, 151, 152, 153, 154, 155, 156, 157, 158], magicSum: 462, given: [153, 152, null, null, null, null, 151, null, null] },
    { id: "Q130", order: 3, digits: [200, 202, 204, 206, 208, 210, 212, 214, 216], magicSum: 624, given: [null, null, null, null, null, 212, null, 200, 210] }
  ];
  function getQuestion(id) {
    const q = QUESTIONS.find((x) => x.id === id);
    if (!q) throw new Error("unknown question " + id);
    return q;
  }
  function nextQuestionId(id) {
    const idx = QUESTIONS.findIndex((x) => x.id === id);
    if (idx < 0 || idx >= QUESTIONS.length - 1) return null;
    return QUESTIONS[idx + 1].id;
  }
  function parseOrder(id) {
    return Number(id.replace(/^Q/, ""));
  }

  // src/storage.ts
  var legacyCleared = false;
  function clearLegacyKeys() {
    if (legacyCleared) return;
    legacyCleared = true;
    try {
      for (const k of LEGACY_STORAGE_KEYS) {
        if (k === "huanfang:v0.4") {
          const old = localStorage.getItem(k);
          if (old && !localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, old);
          }
        }
        localStorage.removeItem(k);
      }
    } catch {
    }
  }
  var defaultProgress = () => ({
    completedIds: [],
    currentId: null,
    session: null,
    hintDay: todayKey(),
    hintUsed: 0,
    unlockedThrough: ADVANCED.freeBank,
    advancedRewardCount: 0
  });
  function todayKey() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(/* @__PURE__ */ new Date());
  }
  function normalize(raw) {
    const p = defaultProgress();
    if (Array.isArray(raw.completedIds)) {
      p.completedIds = raw.completedIds.filter((x) => typeof x === "string");
    }
    if (typeof raw.currentId === "string" || raw.currentId === null) {
      p.currentId = raw.currentId;
    }
    if (raw.session && typeof raw.session === "object") {
      const s = raw.session;
      const qid = s.questionId || s.levelId;
      if (qid && Array.isArray(s.board)) {
        p.session = {
          questionId: qid,
          board: s.board,
          history: Array.isArray(s.history) ? s.history : [],
          startedAt: Number(s.startedAt) || 0,
          elapsedMs: Number(s.elapsedMs) || 0
        };
      }
    }
    p.hintDay = typeof raw.hintDay === "string" ? raw.hintDay : todayKey();
    p.hintUsed = typeof raw.hintUsed === "number" ? raw.hintUsed : 0;
    if (p.hintDay !== todayKey()) {
      p.hintDay = todayKey();
      p.hintUsed = 0;
    }
    if (typeof raw.unlockedThrough === "number" && Number.isFinite(raw.unlockedThrough)) {
      p.unlockedThrough = Math.max(ADVANCED.freeBank, Math.floor(raw.unlockedThrough));
    } else {
      p.unlockedThrough = ADVANCED.freeBank;
    }
    if (typeof raw.advancedRewardCount === "number" && Number.isFinite(raw.advancedRewardCount)) {
      p.advancedRewardCount = Math.max(0, Math.floor(raw.advancedRewardCount));
    } else {
      p.advancedRewardCount = Math.max(
        0,
        Math.floor((p.unlockedThrough - ADVANCED.freeBank) / ADVANCED.unlockPerReward)
      );
    }
    return p;
  }
  function loadProgress() {
    clearLegacyKeys();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      return normalize(JSON.parse(raw));
    } catch {
      return defaultProgress();
    }
  }
  function saveProgress(p) {
    clearLegacyKeys();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
  function completedSet() {
    return new Set(loadProgress().completedIds);
  }
  function markCompleted(id) {
    const p = loadProgress();
    if (!p.completedIds.includes(id)) p.completedIds.push(id);
    p.currentId = id;
    saveProgress(p);
  }
  function setCurrentId(id) {
    const p = loadProgress();
    p.currentId = id;
    saveProgress(p);
  }
  function saveSession(session) {
    const p = loadProgress();
    p.session = session;
    if (session) p.currentId = session.questionId;
    saveProgress(p);
  }
  function consumeHint() {
    const p = loadProgress();
    if (p.hintDay !== todayKey()) {
      p.hintDay = todayKey();
      p.hintUsed = 0;
    }
    if (p.hintUsed >= HINT_DAILY_LIMIT) {
      return { ok: false, remain: 0 };
    }
    p.hintUsed += 1;
    saveProgress(p);
    return { ok: true, remain: HINT_DAILY_LIMIT - p.hintUsed };
  }
  function hintRemain() {
    const p = loadProgress();
    if (p.hintDay !== todayKey()) return HINT_DAILY_LIMIT;
    return Math.max(0, HINT_DAILY_LIMIT - p.hintUsed);
  }
  function getUnlockedThrough() {
    return loadProgress().unlockedThrough;
  }
  function isQuestionNumUnlocked(num) {
    return num <= getUnlockedThrough();
  }
  function isQuestionIdUnlocked(id) {
    const num = Number(String(id).replace(/^Q/i, ""));
    if (!Number.isFinite(num)) return false;
    return isQuestionNumUnlocked(num);
  }
  function unlockNextAdvancedBatch() {
    const p = loadProgress();
    p.unlockedThrough = Math.max(ADVANCED.freeBank, p.unlockedThrough) + ADVANCED.unlockPerReward;
    p.advancedRewardCount = (p.advancedRewardCount || 0) + 1;
    saveProgress(p);
    return p.unlockedThrough;
  }

  // src/hint.ts
  var CELL_LABEL = ["\u5DE6\u4E0A", "\u4E0A\u4E2D", "\u53F3\u4E0A", "\u5DE6\u4E2D", "\u6B63\u4E2D", "\u53F3\u4E2D", "\u5DE6\u4E0B", "\u4E0B\u4E2D", "\u53F3\u4E0B"];
  var PAIRS = [[3, 5], [1, 7], [0, 8], [2, 6]];
  var GOLDEN = [
    { corner: 0, sides: [5, 7] },
    { corner: 2, sides: [3, 7] },
    { corner: 6, sides: [1, 5] },
    { corner: 8, sides: [1, 3] }
  ];
  var LINES = makeLines(3);
  var C = 4;
  function solveBoard(start, digits, S) {
    const b = start.slice();
    const used = usedNumbers(b);
    let found = null;
    const ok = () => {
      for (const l of LINES) {
        let s = 0, f = 0;
        for (const i of l.cells) if (b[i] != null) {
          s += b[i];
          f++;
        }
        if (s > S || f === 3 && s !== S) return false;
      }
      return true;
    };
    const dfs = (p) => {
      if (found) return;
      if (p === 9) {
        found = b.slice();
        return;
      }
      if (b[p] != null) return dfs(p + 1);
      for (const n of digits) {
        if (used.has(n)) continue;
        b[p] = n;
        used.add(n);
        if (ok()) dfs(p + 1);
        used.delete(n);
        b[p] = null;
        if (found) return;
      }
    };
    dfs(0);
    return found;
  }
  var solCache = /* @__PURE__ */ new Map();
  function solutionOf(q) {
    if (!solCache.has(q.id)) solCache.set(q.id, solveBoard(q.given, q.digits, q.magicSum));
    return solCache.get(q.id);
  }
  var L = (i) => `\u300C${CELL_LABEL[i]}\u300D`;
  var lineLabelsOf = (cell) => LINES.filter((l) => l.cells.includes(cell));
  function forced(technique, cell, value, formula) {
    return {
      kind: "forced",
      technique,
      cell,
      value,
      message: `\u7528${technique}\uFF1A${formula}\uFF0C\u81EA\u5DF1\u7B97\u51FA${L(cell)}\u3002`,
      reveal: `${technique}\uFF1A${L(cell)} \u586B ${value}\u3002`
    };
  }
  function lineSumSource(board) {
    const full = LINES.find((l) => l.cells.every((c) => board[c] != null));
    if (full) return `\u7EBF\u548C = \u586B\u6EE1\u7684\u300C${full.label}\u300D\u4E09\u6570\u4E4B\u548C = ${full.cells.map((c) => board[c]).join(" + ")}`;
    if (board[C] != null) return `\u7EBF\u548C = 3\xD7\u4E2D\u5FC3 = 3\xD7${board[C]}`;
    return null;
  }
  function computeHint(board, givenMask, q) {
    const sol = solutionOf(q);
    if (sol) {
      const wrong = board.findIndex((v, i) => !givenMask[i] && v != null && v !== sol[i]);
      if (wrong >= 0) {
        const ls = lineLabelsOf(wrong);
        const full = ls.filter((l) => l.cells.every((c) => board[c] != null));
        const check = (full.length ? full : ls).map((l) => `\u300C${l.label}\u300D`).join("\u3001");
        const msg = `${L(wrong)} \u8FD9\u683C\u586B\u7684\u6570\u4E0D\u5BF9\u3002\u68C0\u67E5\u7ECF\u8FC7\u5B83\u7684\u7EBF\uFF1A${check}\uFF0C\u628A\u5B83\u6E05\u6389\u518D\u63A8\u3002`;
        return { kind: "wrong", cell: wrong, lineIds: ls.map((l) => l.id), message: msg, reveal: msg };
      }
    }
    if (!sol) {
      return { kind: "none", message: "\u5F53\u524D\u76D8\u9762\u65E0\u89E3\uFF0C\u8BF7\u64A4\u9500\u6700\u8FD1\u51E0\u6B65\u6216\u91CD\u5F00\u3002", reveal: "\u5F53\u524D\u76D8\u9762\u65E0\u89E3\uFF0C\u8BF7\u64A4\u9500\u6700\u8FD1\u51E0\u6B65\u6216\u91CD\u5F00\u3002" };
    }
    const empty = (i) => board[i] == null && !givenMask[i];
    if (!board.some((v, i) => v == null)) {
      return { kind: "none", message: "\u5DF2\u5168\u90E8\u586B\u5B8C\u3002", reveal: "\u5DF2\u5168\u90E8\u586B\u5B8C\u3002" };
    }
    const src = lineSumSource(board);
    if (src) {
      for (const l of LINES) {
        const e = l.cells.filter((c) => board[c] == null);
        if (e.length !== 1 || !empty(e[0])) continue;
        const cell = e[0];
        const others = l.cells.filter((c) => c !== cell).map((c) => board[c]);
        return forced(
          "\u7EBF\u548C\u516C\u5F0F\uFF08\u4E24\u6570\u63A8\u7B2C\u4E09\u683C\uFF09",
          cell,
          sol[cell],
          `${src}\uFF1B\u770B\u300C${l.label}\u300D\uFF0C${L(cell)} = \u7EBF\u548C \u2212 ${others.join(" \u2212 ")}`
        );
      }
    }
    if (empty(C)) {
      for (const [a, b] of PAIRS) {
        if (board[a] != null && board[b] != null) {
          return forced(
            "\u4E2D\u5FC3\u6570",
            C,
            sol[C],
            `\u4E2D\u5FC3 = \u5BF9\u79F0\u4E24\u6570\u4E4B\u548C \xF7 2 = (${L(a)}${board[a]} + ${L(b)}${board[b]}) \xF7 2`
          );
        }
      }
      const full = LINES.find((l) => l.cells.every((c) => board[c] != null));
      if (full) {
        return forced(
          "\u4E2D\u5FC3\u6570",
          C,
          sol[C],
          `\u4E2D\u5FC3 = \u7EBF\u548C \xF7 3\uFF0C\u7EBF\u548C\u7528\u586B\u6EE1\u7684\u300C${full.label}\u300D\u7B97\uFF1A(${full.cells.map((c) => board[c]).join(" + ")}) \xF7 3`
        );
      }
    }
    if (board[C] != null) {
      for (const [a, b] of PAIRS) {
        for (const [k, t] of [[a, b], [b, a]]) {
          if (board[k] != null && empty(t)) {
            return forced("\u914D\u5BF9\u6CD5", t, sol[t], `${L(t)} = 2\xD7\u4E2D\u5FC3 \u2212 ${L(k)} = 2\xD7${board[C]} \u2212 ${board[k]}`);
          }
        }
      }
    }
    for (let i = 0; i < LINES.length; i++) {
      for (let j = i + 1; j < LINES.length; j++) {
        const A = LINES[i], B = LINES[j];
        const shared = A.cells.filter((c) => B.cells.includes(c));
        if (shared.length !== 1) continue;
        const rA = A.cells.filter((c) => c !== shared[0]);
        const rB = B.cells.filter((c) => c !== shared[0]);
        for (const [P, K, lp, lk] of [[rA, rB, A.label, B.label], [rB, rA, B.label, A.label]]) {
          if (K.some((c) => board[c] == null)) continue;
          const e = P.filter((c) => board[c] == null);
          if (e.length !== 1 || !empty(e[0])) continue;
          const cell = e[0];
          const other = P.find((c) => c !== cell);
          return forced(
            "\u6BD4\u8F83\u6CD5\uFF08\u516C\u5171\u683C\uFF09",
            cell,
            sol[cell],
            `\u300C${lp}\u300D\u548C\u300C${lk}\u300D\u5171\u7528${L(shared[0])}\uFF0C\u5176\u4F59\u4E24\u683C\u4E4B\u548C\u76F8\u7B49\uFF1A${L(cell)} = (${K.map((c) => board[c]).join(" + ")}) \u2212 ${board[other]}`
          );
        }
      }
    }
    for (const g of GOLDEN) {
      const [s0, s1] = g.sides;
      const vc = board[g.corner], v0 = board[s0], v1 = board[s1];
      if (vc == null && v0 != null && v1 != null && empty(g.corner)) {
        return forced(
          "\u9EC4\u91D1\u4E09\u89D2\uFF08\u5F13\u7BAD\u578B\uFF09",
          g.corner,
          sol[g.corner],
          `2\xD7\u89D2 = \u4E0D\u76F8\u90BB\u4E24\u8FB9\u4E2D\u683C\u4E4B\u548C\uFF0C${L(g.corner)} = (${v0} + ${v1}) \xF7 2`
        );
      }
      for (const [t, k, vk] of [[s0, s1, v1], [s1, s0, v0]]) {
        if (vc != null && vk != null && board[t] == null && empty(t)) {
          return forced(
            "\u9EC4\u91D1\u4E09\u89D2\uFF08\u5F13\u7BAD\u578B\uFF09",
            t,
            sol[t],
            `2\xD7${L(g.corner)} = ${L(t)} + ${L(k)}\uFF0C${L(t)} = 2\xD7${vc} \u2212 ${vk}`
          );
        }
      }
    }
    return {
      kind: "none",
      message: "\u8FD9\u4E00\u6B65\u7528\u7EBF\u548C\u516C\u5F0F\u3001\u914D\u5BF9\u6CD5\u3001\u6BD4\u8F83\u6CD5\u3001\u9EC4\u91D1\u4E09\u89D2\u90FD\u8FD8\u63A8\u4E0D\u51FA\u6765\uFF0C\u5148\u68C0\u67E5\u5DF2\u586B\u7684\u6570\uFF0C\u6216\u64A4\u9500\u518D\u8BD5\u3002",
      reveal: "\u8FD9\u4E00\u6B65\u7528\u7EBF\u548C\u516C\u5F0F\u3001\u914D\u5BF9\u6CD5\u3001\u6BD4\u8F83\u6CD5\u3001\u9EC4\u91D1\u4E09\u89D2\u90FD\u8FD8\u63A8\u4E0D\u51FA\u6765\uFF0C\u5148\u68C0\u67E5\u5DF2\u586B\u7684\u6570\uFF0C\u6216\u64A4\u9500\u518D\u8BD5\u3002"
    };
  }

  // src/main.ts
  var BUILD = true ? "1793330969118" : String(Date.now());
  var app = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var state = {
    screen: "home",
    question: null,
    board: emptyBoard(3),
    givenMask: Array(9).fill(false),
    history: [],
    selected: null,
    startedAt: 0,
    elapsedMs: 0,
    timerId: null,
    hintMsg: null,
    hintCell: null,
    showGuide: false,
    winElapsed: 0,
    shareText: ""
  };
  function toast(msg, ms = 2200) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.setTimeout(() => toastEl.classList.remove("show"), ms);
  }
  function stopTimer() {
    if (state.timerId != null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }
  function startTimer(fromElapsed = 0) {
    stopTimer();
    state.elapsedMs = fromElapsed;
    state.startedAt = Date.now() - fromElapsed;
    state.timerId = window.setInterval(() => {
      state.elapsedMs = Date.now() - state.startedAt;
      const el = document.getElementById("timer");
      if (el) el.textContent = formatTime(state.elapsedMs);
      persistSession();
    }, 500);
  }
  function formatTime(ms) {
    const s = Math.floor(ms / 1e3);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }
  function givenMaskOf(q) {
    return q.given.map((v) => v != null);
  }
  function persistSession() {
    if (!state.question || state.screen !== "play") return;
    const session = {
      questionId: state.question.id,
      board: cloneBoard(state.board),
      history: state.history.slice(),
      startedAt: state.startedAt,
      elapsedMs: state.elapsedMs
    };
    saveSession(session);
  }
  function clearSession() {
    saveSession(null);
  }
  function beginQuestion(q, resume) {
    if (!isQuestionIdUnlocked(q.id)) {
      offerAdvancedUnlock(q.id);
      return;
    }
    stopTimer();
    state.question = q;
    state.givenMask = givenMaskOf(q);
    if (resume && resume.questionId === q.id && resume.board.length === 9) {
      state.board = cloneBoard(resume.board);
      state.history = resume.history.slice();
      state.elapsedMs = resume.elapsedMs;
      for (let i = 0; i < 9; i++) {
        if (state.givenMask[i]) state.board[i] = q.given[i];
      }
      state.history = state.history.filter((h) => !state.givenMask[h.index]);
    } else {
      state.board = cloneBoard(q.given);
      state.history = [];
      state.elapsedMs = 0;
    }
    state.selected = null;
    state.hintMsg = null;
    state.hintCell = null;
    state.showGuide = q.id === "Q1" && !resume;
    state.screen = "play";
    setCurrentId(q.id);
    startTimer(state.elapsedMs);
    persistSession();
    render();
  }
  function resolveStartTarget() {
    const progress = loadProgress();
    if (progress.session) {
      try {
        const q = getQuestion(progress.session.questionId);
        return { q, resume: progress.session };
      } catch {
      }
    }
    if (progress.currentId) {
      try {
        return { q: getQuestion(progress.currentId) };
      } catch {
      }
    }
    const done = new Set(progress.completedIds);
    const through = progress.unlockedThrough;
    const next = QUESTIONS.find((x) => !done.has(x.id) && parseOrder(x.id) <= through);
    return { q: next != null ? next : QUESTIONS[0] };
  }
  function goHome() {
    closeKeypad();
    stopTimer();
    persistSession();
    state.screen = "home";
    state.question = null;
    render();
  }
  function goRules() {
    closeKeypad();
    stopTimer();
    state.screen = "rules";
    render();
  }
  function goTips() {
    closeKeypad();
    stopTimer();
    state.screen = "tips";
    render();
  }
  function goPicker() {
    closeKeypad();
    stopTimer();
    persistSession();
    state.screen = "picker";
    render();
  }
  var keypadDraft = "";
  var keypadOpen = false;
  function closeKeypad() {
    keypadOpen = false;
    keypadDraft = "";
    const el = document.getElementById("keypad-overlay");
    if (el) el.remove();
  }
  function maxDigitLen(digits) {
    if (digits.length === 0) return 2;
    return Math.max(...digits.map((d) => String(d).length));
  }
  function syncKeypadDisplay() {
    const el = document.getElementById("keypad-draft");
    if (el) el.textContent = keypadDraft || "\xB7";
  }
  function appendKeypadDigit(d) {
    if (!state.question || !keypadOpen) return;
    const maxLen = maxDigitLen(state.question.digits);
    if (keypadDraft.length >= maxLen) return;
    keypadDraft += d;
    syncKeypadDisplay();
  }
  function backspaceKeypad() {
    if (!keypadOpen) return;
    keypadDraft = keypadDraft.slice(0, -1);
    syncKeypadDisplay();
  }
  function commitKeypad() {
    if (!state.question) return false;
    if (keypadDraft === "") {
      toast("\u8BF7\u8F93\u5165\u6570\u5B57");
      return false;
    }
    const n = Number(keypadDraft);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      toast("\u8BF7\u8F93\u5165\u6574\u6570");
      return false;
    }
    const ok = placeNumber(n);
    if (ok) closeKeypad();
    return ok;
  }
  function openKeypad() {
    if (!state.question) return;
    if (state.selected == null) return;
    if (state.givenMask[state.selected]) return;
    closeKeypad();
    keypadOpen = true;
    keypadDraft = "";
    const overlay = document.createElement("div");
    overlay.id = "keypad-overlay";
    overlay.className = "keypad-overlay";
    overlay.innerHTML = `
    <div class="keypad-card" role="dialog" aria-modal="true" aria-label="\u8F93\u5165\u6570\u5B57">
      <div class="keypad-title">\u8F93\u5165\u6570\u5B57</div>
      <div class="keypad-draft" id="keypad-draft">\xB7</div>
      <div class="keypad-grid">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" class="keypad-key" data-k="${n}">${n}</button>`).join("")}
        <button type="button" class="keypad-key keypad-key-muted" data-k="del">\u5220\u9664</button>
        <button type="button" class="keypad-key" data-k="0">0</button>
        <button type="button" class="keypad-key keypad-key-ok" data-k="ok">\u786E\u8BA4</button>
      </div>
      <button type="button" class="btn btn-ghost btn-block" id="keypad-cancel">\u53D6\u6D88</button>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeKeypad();
      }
    });
    overlay.querySelectorAll("[data-k]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const k = btn.dataset.k;
        if (k === "del") backspaceKeypad();
        else if (k === "ok") commitKeypad();
        else appendKeypadDigit(k);
      };
    });
    const cancel = overlay.querySelector("#keypad-cancel");
    cancel.onclick = (e) => {
      e.stopPropagation();
      closeKeypad();
    };
  }
  function placeNumber(n) {
    if (!state.question) return false;
    if (state.selected == null) {
      toast("\u8BF7\u5148\u70B9\u4E00\u4E2A\u7A7A\u683C");
      return false;
    }
    const i = state.selected;
    if (state.givenMask[i]) return false;
    const prev = state.board[i];
    if (prev === n) return true;
    if (!state.question.digits.includes(n)) {
      toast("\u672C\u9898\u6CA1\u6709\u8FD9\u4E2A\u6570");
      return false;
    }
    const usedAt = state.board.findIndex((v, idx) => idx !== i && v === n);
    if (usedAt >= 0) {
      if (state.givenMask[usedAt] === true) {
        toast("\u8FD9\u4E2A\u6570\u5377\u9762\u4E0A\u5DF2\u6709");
        return false;
      }
      const oldPrev = state.board[usedAt];
      state.board[usedAt] = null;
      state.history.push({ index: usedAt, prev: oldPrev, next: null });
      toast("\u5DF2\u79FB\u5230\u8FD9\u4E00\u683C");
    }
    state.board[i] = n;
    state.history.push({ index: i, prev, next: n });
    state.hintMsg = null;
    state.hintCell = null;
    persistSession();
    const q = state.question;
    if (isWin(state.board, q.digits, q.magicSum, q.order)) {
      closeKeypad();
      onWin();
      return true;
    }
    render();
    return true;
  }
  function clearSelected() {
    if (state.selected == null) return;
    const i = state.selected;
    if (state.givenMask[i]) return;
    const prev = state.board[i];
    if (prev == null) return;
    state.board[i] = null;
    state.history.push({ index: i, prev, next: null });
    persistSession();
    render();
  }
  function undo() {
    while (state.history.length > 0) {
      const move = state.history.pop();
      if (state.givenMask[move.index]) continue;
      state.board[move.index] = move.prev;
      state.selected = move.index;
      state.hintMsg = null;
      state.hintCell = null;
      persistSession();
      render();
      return;
    }
    toast("\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u6B65\u9AA4");
  }
  function onWin() {
    var _a, _b;
    stopTimer();
    state.winElapsed = state.elapsedMs;
    if (state.question) markCompleted(state.question.id);
    clearSession();
    const t = formatTime(state.winElapsed);
    const q = state.question;
    const id = (_a = q == null ? void 0 : q.id) != null ? _a : "";
    const sum = (_b = q == null ? void 0 : q.magicSum) != null ? _b : "";
    state.shareText = `\u5E7B\u65B9 \xB7 ${id} \u7528\u65F6 ${t} \xB7 8 \u7EBF\u5168\u90E8\u5BF9\u9F50 \xB7 \u548C=${sum}`;
    state.screen = "win";
    render();
  }
  var hintCache = null;
  function boardKey() {
    var _a, _b;
    return `${(_b = (_a = state.question) == null ? void 0 : _a.id) != null ? _b : ""}|${state.board.map((v) => v == null ? "_" : v).join(",")}`;
  }
  function showHint(hint, level, suffix) {
    state.hintMsg = `${level === 1 ? hint.message : hint.reveal}${suffix}`;
    const focus = hint.kind === "none" ? null : hint.cell;
    state.hintCell = focus;
    if (focus != null) state.selected = focus;
    render();
  }
  function applyHint(suffix) {
    if (!state.question) return;
    const hint = computeHint(state.board, state.givenMask, state.question);
    hintCache = { key: boardKey(), hint, level: 1 };
    const more = hint.kind === "forced" ? " \u518D\u70B9\u4E00\u6B21\u63D0\u793A\u770B\u7B54\u6848\uFF08\u4E0D\u6263\u6B21\u6570\uFF09\u3002" : "";
    showHint(hint, 1, `${more}${suffix}`);
  }
  function useHint() {
    if (!state.question) return;
    if (hintCache && hintCache.key === boardKey()) {
      const h = hintCache.hint;
      if (h.kind === "forced") hintCache.level = 2;
      showHint(h, hintCache.level, "\uFF08\u540C\u4E00\u76D8\u9762\uFF0C\u4E0D\u6263\u6B21\u6570\uFF09");
      return;
    }
    const remain = hintRemain();
    if (remain > 0) {
      const r = consumeHint();
      if (!r.ok) {
        toast(`\u4ECA\u65E5\u514D\u8D39\u63D0\u793A\u5DF2\u7528\u5B8C\uFF08${HINT_DAILY_LIMIT} \u6B21\uFF09`);
        return;
      }
      applyHint(`\uFF08\u4ECA\u65E5\u514D\u8D39\u5269\u4F59 ${r.remain} \u6B21\uFF09`);
      return;
    }
    if (MONETIZATION.rewardAfterQuota && ADS.fakeRewardEnabled) {
      openFakeRewardAd({
        copy: {
          title: ADS.title,
          sub: ADS.sub,
          primary: ADS.primary,
          secondary: ADS.secondary,
          footer: ADS.footer,
          playingHint: ADS.playingHint,
          claim: ADS.claim
        },
        onSuccess: () => {
          applyHint("\uFF08\u6FC0\u52B1\u5DF2\u89E3\u9501 1 \u6B21\u63D0\u793A\uFF09");
          toast("\u5DF2\u89E3\u9501 1 \u6B21\u63D0\u793A");
        },
        onCancel: () => toast("\u7A0D\u540E\u518D\u8BF4 \xB7 \u672A\u6D88\u8017\u6B21\u6570")
      });
      return;
    }
    toast(`\u4ECA\u65E5\u63D0\u793A\u5DF2\u7528\u5B8C\uFF08${HINT_DAILY_LIMIT} \u6B21\uFF09`);
  }
  function openFakeRewardAd(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const existing = document.getElementById("fake-ad-overlay");
    if (existing) existing.remove();
    const copy = {
      title: (_b = (_a = opts.copy) == null ? void 0 : _a.title) != null ? _b : ADS.title,
      sub: (_d = (_c = opts.copy) == null ? void 0 : _c.sub) != null ? _d : ADS.sub,
      primary: (_f = (_e = opts.copy) == null ? void 0 : _e.primary) != null ? _f : ADS.primary,
      secondary: (_h = (_g = opts.copy) == null ? void 0 : _g.secondary) != null ? _h : ADS.secondary,
      footer: (_j = (_i = opts.copy) == null ? void 0 : _i.footer) != null ? _j : ADS.footer,
      playingHint: (_l = (_k = opts.copy) == null ? void 0 : _k.playingHint) != null ? _l : ADS.playingHint,
      claim: (_n = (_m = opts.copy) == null ? void 0 : _m.claim) != null ? _n : ADS.claim
    };
    const dur = ADS.rewardDurationSec;
    const unlockAt = ADS.skipAfterSec;
    const overlay = document.createElement("div");
    overlay.id = "fake-ad-overlay";
    overlay.className = "fake-ad-overlay";
    overlay.innerHTML = `
    <div class="fake-ad-card" role="dialog" aria-modal="true" aria-label="\u6FC0\u52B1\u89C6\u9891">
      <div class="fake-ad-accent"></div>
      <div class="fake-ad-icon-wrap"><img class="fake-ad-icon" src="${UI_ICONS.hint}" alt="" width="40" height="40" /></div>
      <h3 class="fake-ad-title">${copy.title}</h3>
      <p class="fake-ad-sub">${copy.sub}</p>
      <div class="fake-ad-stage" id="fake-ad-stage">
        <div class="fake-ad-placeholder">
          <span class="fake-ad-play">\u25B6</span>
          <span class="fake-ad-ad-badge">\u5E7F\u544A\u793A\u610F</span>
          <span class="fake-ad-stage-hint">${copy.playingHint}</span>
        </div>
      </div>
      <div class="fake-ad-actions-col" id="fake-ad-actions">
        <button type="button" class="btn btn-primary btn-block" id="fake-ad-start">${copy.primary}</button>
        <button type="button" class="btn btn-ghost btn-block" id="fake-ad-later">${copy.secondary}</button>
      </div>
      <p class="fake-ad-footer">${copy.footer}</p>
    </div>`;
    document.body.appendChild(overlay);
    let sec = 0;
    let done = false;
    let tick = 0;
    const stage = overlay.querySelector("#fake-ad-stage");
    const actions = overlay.querySelector("#fake-ad-actions");
    const startBtn = overlay.querySelector("#fake-ad-start");
    const laterBtn = overlay.querySelector("#fake-ad-later");
    const cleanup = () => {
      if (tick) window.clearInterval(tick);
      overlay.remove();
    };
    laterBtn.onclick = () => {
      if (done) return;
      done = true;
      cleanup();
      opts.onCancel();
    };
    startBtn.onclick = () => {
      if (done) return;
      stage.innerHTML = `
      <div class="fake-ad-player">
        <span class="fake-ad-ad-badge">\u5E7F\u544A\u793A\u610F</span>
        <div class="fake-ad-progress"><div class="fake-ad-bar" id="fake-ad-bar"></div></div>
        <div class="fake-ad-timer" id="fake-ad-timer">0 / ${dur}s</div>
        <p class="fake-ad-stage-hint">${copy.playingHint}</p>
      </div>`;
      actions.innerHTML = `
      <button type="button" class="btn btn-primary btn-block" id="fake-ad-claim" disabled>${copy.claim}</button>
      <button type="button" class="btn btn-ghost btn-block" id="fake-ad-close">${copy.secondary}</button>`;
      const bar = overlay.querySelector("#fake-ad-bar");
      const timerEl = overlay.querySelector("#fake-ad-timer");
      const claimBtn = overlay.querySelector("#fake-ad-claim");
      const closeBtn = overlay.querySelector("#fake-ad-close");
      closeBtn.onclick = () => {
        if (done) return;
        done = true;
        cleanup();
        opts.onCancel();
      };
      claimBtn.onclick = () => {
        if (done || claimBtn.disabled || sec < unlockAt) return;
        done = true;
        cleanup();
        opts.onSuccess();
      };
      tick = window.setInterval(() => {
        sec += 1;
        bar.style.width = Math.min(100, sec / dur * 100) + "%";
        timerEl.textContent = `${Math.min(sec, dur)} / ${dur}s`;
        if (sec >= unlockAt) claimBtn.disabled = false;
        if (sec >= dur) {
          window.clearInterval(tick);
          tick = 0;
          claimBtn.disabled = false;
        }
      }, 1e3);
    };
  }
  function restartQuestion() {
    if (!state.question) return;
    beginQuestion(state.question);
  }
  function icon(name, cls = "ui-icon") {
    const src = UI_ICONS[name];
    return `<img class="${cls}" src="${src}" alt="" width="20" height="20" decoding="async" />`;
  }
  function guideText(_q) {
    return `\u70B9\u7A7A\u683C\u540E\u81EA\u884C\u8F93\u5165\u6570\u5B57\uFF0C\u8BA9\u6BCF\u4E00\u884C\u3001\u6BCF\u4E00\u5217\u3001\u4E24\u6761\u5BF9\u89D2\u7EBF\u7684\u548C\u90FD\u4E00\u6837\u3002\u63D0\u793A\u4F1A\u70B9\u540D\u62DB\u5F0F\u3001\u53EA\u63A8\u4E00\u6B65\uFF0C\u4E0D\u7ED9\u5019\u9009\u6570\u6E05\u5355\u3002`;
  }
  function offerAdvancedUnlock(targetId) {
    if (!ADS.fakeRewardEnabled) {
      toast("\u8FDB\u9636\u9898\u6682\u672A\u89E3\u9501");
      return;
    }
    const through = getUnlockedThrough();
    const nextCap = through + ADVANCED.unlockPerReward;
    openFakeRewardAd({
      copy: {
        title: ADS_ADVANCED.title,
        sub: ADS_ADVANCED.sub,
        primary: ADS_ADVANCED.primary,
        secondary: ADS_ADVANCED.secondary,
        footer: ADS_ADVANCED.footer,
        playingHint: ADS_ADVANCED.playingHint,
        claim: ADS_ADVANCED.claim
      },
      onSuccess: () => {
        const neu = unlockNextAdvancedBatch();
        toast(`\u5DF2\u89E3\u9501\u81F3 Q${neu}\uFF08+${ADVANCED.unlockPerReward} \u9898\uFF09`);
        if (targetId && isQuestionIdUnlocked(targetId)) {
          beginQuestion(getQuestion(targetId));
        } else {
          const first = QUESTIONS.find((x) => parseOrder(x.id) === through + 1);
          if (first && isQuestionIdUnlocked(first.id)) beginQuestion(first);
          else render();
        }
      },
      onCancel: () => toast("\u672A\u89E3\u9501 \xB7 \u53EF\u968F\u65F6\u518D\u8BD5")
    });
  }
  function render() {
    if (MONETIZATION.membership || MONETIZATION.coverAd || MONETIZATION.interstitial || MONETIZATION.lockLevels) {
      console.warn("[huanfang] forbidden monetization flag on");
    }
    if (state.screen === "home") renderHome();
    else if (state.screen === "play") renderPlay();
    else if (state.screen === "win") renderWin();
    else if (state.screen === "rules") renderRules();
    else if (state.screen === "tips") renderTips();
    else if (state.screen === "picker") renderPicker();
  }
  function renderHome() {
    const progress = loadProgress();
    const done = new Set(progress.completedIds);
    const doneCount = done.size;
    const unlockedThrough = progress.unlockedThrough;
    const freeDone = QUESTIONS.filter((q) => parseOrder(q.id) <= FREE_BANK && done.has(q.id)).length;
    const hasProgress = doneCount > 0 || !!progress.currentId || !!progress.session;
    let sessionOk = false;
    if (progress.session) {
      try {
        getQuestion(progress.session.questionId);
        sessionOk = true;
      } catch {
        sessionOk = false;
      }
    }
    const resumeLabel = sessionOk ? `\u7EED\u5237 \xB7 ${progress.session.questionId}` : progress.currentId ? `\u7EED\u5237 \xB7 ${progress.currentId}` : "\u7EED\u5237";
    const freeAllDone = freeDone >= FREE_BANK;
    const canUnlockMore = unlockedThrough < QUESTION_COUNT;
    app.innerHTML = `
    <header class="home-header">
      <div class="brand-ring">${icon("play", "ui-icon ui-icon-lg")}</div>
      <h1>${APP_NAME}</h1>
      <p class="tagline">\u7EC3\u4E60\u9898\u5E93 \xB7 ${QUESTION_COUNT} \u9053\u4E09\u9636 \xB7 \u524D ${FREE_BANK} \u9898\u514D\u8D39</p>
      <div class="progress-pill">\u8FDB\u5EA6 <b>${doneCount}</b> / ${QUESTION_COUNT} \xB7 \u5DF2\u89E3\u9501\u81F3 Q${unlockedThrough}</div>
    </header>
    <div class="home-actions">
      <button class="btn btn-primary btn-block" id="btn-start" type="button">
        ${icon("play")} ${hasProgress ? "\u5F00\u59CB\u7EC3\u4E60 \xB7 \u7EED\u5F53\u524D" : "\u5F00\u59CB\u7EC3\u4E60"}
      </button>
      ${hasProgress ? `<button class="btn btn-ghost btn-block" id="btn-resume" type="button">${icon("play")} ${escapeHtml(resumeLabel)}</button>` : ""}
      <button class="btn btn-ghost btn-block" id="btn-picker" type="button">${icon("levels")} \u9898\u53F7\u5217\u8868</button>
      ${freeAllDone || unlockedThrough > FREE_BANK || canUnlockMore ? `<button class="btn btn-ghost btn-block btn-advanced" id="btn-advanced" type="button">${icon("levels")} \u8FDB\u9636\u9898${unlockedThrough >= QUESTION_COUNT ? " \xB7 \u5DF2\u5168\u5F00" : unlockedThrough > FREE_BANK ? ` \xB7 \u81F3 Q${unlockedThrough}` : " \xB7 \u770B\u89C6\u9891\u89E3\u9501"}</button>` : ""}
    </div>
    <div class="home-footer">
      <p class="pledge">\u6CA1\u6709\u63D2\u5C4F\u6253\u6270 \xB7 \u6CA1\u6709\u4F1A\u5458 \xB7 \u524D ${FREE_BANK} \u9898\u968F\u4FBF\u8FDB</p>
      <div class="home-footer-links">
        <button class="btn btn-ghost btn-sm" id="btn-rules" type="button">${icon("rules")} \u89C4\u5219</button>
        <button class="btn btn-ghost btn-sm" id="btn-tips" type="button">${icon("hint")} \u6280\u5DE7</button>
      </div>
      <div class="ver">v0.6.2 \xB7 UI v1.3 \xB7 build ${BUILD}</div>
    </div>
  `;
    document.getElementById("btn-start").onclick = () => {
      const t = resolveStartTarget();
      beginQuestion(t.q, t.resume);
    };
    const btnResume = document.getElementById("btn-resume");
    if (btnResume) {
      btnResume.onclick = () => {
        const t = resolveStartTarget();
        beginQuestion(t.q, t.resume);
      };
    }
    document.getElementById("btn-picker").onclick = () => goPicker();
    const btnAdv = document.getElementById("btn-advanced");
    if (btnAdv) {
      btnAdv.onclick = () => {
        if (unlockedThrough >= QUESTION_COUNT) {
          goPicker();
          return;
        }
        if (unlockedThrough > FREE_BANK) {
          const next = QUESTIONS.find((x) => parseOrder(x.id) === unlockedThrough) || QUESTIONS.find((x) => parseOrder(x.id) === FREE_BANK + 1);
          if (next && isQuestionIdUnlocked(next.id)) beginQuestion(next);
          else offerAdvancedUnlock();
          return;
        }
        offerAdvancedUnlock(`Q${FREE_BANK + 1}`);
      };
    }
    document.getElementById("btn-rules").onclick = () => goRules();
    document.getElementById("btn-tips").onclick = () => goTips();
  }
  function renderPicker() {
    const done = completedSet();
    const progress = loadProgress();
    const current = progress.currentId;
    const unlockedThrough = progress.unlockedThrough;
    const cellHtml = (q) => {
      const isDone = done.has(q.id);
      const isCur = current === q.id;
      const num = parseOrder(q.id);
      const locked = num > unlockedThrough;
      const cls = [
        "picker-cell",
        isDone ? "done" : "",
        isCur ? "current" : "",
        locked ? "locked" : "",
        num > FREE_BANK ? "advanced" : "free"
      ].filter(Boolean).join(" ");
      return `<button type="button" class="${cls}" data-qid="${q.id}" data-locked="${locked ? "1" : "0"}" aria-label="${q.id}${locked ? " \u672A\u89E3\u9501" : ""}">
      <span class="picker-num">${num}</span>
      ${locked ? '<span class="picker-lock">\u9501</span>' : isDone ? `<span class="picker-check">${icon("check", "ui-icon ui-icon-sm")}</span>` : ""}
    </button>`;
    };
    const freeQs = QUESTIONS.filter((q) => parseOrder(q.id) <= FREE_BANK);
    const advQs = QUESTIONS.filter((q) => parseOrder(q.id) > FREE_BANK);
    app.innerHTML = `
    <div class="topbar">
      <button class="btn btn-ghost btn-sm" id="btn-back" type="button">\u8FD4\u56DE</button>
      <div class="title">${icon("levels", "ui-icon ui-icon-sm")} \u9898\u53F7\u5217\u8868</div>
      <div style="width:48px"></div>
    </div>
    <p class="picker-hint">\u514D\u8D39\u533A Q1\u2013Q${FREE_BANK} \u5168\u5F00 \xB7 \u8FDB\u9636\u533A\u5DF2\u89E3\u9501\u81F3 Q${unlockedThrough}</p>
    <h3 class="picker-section">\u514D\u8D39\u533A</h3>
    <div class="picker-grid">${freeQs.map(cellHtml).join("")}</div>
    <h3 class="picker-section">\u8FDB\u9636\u533A <span class="picker-section-meta">${ADVANCED_COUNT} \u9898 \xB7 \u6BCF\u6B21\u89E3\u9501 ${ADVANCED.unlockPerReward} \u9053</span></h3>
    <div class="picker-grid">${advQs.map(cellHtml).join("")}</div>
    ${unlockedThrough < QUESTION_COUNT ? `<button class="btn btn-primary btn-block picker-unlock-btn" id="btn-unlock-more" type="button">\u770B\u77ED\u89C6\u9891\u89E3\u9501 ${ADVANCED.unlockPerReward} \u9053\u8FDB\u9636\u9898</button>` : '<p class="picker-hint">\u8FDB\u9636\u9898\u5DF2\u5168\u90E8\u89E3\u9501 \u{1F389}</p>'}
  `;
    document.getElementById("btn-back").onclick = () => goHome();
    const btnUnlock = document.getElementById("btn-unlock-more");
    if (btnUnlock) btnUnlock.onclick = () => offerAdvancedUnlock();
    app.querySelectorAll("[data-qid]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.qid;
        if (btn.dataset.locked === "1") {
          offerAdvancedUnlock(id);
          return;
        }
        beginQuestion(getQuestion(id));
      };
    });
  }
  function renderPlay() {
    closeKeypad();
    const q = state.question;
    const lines = allLinesStatus(state.board, q.order, q.magicSum);
    const cells = state.board.map((v, i) => {
      const given = state.givenMask[i];
      const cls = [
        "cell",
        given ? "given" : "",
        !given && v != null ? "user" : "",
        v == null && !given ? "empty" : "",
        state.selected === i ? "selected" : "",
        state.hintCell === i ? "hint-focus" : ""
      ].filter(Boolean).join(" ");
      const display = v == null ? "\xB7" : String(v);
      return `<button class="${cls}" data-cell="${i}" type="button" ${given ? 'aria-disabled="true"' : ""}>${display}</button>`;
    }).join("");
    const lineChips = lines.map((l) => {
      const mark = l.status === "correct" ? "\u2713" : l.status === "wrong" ? "!" : "\u2014";
      return `<div class="line-chip ${l.status}" data-line="${l.id}">
        <span class="lbl">${l.label}</span>
        <span class="val">${l.sum} ${mark}</span>
      </div>`;
    }).join("");
    app.innerHTML = `
    <div class="topbar">
      <button class="btn btn-ghost btn-sm" id="btn-back" type="button">\u8FD4\u56DE</button>
      <div class="title">${escapeHtml(q.id)}</div>
      <div class="timer" id="timer">${formatTime(state.elapsedMs)}</div>
    </div>
    <div class="play-meta">3\xD73 \xB7 8\u7EBF</div>
    ${state.showGuide ? `<div class="guide-banner" id="guide">${guideText(q)}</div>` : ""}
    <div class="play-card">
      <div class="board-wrap"><div class="board order-3" style="grid-template-columns: repeat(3, 1fr)">${cells}</div></div>
      <div class="lines-panel">${lineChips}</div>
      <p class="input-hint">\u70B9\u7A7A\u683C\u540E\u81EA\u884C\u8F93\u5165\u6570\u5B57</p>
      <div class="toolbar">
        <button class="btn btn-ghost btn-sm" id="btn-undo" type="button">${icon("undo")} \u64A4\u9500</button>
        <button class="btn btn-ghost btn-sm" id="btn-clear" type="button">\u6E05\u9664\u683C</button>
        <button class="btn btn-ghost btn-sm btn-hint" id="btn-hint" type="button">${icon("hint")} \u63D0\u793A ${hintRemain()}</button>
        <button class="btn btn-ghost btn-sm" id="btn-reset" type="button">\u91CD\u5F00</button>
      </div>
      ${state.hintMsg ? `<div class="hint-banner">${escapeHtml(state.hintMsg)}</div>` : ""}
    </div>
  `;
    document.getElementById("btn-back").onclick = () => {
      closeKeypad();
      goHome();
    };
    document.getElementById("btn-undo").onclick = () => {
      closeKeypad();
      undo();
    };
    document.getElementById("btn-clear").onclick = () => {
      closeKeypad();
      clearSelected();
    };
    document.getElementById("btn-hint").onclick = () => {
      closeKeypad();
      useHint();
    };
    document.getElementById("btn-reset").onclick = () => {
      if (confirm("\u91CD\u5F00\u672C\u9898\uFF1F\u5C06\u6E05\u7A7A\u5DF2\u586B\u6570\u5B57\uFF08\u5DF2\u77E5\u683C\u4FDD\u7559\uFF09\u3002")) {
        closeKeypad();
        restartQuestion();
      }
    };
    const guide = document.getElementById("guide");
    if (guide) {
      guide.onclick = () => {
        state.showGuide = false;
        render();
      };
    }
    app.querySelectorAll("[data-cell]").forEach((btn) => {
      btn.onclick = () => {
        const i = Number(btn.dataset.cell);
        if (state.givenMask[i]) {
          toast("\u5DF2\u77E5\u683C\u4E0D\u53EF\u6539");
          return;
        }
        state.selected = i;
        state.hintCell = null;
        app.querySelectorAll("[data-cell]").forEach((c) => {
          const idx = Number(c.dataset.cell);
          c.classList.toggle("selected", idx === i);
          c.classList.remove("hint-focus");
        });
        openKeypad();
      };
    });
  }
  function renderWin() {
    var _a, _b;
    const q = state.question;
    const next = q ? nextQuestionId(q.id) : null;
    const magic = (_a = q == null ? void 0 : q.magicSum) != null ? _a : "";
    const unlockedThrough = getUnlockedThrough();
    const nextNum = next ? parseOrder(next) : null;
    const nextLocked = nextNum != null && nextNum > unlockedThrough;
    const isFreeDone = q ? parseOrder(q.id) === FREE_BANK : false;
    const isBankDone = q ? parseOrder(q.id) === QUESTION_COUNT : false;
    const timeStr = formatTime(state.winElapsed);
    let primaryBtn = "";
    if (next && !nextLocked) {
      primaryBtn = `<button class="btn btn-primary btn-block" id="btn-next" type="button">${icon("play")} \u4E0B\u4E00\u9898</button>`;
    } else if (next && nextLocked) {
      primaryBtn = `<button class="btn btn-primary btn-block" id="btn-unlock-next" type="button">${icon("play")} \u770B\u89C6\u9891\u89E3\u9501\u8FDB\u9636\u9898</button>`;
    } else {
      primaryBtn = `<button class="btn btn-primary btn-block" id="btn-done" type="button">\u9898\u5E93\u5B8C\u6210 \xB7 \u56DE\u9996\u9875</button>`;
    }
    app.innerHTML = `
    <div class="win-card">
      <div class="win-badge">${icon("check", "ui-icon ui-icon-lg")}</div>
      <h2>\u592A\u68D2\u4E86\uFF0C\u901A\u5173\uFF01</h2>
      <div class="win-sum">8 \u6761\u7EBF\u7684\u548C\u5168\u90E8\u662F ${magic} \u2713</div>
      <div class="win-time">\u7528\u65F6 ${timeStr} \xB7 ${escapeHtml((_b = q == null ? void 0 : q.id) != null ? _b : "")}</div>
      <div class="win-time-accent" aria-hidden="true"></div>
      <div class="win-actions">
        ${primaryBtn}
        <button class="btn btn-ghost btn-block" id="btn-home" type="button">\u56DE\u9996\u9875</button>
        <button class="btn btn-ghost btn-block" id="btn-copy" type="button">${icon("share")} \u590D\u5236\u5206\u4EAB\u6587\u6848</button>
      </div>
      <div class="share-card-wrap">
        <img class="share-card-bg" src="${SHARE_CARD_IMG}?v=${BUILD}" alt="\u5206\u4EAB\u5361" width="500" height="400" decoding="async" />
        <div class="share-overlay-title">\u7B2C ${q ? parseOrder(q.id) : ""} \u9898 \xB7 \u901A\u5173\u5566</div>
        <div class="share-overlay">
          <div class="share-overlay-sum">8 \u7EBF\u5168\u90E8\u5BF9\u9F50 \xB7 \u548C=${magic}</div>
          <div class="share-overlay-time">${timeStr}</div>
        </div>
      </div>
      <div class="share-box">${escapeHtml(state.shareText)}
        <div class="share-url">${SHARE_URL}</div>
      </div>
      ${isFreeDone && nextLocked ? '<p class="win-bank-done">\u514D\u8D39\u533A\u5237\u5B8C\u5566 \xB7 \u8FDB\u9636\u9898\u770B\u77ED\u89C6\u9891\u89E3\u9501 \u{1F389}</p>' : ""}
      ${isBankDone ? '<p class="win-bank-done">\u5DF2\u5237\u5B8C\u5168\u90E8\u9898\u5E93 \u{1F389}</p>' : ""}
    </div>
  `;
    const btnNext = document.getElementById("btn-next");
    if (btnNext && next) {
      btnNext.onclick = () => beginQuestion(getQuestion(next));
    }
    const btnUnlockNext = document.getElementById("btn-unlock-next");
    if (btnUnlockNext && next) {
      btnUnlockNext.onclick = () => offerAdvancedUnlock(next);
    }
    const btnDone = document.getElementById("btn-done");
    if (btnDone) btnDone.onclick = () => goHome();
    document.getElementById("btn-home").onclick = () => goHome();
    document.getElementById("btn-copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(state.shareText + " " + SHARE_URL);
        toast("\u5DF2\u590D\u5236");
      } catch {
        toast(state.shareText, 4e3);
      }
    };
  }
  function renderRules() {
    app.innerHTML = `
    <div class="topbar">
      <button class="btn btn-ghost btn-sm" id="btn-back" type="button">\u8FD4\u56DE</button>
      <div class="title">${icon("rules", "ui-icon ui-icon-sm")} \u89C4\u5219</div>
      <div style="width:48px"></div>
    </div>
    <div class="rules-card">
      <img class="rules-hero" src="assets/ui/screens/rules_simple.png?v=${BUILD}" alt="\u89C4\u5219\u793A\u610F" loading="lazy" decoding="async" />
      <h2>\u7EC3\u4E60\u9898\u5E93\u73A9\u6CD5</h2>
      <p>\u5728 <strong>3\xD73</strong> \u5BAB\u683C\u4E2D\u586B\u5165\u672C\u9898\u7ED9\u5B9A\u6570\u5B57<strong>\u5404\u4E00\u6B21</strong>\uFF0C\u4F7F<strong>\u6BCF\u4E00\u884C\u3001\u6BCF\u4E00\u5217\u3001\u4E24\u6761\u5BF9\u89D2\u7EBF</strong>\u7684\u6570\u5B57\u4E4B\u548C\u90FD<strong>\u76F8\u540C</strong>\u3002\u5BF9\u89D2\u7EBF\u662F\u5FC5\u9009\u7EA6\u675F\uFF0C\u4E0D\u662F\u53EF\u9009\u73A9\u6CD5\u3002</p>
      <h3>\u600E\u4E48\u586B</h3>
      <ul>
        <li>\u70B9\u7A7A\u683C\u540E\u81EA\u884C\u8F93\u5165\u6570\u5B57\uFF1B\u4E0D\u63D0\u4F9B\u5907\u9009\u6570\u5B57\u6761\u3001\u4E0D\u5C55\u793A\u53EF\u9009\u6570</li>
        <li>\u5DF2\u77E5\u6B8B\u5C40\u683C\u4E0D\u53EF\u6539\uFF1B\u64A4\u9500\u53EA\u56DE\u9000\u4F60\u586B\u5165\u7684\u6570\u5B57</li>
      </ul>
      <h3>\u7EBF\u548C\u9762\u677F</h3>
      <ul>
        <li>\u5C40\u5185\u5B9E\u65F6\u663E\u793A\u6BCF\u6761\u7EBF<strong>\u5F53\u524D\u548C</strong>\uFF08\u4E0D\u663E\u793A\u300C\u5E7B\u548C N\u300D\u76EE\u6807\u6570\uFF09</li>
        <li>\u586B\u6EE1\u4E14\u548C\u5176\u4ED6\u6B63\u786E\u7EBF\u4E00\u81F4\uFF1A\u7EFF \u2713\uFF1B\u586B\u6EE1\u4F46\u5BF9\u4E0D\u4E0A\uFF1A\u7425\u73C0 !</li>
      </ul>
      <h3>\u63D0\u793A</h3>
      <ul>
        <li>\u70B9\u540D\u62DB\u5F0F\u3001\u5148\u7ED9\u7B97\u5F0F\uFF0C\u540C\u4E00\u76D8\u9762\u518D\u70B9\u624D\u7ED9\u6570\u5B57\uFF08\u6BCF\u65E5\u514D\u8D39 ${HINT_DAILY_LIMIT} \u6B21\uFF1B\u7528\u5C3D\u53EF\u770B\u77ED\u89C6\u9891\u518D\u6362 1 \u6B21\uFF09</li>
        <li>\u4E0D\u7ED9\u5019\u9009\u6570\u6E05\u5355\u3001\u4E0D\u7ED9\u5168\u76D8\u7B54\u6848</li>
      </ul>
      <h3>\u9898\u5E93\u4E0E\u901A\u5173</h3>
      <ul>
        <li>\u5171 <b>${QUESTION_COUNT}</b> \u9053\u4E09\u9636\u9898\uFF1B\u524D <b>${FREE_BANK}</b> \u9898\u514D\u8D39\u5168\u5F00\uFF0C\u8FDB\u9636\u533A\u6BCF\u6B21\u770B\u77ED\u89C6\u9891\u89E3\u9501 ${ADVANCED.unlockPerReward} \u9053</li>
        <li>\u4E0D\u9501\u5173\uFF1A\u514D\u8D39\u533A\u9898\u53F7\u968F\u4FBF\u8DF3\uFF1B\u8FDB\u9636\u672A\u89E3\u9501\u9898\u70B9\u8FDB\u53EF\u770B\u89C6\u9891\u89E3\u9501</li>
      </ul>
      <div class="note">\u6CA1\u6709\u63D2\u5C4F\u6253\u6270 \xB7 \u6CA1\u6709\u4F1A\u5458 \xB7 \u524D ${FREE_BANK} \u9898\u968F\u4FBF\u8DF3\u3002\u60F3\u5B66\u62DB\u5F0F\u8BF7\u770B\u300C\u6280\u5DE7\u300D\u9875\u3002</div>
      <div class="rules-footer-actions">
        <button class="btn btn-ghost btn-block" id="btn-to-tips" type="button">${icon("hint")} \u4E09\u9636\u5DE7\u586B\u6280\u5DE7</button>
        <button class="btn btn-primary btn-block" id="btn-play" type="button">${icon("play")} \u5F00\u59CB\u7EC3\u4E60</button>
      </div>
    </div>
  `;
    document.getElementById("btn-back").onclick = () => goHome();
    document.getElementById("btn-to-tips").onclick = () => goTips();
    document.getElementById("btn-play").onclick = () => {
      const t = resolveStartTarget();
      beginQuestion(t.q, t.resume);
    };
  }
  var TIP_CARDS = [
    {
      file: "tip_01_center.png",
      title: "\u4E2D\u5FC3\u6570",
      body: "\u4E2D\u5FC3 = \u8FC7\u4E2D\u5FC3\u90A3\u6761\u7EBF\u4E24\u7AEF\u4E24\u4E2A\u6570\u7684\u548C \xF7 2\uFF1B\u4E5F\u7B49\u4E8E\u5168\u90E8\u4E5D\u4E2A\u6570\u7684\u548C \xF7 9\u3002"
    },
    {
      file: "tip_02_linesum.png",
      title: "\u7EBF\u548C\u516C\u5F0F",
      body: "\u6BCF\u6761\u7EBF\u7684\u548C = \u4E5D\u4E2A\u6570\u7684\u603B\u548C \xF7 3 = \u4E2D\u5FC3 \xD7 3\u3002"
    },
    {
      file: "tip_03_pairs.png",
      title: "\u914D\u5BF9\u6CD5",
      body: "\u8FC7\u4E2D\u5FC3\u7684\u7EBF\uFF0C\u4E24\u7AEF\u4E24\u4E2A\u6570\u914D\u6210\u4E00\u5BF9\uFF0C\u6BCF\u5BF9\u7684\u548C\u90FD\u76F8\u7B49\u3002\u4F8B\u5982 1\u20139 \u65F6\u5C31\u662F 1+9=2+8=3+7=4+6\u3002"
    },
    {
      file: "tip_04_common.png",
      title: "\u516C\u5171\u683C",
      body: "\uFF08T \u578B\u3001L \u578B\u3001V \u578B\uFF09\u4E24\u6761\u7EBF\u6709\u4E00\u4E2A\u5171\u7528\u683C\u65F6\uFF0C\u53BB\u6389\u5171\u7528\u683C\uFF0C\u5269\u4E0B\u4E24\u4E2A\u6570\u7684\u548C\u76F8\u7B49\uFF0C\u4E5F\u5C31\u662F a+b=c+d\u3002"
    },
    {
      file: "tip_05_bow.png",
      title: "\u5F13\u7BAD\u578B",
      body: "\u89D2\u4E0A\u7684\u6570 \xD7 2 = \u5BF9\u7740\u5B83\u7684\u4E24\u4E2A\u8FB9\u4E2D\u683C\u4E4B\u548C\uFF0C\u4E5F\u5C31\u662F 2a=b+c\u3002"
    },
    {
      file: "tip_06_luobo.png",
      title: "\u841D\u535C\u6CD5\uFF08\u7F57\u4F2F\u6CD5\uFF09",
      body: "\u4ECE\u300C\u4E0A\u8FB9\u6B63\u4E2D\u300D\u843D\u4E0B\u6700\u5C0F\u7684\u6570\uFF0C\u7136\u540E\u6BCF\u6B21\u5F80\u53F3\u4E0A\u8D70\u4E00\u683C\u653E\u4E0B\u4E00\u4E2A\u6570\u3002\u8D70\u51FA\u4E0A\u8FB9\u5C31\u4ECE\u4E0B\u8FB9\u8FDB\u6765\uFF0C\u8D70\u51FA\u53F3\u8FB9\u5C31\u4ECE\u5DE6\u8FB9\u8FDB\u6765\uFF1B\u82E5\u683C\u5B50\u5DF2\u88AB\u5360\uFF0C\u5C31\u6539\u5728\u4E0A\u4E00\u4E2A\u6570\u7684\u6B63\u4E0B\u65B9\u843D\u5B50\u3002\u4E00\u6B21\u53EA\u8D70\u4E00\u6B65\u3002"
    },
    {
      file: "tip_07_yanghui.png",
      title: "\u6768\u8F89\u6CD5\uFF08\u9636\u68AF\u6CD5\uFF09",
      body: "\u8BF4\u767D\u4E86\u5C31\u662F\u628A\u4E5D\u4E2A\u8FDE\u7EED\u6570\uFF08\u7B49\u5DEE\u6570\u5217\uFF09\u5148\u659C\u7740\u6392\u597D\uFF0C\u518D\u628A\u4F38\u51FA\u683C\u5916\u7684\u4E0A\u4E0B\u5DE6\u53F3\u5BF9\u8C03\u8FDB\u7A7A\u683C\uFF0C\u5C31\u5F97\u5230\u5E7B\u65B9\u3002\u4E2D\u5FC3\u4E00\u5B9A\u662F\u6574\u7EC4\u7684\u4E2D\u9879\u3002"
    }
  ];
  function tipIllustSlot(file, title) {
    const src = `assets/ui/tips/${file}?v=${BUILD}`;
    const alt = escapeHtml(`${title}\u793A\u610F\u56FE`);
    return `<div class="tip-illust-slot">
    <img class="tip-illust" src="${src}" alt="${alt}" loading="lazy" decoding="async"
      onerror="this.classList.add('is-missing');this.parentElement&&this.parentElement.classList.add('is-missing');" />
    <div class="tip-illust-ph" aria-hidden="true">\u793A\u610F\u56FE\u5F85\u8BBE\u8BA1</div>
  </div>`;
  }
  function renderTips() {
    const cards = TIP_CARDS.map((t) => {
      const body = t.body ? `<div class="tip-body">${escapeHtml(t.body)}</div>` : "";
      const motto = t.motto ? `<div class="tip-motto">${escapeHtml(t.motto)}</div>` : "";
      return `<li class="tip-card">
      <div class="tip-title">${escapeHtml(t.title)}</div>
      ${tipIllustSlot(t.file, t.title)}
      ${body}
      ${motto}
    </li>`;
    }).join("");
    app.innerHTML = `
    <div class="topbar">
      <button class="btn btn-ghost btn-sm" id="btn-back" type="button">\u8FD4\u56DE</button>
      <div class="title">${icon("hint", "ui-icon ui-icon-sm")} \u6280\u5DE7</div>
      <div style="width:48px"></div>
    </div>
    <div class="rules-card tips-card">
      <h2>\u4E09\u9636\u5DE7\u586B\u6280\u5DE7</h2>
      <p class="tips-lead">\u63D0\u793A\u4F1A\u70B9\u540D\u8FD9\u4E9B\u62DB\u5F0F\u3001\u53EA\u63A8\u4E00\u6B65\u3002\u6BCF\u5F20\u5361\u7247\u4E0B\u65B9\u6709\u793A\u610F\u56FE\u3002</p>
      <ol class="tip-list">
        ${cards}
      </ol>
      <p class="tip-note">\u5C0F\u77E5\u8BC6\uFF1A\u53E3\u8BC0\u300C\u6234\u4E5D\u5C65\u4E00\uFF0C\u5DE6\u4E09\u53F3\u4E03\uFF0C\u4E8C\u56DB\u4E3A\u80A9\uFF0C\u516D\u516B\u4E3A\u8DB3\u300D\u53EA\u9002\u7528\u4E8E 1\u20139\u3002</p>
      <div class="rules-footer-actions">
        <button class="btn btn-ghost btn-block" id="btn-to-rules" type="button">${icon("rules")} \u73A9\u6CD5\u89C4\u5219</button>
        <button class="btn btn-primary btn-block" id="btn-play" type="button">${icon("play")} \u5F00\u59CB\u7EC3\u4E60</button>
      </div>
    </div>
  `;
    document.getElementById("btn-back").onclick = () => goHome();
    document.getElementById("btn-to-rules").onclick = () => goRules();
    document.getElementById("btn-play").onclick = () => {
      const t = resolveStartTarget();
      beginQuestion(t.q, t.resume);
    };
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  (function boot() {
    console.log(`[${APP_NAME}] v0.6.2 UI=v1.3 build=${BUILD} questions=${QUESTION_COUNT} freeBank=${FREE_BANK}`);
    document.addEventListener("keydown", (e) => {
      if (state.screen !== "play" || !state.question) return;
      if (state.selected == null || state.givenMask[state.selected]) return;
      if (document.getElementById("fake-ad-overlay")) return;
      if (!keypadOpen) {
        if (/^[0-9]$/.test(e.key) || e.key === "Backspace" || e.key === "Enter") {
          openKeypad();
        } else {
          return;
        }
      }
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        appendKeypadDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspaceKeypad();
      } else if (e.key === "Enter") {
        e.preventDefault();
        commitKeypad();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeKeypad();
      }
    });
    render();
  })();
})();
//# sourceMappingURL=app.js.map
