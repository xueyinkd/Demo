# 幻方 · UI 视觉素材 MANIFEST

## v1.3 · C 定稿（靛青+琥珀）

> Owner 选定概念 C：`concepts/v0.5/board_C_indigo_amber.png`  
> 主色 `#3558E0`；**琥珀仅**用于提示按钮 / 选中高亮 / 功能点缀  
> 非卡通 / 无吉祥物 / 无会员皮肤商城 · 勿改单据快记素材

生成脚本：`_gen_ui.py`（Pillow）  
色板源：`palette.json`（v1.3）  
预览：`preview_sheet.png`  
概念对齐说明：`concepts/v0.5/FINAL_C.md`

### 与概念 C 对齐

| 项 | 定稿表现 |
|----|----------|
| 主色 | 靛青 `#3558E0` |
| 琥珀 | 提示按钮、「还剩 N」、格式 chip、输入底线、键盘按压高亮 |
| 对局顶栏 | 题号 + `3×3 · 8线`（无线上「幻和 N」） |
| 输入 | 格内光标 + 数字键盘（**无**备用数点选条） |
| 活和 | 行 / 列 / 对角 ✓·! 徽章 |
| 底栏动作 | 提示（日限 3，显示剩余）+ 下一题 |
| 首页/规则 | 信息架构参考 `home_refined` / `rules_refined`，材质跟 C |

### 色板 / 字号 / 圆角 / 阴影简表

| 类别 | Token | 值 |
|------|-------|-----|
| 主色 | primary | `#3558E0` |
| 琥珀 | amber | `#F59E0B` |
| 正确 | success | `#059669` |
| 冲突 | conflict | `#EA580C` |
| 底 | bg / bg_top | `#F2F4F9` / `#E4EAF9` |
| 圆角 | card / cell / button / modal | 30 / 22 / 22 / 32 |
| 阴影 | card | dy 6 · blur 16 · α≈48 |
| 字号 | 题号 / 棋盘数字 / 按钮 / 键 | 34 / 58 / 32 / 30 |

### 玩法约束（硬 · 已自检）

- [x] 无备用数点选条  
- [x] 无数字范围提示条  
- [x] 无线上「幻和 N」剧透文案  
- [x] 格内自输数字（光标 + 键盘）  
- [x] 顶栏仅「3×3 · 8线」类信息 + 题号  
- [x] 提示日限 3（按钮显示剩余）  
- [x] 行/列/对角活和 ✓/!  

### 文案过关（广告措辞）

- 禁止：「零广告」「没有广告」  
- 允许：「没有插屏打扰」「无插屏 / 无会员」「不用开通会员」「广告示意」

### 相对 v1.2

| 维度 | v1.2 | v1.3 C |
|------|------|--------|
| 方向 | 课本感通用 | **靛青+琥珀定稿** |
| 输入 | 备用数点选条（亮/灰） | **格内自输 + 数字键盘** |
| 顶栏 | 关卡名+用时等 | **题号 + 3×3·8线** |
| 动作 | 撤销/提示/回退 | **提示（剩余）+ 下一题** |
| 琥珀 | 点缀偏散 | **仅功能色** |

---



## 规则 / 技巧分家（新增）

| 文件 | 用途 |
|------|------|
| `screens/rules_simple.png` | **精简规则**：目标=15、点格输入、8 线示意、输入方式、提示日限 3、无插屏/无会员；「去看技巧 →」入口（琥珀） |
| `screens/rules.png` | 仍保留完整规则定稿（可作对照）；新产品流优先 `rules_simple` |
| `screens/tips_hub.png` | 技巧枢纽：7 条标题卡片入口 |
| `screens/tips/tip_01_center.png` | 中心数 |
| `screens/tips/tip_02_linesum.png` | 线和公式 |
| `screens/tips/tip_03_pairs.png` | 配对法 |
| `screens/tips/tip_04_common.png` | 公共格（T/L/V） |
| `screens/tips/tip_05_bow.png` | 弓箭型（**勿写**黄金三角） |
| `screens/tips/tip_06_luobo.png` | 萝卜法 + 口诀卡 |
| `screens/tips/tip_07_yanghui.png` | 杨辉法 +「九子斜排…」口诀卡 |
| `preview_tips.png` | 精简规则 + 技巧拼图预览 |

生成脚本：`_gen_tips.py`  
小知识条：戴九履一只适用 1～9（hub / rules_simple 底）

### 7 条标题定稿

1. **中心数** — 中间那个数很特别  
2. **线和公式** — 三行加起来，再÷3  
3. **配对法** — 过中心，两端凑一对  
4. **公共格** — 两条线共用一格  
5. **弓箭型** — 角上的数，管两边  
6. **萝卜法** — 斜着走，出界就折回  
7. **杨辉法** — 斜排摆好，再对调  


## 文件树

```
huanfang-art/
├── MANIFEST.md
├── palette.json                 # v1.3 C
├── _gen_ui.py
├── preview_sheet.png
├── screens/                     # 750×1334 正式定稿
│   ├── home.png
│   ├── level_list.png
│   ├── board_play.png
│   ├── board_states.png
│   ├── clear.png
│   ├── rules.png
│   ├── hint_reward_modal.png
│   ├── rules_simple.png
│   ├── tips_hub.png
│   └── tips/
│       ├── tip_01_center.png … tip_07_yanghui.png
├── icons/                       # 96×96，hint 琥珀描边
├── share/share_card.png         # 500×400
└── concepts/v0.5/               # 概念存档（含 FINAL_C.md）
```

## 优先屏文案（定稿）

### home
- 幻方 / 九宫格 · 自己加一加  
- pill：3×3 · 8 条线都要刚好  
- 开始玩 / 接着上次继续 / 残局闯关 / 怎么玩  
- 底：没有插屏打扰 · 没有会员 · 关卡随便进  

### board_play
- 第 12 题 + 3×3 · 8线  
- 对了亮 ✓ · 错了亮 !  
- 点格子，再敲数字  
- 提示（还剩 2）/ 下一题 →  

### clear
- 太棒了，通关！ / 八条线都凑成 15 啦  
- 再来一局 / 分享给同学  
- 没有会员 · 想玩就玩  

### hint_reward_modal
- 今天的免费提示用完啦（3/3）  
- 看完小视频，再送你 1 次提示  
- 看视频换提示 / 稍后再说  
- 每天免费 3 次 · 不用开通会员  

### rules
- 目标 / 一共查 8 条线 / 怎么填（含键盘与日限 3）  
- 底：无插屏 / 无会员 · 提示可看小视频换  

## 接入节奏

`/workspace/huanfang/assets/ui/` 可同步作对照。

> **等策划通知程序再正式换皮**——本目录为 v1.3 视觉定稿源，勿默认当程序已切皮。

```bash
cd /workspace/huanfang-art && python3 _gen_ui.py
```

## 妥协项

1. Pillow 图标无原生 round-cap → 上线建议 SVG  
2. 彩带为几何短条/圆点  
3. 状态栏示意；真机跟微信 safe-area  
4. 分享码灰占位  
5. 单据目录未改动  

## 尺寸

screens ×7 → 750×1334 · icons ×7 → 96×96 · share → 500×400  
