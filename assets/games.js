/* ============================================================
   工具目录数据 (Catalog)
   ------------------------------------------------------------
   架构约定（重要）：
   - 一个站点、两个入口版（简体版 / 繁体版），**工具只维护一份**。
     版本只影响「界面与文案用简体还是繁体」＋「默认筛哪些字形」，不复制工具。
   - 以后加新工具：只在这里加一条，两个版本都会出现。

   字段说明：
   - id        : 唯一标识（英文）
   - file      : generators/ 下的单文件（生成器用）
   - path      : 完整路径（多文件应用，如白板；优先于 file）
   - zh/hant   : 简体版 / 繁体版各用的文案（title / desc / tags）
   - en        : 英文名（两个版本共用）
   - purpose   : generator(游戏生成器) / tool(课堂工具) / game(成品游戏)
   - script    : simplified(简体) / traditional(繁体) / both(老师输入决定，通用)
   - langs     : ['mandarin'] / ['cantonese'] / ['mandarin','cantonese']
   - roman     : 注音系统 ['pinyin'] / ['yale'] / ['jyutping']，不涉及注音就留 []
   - emoji / accent / layout : 卡片外观
   ============================================================ */

/* ---------- 界面文案：简体版 / 繁体版 ---------- */
const UI = {
  simplified: {
    siteName: "中文教学工具库",
    tagline: "对外汉语课堂互动游戏、生成器与教学工具",
    heroTitle: "挑一个工具，输几个词，就能上课",
    heroText: "面向对外汉语老师的教学工具库，按「课堂前 · 课堂中 · 课堂后」编排。输入生词或句子立即生成可下载的网页游戏；白板等工具打开即用。",
    statTools: "款工具",
    statGen: "个游戏生成器",
    statLang: "普通话 + 粤语",
    search: "搜索工具名、类型或标签，如「造句」「粤语」「笔画」…",
    labelPurpose: "用途", labelScript: "字形", labelLang: "语种", labelRoman: "注音",
    filterToggle: "筛选",
    edSimple: "简体版", edTraditional: "繁体版",
    edHint: "简体版：普通话 / 简体教学　·　繁体版：粤语、台湾及海外华裔教学",
    typeGen: "可生成", typeTool: "课堂工具", typeGame: "成品",
    langMandarin: "普通话", langCantonese: "粤语", langBoth: "通用",
    subGen: "可自定义生成", subTool: "课堂工具 · 打开即用", subGame: "成品直接用",
    newTab: "新标签打开 ↗", download: "下载工具文件", close: "关闭 ✕",
    copyLink: "复制本页链接", copied: "链接已复制 ✓",
    empty: "没有匹配的工具，换个条件试试～",
    filterResult: "筛选结果 · 共 %d 款",
    footer: "由对外汉语老师为老师打造 · 所有工具均在浏览器本地运行，内容不上传"
  },
  traditional: {
    siteName: "中文教學工具庫",
    tagline: "對外漢語課堂互動遊戲、產生器與教學工具",
    heroTitle: "挑一個工具，輸幾個詞，就能上課",
    heroText: "面向對外漢語老師的教學工具庫，按「課堂前 · 課堂中 · 課堂後」編排。輸入生詞或句子立即產生可下載的網頁遊戲；白板等工具開啟即用。",
    statTools: "款工具",
    statGen: "個遊戲產生器",
    statLang: "普通話 + 粵語",
    search: "搜尋工具名稱、類型或標籤，如「造句」「粵語」「筆畫」…",
    labelPurpose: "用途", labelScript: "字形", labelLang: "語種", labelRoman: "注音",
    filterToggle: "篩選",
    edSimple: "簡體版", edTraditional: "繁體版",
    edHint: "簡體版：普通話／簡體教學　·　繁體版：粵語、台灣及海外華裔教學",
    typeGen: "可產生", typeTool: "課堂工具", typeGame: "成品",
    langMandarin: "普通話", langCantonese: "粵語", langBoth: "通用",
    subGen: "可自訂產生", subTool: "課堂工具 · 開啟即用", subGame: "成品直接用",
    newTab: "新標籤開啟 ↗", download: "下載工具檔案", close: "關閉 ✕",
    copyLink: "複製本頁連結", copied: "連結已複製 ✓",
    empty: "沒有符合的工具，換個條件試試～",
    filterResult: "篩選結果 · 共 %d 款",
    footer: "由對外漢語老師為老師打造 · 所有工具均在瀏覽器本地執行，內容不上傳"
  }
};

/* ---------- 筛选维度（双语） ---------- */
const PURPOSES = [
  { v: "all",        zh: "全部",       hant: "全部" },
  { v: "generator",  zh: "游戏生成器", hant: "遊戲產生器" },
  { v: "tool",       zh: "课堂工具",   hant: "課堂工具" },
  { v: "game",       zh: "成品游戏",   hant: "成品遊戲" }
];
const SCRIPT_OPTS = [
  { v: "all",          zh: "不限", hant: "不限" },
  { v: "simplified",   zh: "简体", hant: "簡體" },
  { v: "traditional",  zh: "繁体", hant: "繁體" }
];
const LANG_OPTS = [
  { v: "all",        zh: "不限",   hant: "不限" },
  { v: "mandarin",   zh: "普通话", hant: "普通話" },
  { v: "cantonese",  zh: "粤语",   hant: "粵語" }
];
const ROMAN_OPTS = [
  { v: "all",       zh: "不限",  hant: "不限" },
  { v: "pinyin",    zh: "拼音",  hant: "拼音" },
  { v: "yale",      zh: "耶鲁",  hant: "耶魯" },
  { v: "jyutping",  zh: "粤拼",  hant: "粵拼" }
];

/* ---------- 工具清单（两个版本共用这一份） ---------- */
const GAMES = [
  {
    id: "whiteboard",
    path: "tools/whiteboard/index.html",
    en: "Teaching Whiteboard",
    purpose: "tool",
    script: "both",
    langs: ["mandarin", "cantonese"],
    roman: ["pinyin", "yale", "jyutping"],
    emoji: "🖍️", accent: "#00DF89", layout: "wide",
    zh: {
      title: "Dora 教学白板",
      desc: "上课直接用的书写白板：写中文自动标注拼音 / 粤拼，普通话与粤语双语，无需登录，内容存本机。",
      tags: ["课堂", "板书", "注音"]
    },
    hant: {
      title: "Dora 教學白板",
      desc: "上課直接用的書寫白板：寫中文自動標注拼音／粵拼，普通話與粵語雙語，無需登入，內容存本機。",
      tags: ["課堂", "板書", "注音"]
    }
  },
  {
    id: "hanzi-challenge",
    file: "hanzi-challenge.html",
    en: "Character Challenge Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🏆", accent: "#4D6EF7", layout: "phone",
    zh: {
      title: "汉字闯关游戏生成器",
      desc: "输入生词，生成学生版「中文大闯关」答题游戏，可下载独立网页。",
      tags: ["词汇", "闯关", "汉字"]
    },
    hant: {
      title: "漢字闖關遊戲產生器",
      desc: "輸入生詞，產生學生版「中文大闖關」答題遊戲，可下載獨立網頁。",
      tags: ["詞彙", "闖關", "漢字"]
    }
  },
  {
    id: "snake",
    file: "snake.html",
    en: "Snake Game Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🐍", accent: "#3AF072", layout: "phone",
    zh: {
      title: "灵动贪吃蛇生成器",
      desc: "把生词变成贪吃蛇食物，学生边玩边记词，可下载学生版网页。",
      tags: ["词汇", "游戏"]
    },
    hant: {
      title: "靈動貪吃蛇產生器",
      desc: "把生詞變成貪吃蛇食物，學生邊玩邊記詞，可下載學生版網頁。",
      tags: ["詞彙", "遊戲"]
    }
  },
  {
    id: "bingo",
    file: "bingo.html",
    en: "Bingo Card Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🎲", accent: "#FF5C00", layout: "phone",
    zh: {
      title: "宾果 Bingo 生成器",
      desc: "输入生词，生成可打印 / 可点选的宾果卡，学生每人随机不同，连成线即 BINGO。",
      tags: ["词汇", "听说", "课堂"]
    },
    hant: {
      title: "賓果 Bingo 產生器",
      desc: "輸入生詞，產生可列印／可點選的賓果卡，學生每人隨機不同，連成線即 BINGO。",
      tags: ["詞彙", "聽說", "課堂"]
    }
  },
  {
    id: "spinner",
    file: "spinner.html",
    en: "Spinner Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🎡", accent: "#FF9E00", layout: "phone",
    zh: {
      title: "转盘抽奖生成器",
      desc: "输入词语 / 音节 / 任务，生成可转动的抽奖转盘，可自动发音并打卡记录。也可投屏全班互动。",
      tags: ["词汇", "热身"]
    },
    hant: {
      title: "轉盤抽獎產生器",
      desc: "輸入詞語／音節／任務，產生可轉動的抽獎轉盤，可自動發音並打卡記錄。也可投屏全班互動。",
      tags: ["詞彙", "熱身"]
    }
  },
  {
    id: "listen-choose",
    file: "listen-choose.html",
    en: "Listen and Choose Generator",
    purpose: "generator", script: "both", langs: ["mandarin"], roman: ["pinyin"],
    emoji: "🎧", accent: "#7C97FF", layout: "phone",
    zh: {
      title: "听音选字生成器",
      desc: "输入词语，生成「听发音选词」练习，网页朗读中文、学生四选一并即时判分。",
      tags: ["听力", "词汇"]
    },
    hant: {
      title: "聽音選字產生器",
      desc: "輸入詞語，產生「聽發音選詞」練習，網頁朗讀中文、學生四選一並即時判分。",
      tags: ["聽力", "詞彙"]
    }
  },
  {
    id: "word-search",
    file: "word-search.html",
    en: "Word Search Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🔍", accent: "#7F56D9", layout: "phone",
    zh: {
      title: "中文找字游戏生成器",
      desc: "输入词语，自动生成找字 / 字谜网格，可下载网页或打印版。",
      tags: ["汉字", "词汇"]
    },
    hant: {
      title: "中文找字遊戲產生器",
      desc: "輸入詞語，自動產生找字／字謎網格，可下載網頁或列印版。",
      tags: ["漢字", "詞彙"]
    }
  },
  {
    id: "vocab-reading",
    file: "vocab-reading.html",
    en: "Vocab Reading Practice",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: ["pinyin"],
    emoji: "📖", accent: "#FF7E9F", layout: "phone",
    zh: {
      title: "生词阅读练习生成器",
      desc: "输入短文与生词，生成带词卡和练习的阅读网页。偏成人 / 青少年。",
      tags: ["阅读", "词汇"]
    },
    hant: {
      title: "生詞閱讀練習產生器",
      desc: "輸入短文與生詞，產生帶詞卡和練習的閱讀網頁。偏成人／青少年。",
      tags: ["閱讀", "詞彙"]
    }
  },
  {
    id: "reading-train",
    file: "reading-train.html",
    en: "Reading Cognition Trainer",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🧠", accent: "#00C47F", layout: "phone",
    zh: {
      title: "阅读认知训练生成器",
      desc: "生成阅读理解与认知训练互动练习，可下载学生版。",
      tags: ["阅读"]
    },
    hant: {
      title: "閱讀認知訓練產生器",
      desc: "產生閱讀理解與認知訓練互動練習，可下載學生版。",
      tags: ["閱讀"]
    }
  },
  {
    id: "sentence-scramble",
    file: "sentence-scramble.html",
    en: "Sentence Scramble Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🐟", accent: "#4D6EF7", layout: "phone",
    zh: {
      title: "语块重组造句生成器",
      desc: "输入句子，生成「小鱼吃词」语块重组游戏，可下载。",
      tags: ["句子", "造句"]
    },
    hant: {
      title: "語塊重組造句產生器",
      desc: "輸入句子，產生「小魚吃詞」語塊重組遊戲，可下載。",
      tags: ["句子", "造句"]
    }
  },
  {
    id: "train",
    file: "train.html",
    en: "Sentence Train Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "🚂", accent: "#FF7A00", layout: "phone",
    zh: {
      title: "造句小火车生成器",
      desc: "输入句子，生成「小火车」连词成句游戏，可下载学生版。",
      tags: ["句子", "造句"]
    },
    hant: {
      title: "造句小火車產生器",
      desc: "輸入句子，產生「小火車」連詞成句遊戲，可下載學生版。",
      tags: ["句子", "造句"]
    }
  },
  {
    id: "stroke-practice",
    file: "stroke-practice.html",
    en: "Stroke Order Practice",
    purpose: "generator", script: "both", langs: ["mandarin"], roman: ["pinyin"],
    emoji: "✍️", accent: "#FF4B72", layout: "phone",
    zh: {
      title: "汉字笔画练习生成器",
      desc: "输入汉字，生成笔画顺序练习游戏，可下载学生版。偏成人 / 青少年。",
      tags: ["笔画", "汉字"]
    },
    hant: {
      title: "漢字筆畫練習產生器",
      desc: "輸入漢字，產生筆畫順序練習遊戲，可下載學生版。偏成人／青少年。",
      tags: ["筆畫", "漢字"]
    }
  },
  {
    id: "cantonese-game",
    file: "cantonese-game.html",
    en: "Cantonese Game Generator",
    purpose: "generator", script: "traditional", langs: ["cantonese"], roman: ["yale", "jyutping"],
    emoji: "🗣️", accent: "#E8395F", layout: "phone",
    zh: {
      title: "粤语通关游戏生成器",
      desc: "输入繁体字词，生成粤语通关练习游戏（耶鲁 / 粤拼），可下载。",
      tags: ["粤语", "词汇"]
    },
    hant: {
      title: "粵語通關遊戲產生器",
      desc: "輸入繁體字詞，產生粵語通關練習遊戲（耶魯／粵拼），可下載。",
      tags: ["粵語", "詞彙"]
    }
  },
  {
    id: "story-cards",
    file: "story-cards.html",
    en: "Picture Story Cards Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: ["pinyin"],
    emoji: "🖼️", accent: "#FF7E9F", layout: "wide",
    zh: {
      title: "看图说话卡片生成器",
      desc: "掷骰子随机抽图卡（3/5/9 张），学生用抽到的词说一段话。内置 120+ 张图卡开箱即玩，也能换成你自己的生词表，没图的词自动显示词语 + 拼音。",
      tags: ["看图说话", "口语", "图片", "词汇"]
    },
    hant: {
      title: "看圖說話卡片產生器",
      desc: "擲骰子隨機抽圖卡（3／5／9 張），學生用抽到的詞說一段話。內建 120+ 張圖卡開箱即玩，也能換成你自己的生詞表，沒圖的詞自動顯示詞語＋拼音。",
      tags: ["看圖說話", "口語", "圖片", "詞彙"]
    }
  },
  {
    id: "exercise",
    file: "exercise.html",
    en: "Homework Exercise Generator",
    purpose: "generator", script: "both", langs: ["mandarin", "cantonese"], roman: [],
    emoji: "📝", accent: "#00DF89", layout: "wide",
    zh: {
      title: "课后练习生成器",
      desc: "输入选择题、填空题，生成可在线作答、自动判分的练习网页；还能打印「题目卷 + 答案卷」。",
      tags: ["练习", "作业", "测验"]
    },
    hant: {
      title: "課後練習產生器",
      desc: "輸入選擇題、填空題，產生可線上作答、自動判分的練習網頁；還能列印「題目卷＋答案卷」。",
      tags: ["練習", "作業", "測驗"]
    }
  },
  {
    id: "level-test",
    file: "level-test.html",
    en: "Chinese Level Placement Test",
    purpose: "tool", script: "both", langs: ["mandarin"], roman: ["pinyin"],
    emoji: "📊", accent: "#4D6EF7", layout: "wide",
    zh: {
      title: "汉语水平自测",
      desc: "上课前给学生做的自适应分级摸底：从 HSK 1 起，答对升级、答错或选「不知道」降级，停留最多的等级即水平；HSK 1–2 带拼音，含「不知道」选项，便于备课与分班。",
      tags: ["水平测试", "分班", "摸底", "HSK"]
    },
    hant: {
      title: "漢語水平自測",
      desc: "上課前給學生做的自適應分級摸底：從 HSK 1 起，答對升級、答錯或選「不知道」降級，停留最多的等級即水平；HSK 1–2 帶拼音，含「不知道」選項，便於備課與分班。",
      tags: ["水平測試", "分班", "摸底", "HSK"]
    }
  }
];

/* ---------- 教学阶段（首页三段色块） ----------
   before 课堂前·备课 / during 课堂中·上课互动 / after 课堂后·练习巩固
   值是数组：以后一个工具可同时属于多个阶段。
   首页默认按阶段分块展示；一旦使用搜索或筛选，就切换为平铺结果。 */
const PHASES = {
  "hanzi-challenge":  ["before"],
  "snake":            ["before"],
  "word-search":      ["before"],
  "sentence-scramble":["before"],
  "train":            ["before"],
  "cantonese-game":   ["before"],
  "bingo":            ["before"],
  "whiteboard":       ["during"],
  "spinner":          ["during"],
  "story-cards":      ["during"],
  "listen-choose":    ["during"],
  "exercise":         ["after"],
  "vocab-reading":    ["after"],
  "reading-train":    ["after"],
  "stroke-practice":  ["after"],
  "level-test":       ["before"]
};
const PHASE_DEFS = [
  { v: "before", icon: "🎒", accent: "#FF4B72",
    zh:   { name: "课堂前 · 备课", desc: "生成上课要用的游戏和材料" },
    hant: { name: "課堂前 · 備課", desc: "產生上課要用的遊戲和材料" } },
  { v: "during", icon: "🎓", accent: "#00DF89",
    zh:   { name: "课堂中 · 上课互动", desc: "打开就能投屏使用的工具和游戏" },
    hant: { name: "課堂中 · 上課互動", desc: "開啟就能投屏使用的工具和遊戲" } },
  { v: "after", icon: "📚", accent: "#4D6EF7",
    zh:   { name: "课堂后 · 练习巩固", desc: "生成练习发给学生自学" },
    hant: { name: "課堂後 · 練習鞏固", desc: "產生練習發給學生自學" } }
];
