---
version: alpha
name: DingTalk Design System
description: 钉钉设计系统（dingtalk_common 主题），以中性灰阶与钉钉蓝 (#007FFF) 为基底，通过 4pt 基础间距、半径阶梯与 3 层阴影构建桌面端 / 移动端一致的视觉语言，同时支持浅色与深色模式自适应。

colors:
  # 品牌与强调色
  primary: "#007FFF"
  on-primary: "#FFFFFF"
  secondary: "#5AC8FA"
  accent: "#00B042"

  # 表面与背景色（浅色模式）
  canvas: "#FFFFFF"
  canvas-soft: "#F2F2F6"
  surface: "#FFFFFF"
  hairline: "rgba(126,134,142,0.16)"
  hairline-strong: "rgba(126,134,142,0.24)"

  # 文本色
  ink: "#171A1D"
  body: "rgba(23,26,29,0.6)"
  mute: "rgba(23,26,29,0.24)"
  stamp: "rgba(23,26,29,0.04)"
  link: "#317EDD"

  # 语义色
  success: "#00B042"
  error: "#FF5219"
  warning: "#FF9200"

  # 深色模式（背景 / 文本对照）
  canvas-dark: "#111213"
  canvas-soft-dark: "#1C1D1F"
  ink-dark: "rgba(255,255,255,0.8)"

  # 特殊装饰色
  gradient-start: "#E98CDE"
  gradient-end: "#63D8FF"

typography:
  display-xl:
    fontFamily: "PingFang SC, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "64px"
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: "-1.6px"
    use: "桌面端 HyperTitle：品牌宣发、官网 Banner 等需要超大显示场景"
  display-lg:
    fontFamily: "PingFang SC, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "44px"
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: "-1.2px"
    use: "桌面端 SuperTitle：品牌宣发、官网 Banner 大标题"
  title-xl:
    fontFamily: "PingFang SC, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "32px"
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: "-0.8px"
    use: "桌面端 LargeTitle：品牌宣发、文档大标题"
  title-lg:
    fontFamily: "PingFang SC, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: "600"
    lineHeight: "1.4"
    letterSpacing: "0px"
    use: "桌面端 H1：系统级 1 级标题（markdown / 文档阅读场景）"
  title-md:
    fontFamily: "PingFang SC, SF Pro Display, Segoe UI, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0px"
    use: "桌面端 H2：系统级 2 级标题"
  body-md:
    fontFamily: "PingFang SC, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0px"
    use: "桌面端默认正文 / Body 字体"
  body-lg:
    fontFamily: "PingFang SC, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: "400"
    lineHeight: "1.6"
    letterSpacing: "0px"
    use: "移动端默认正文 / Paragraph：适合大面积段落展示"
  caption:
    fontFamily: "PingFang SC, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0px"
    use: "桌面端 Footnote / Description：脚注、时间戳、第二行附属信息"
  tiny:
    fontFamily: "PingFang SC, SF Pro Text, Segoe UI, Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: "400"
    lineHeight: "1.6"
    letterSpacing: "0px"
    use: "水印、不重要的小标注"
  code:
    fontFamily: "SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0px"

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
  auto: "height*0.16"

spacing:
  base: 4px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 64px
  section: 120px

shadows:
  s: "0px 1px 4px rgba(0, 0, 0, 0.16)"
  m: "0px 8px 24px rgba(0, 0, 0, 0.16)"
  l: "0px 12px 32px rgba(0, 0, 0, 0.24)"

blur:
  default-light: "rgba(255,255,255,0.94) blur(10px)"
  thin-light: "rgba(241,242,243,0.90) blur(10px)"
  default-dark: "rgba(30,30,30,0.94) blur(10px)"
  thin-dark: "rgba(39,39,39,0.90) blur(10px)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    fontWeight: "500"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    minHeight: "32px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    typography: "{typography.body-md}"
    fontWeight: "500"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    minHeight: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    fontWeight: "500"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    minHeight: "32px"
  card-base:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    shadow: "{shadows.s}"
  card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    shadow: "{shadows.m}"
  form-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.mute}"
    borderColor: "{colors.hairline}"
    focusBorderColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "8px 12px"
    height: "36px"
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    height: "48px"
    padding: "0 {spacing.md}"
    shadow: "{shadows.s}"

  # ─── 衍生示例 (Illustrative Examples) ───
  ex-data-table:
    description: "数据表格样式：表头采用软底色 + 极细分割线，正文保持紧凑。"
    headerBackground: "{colors.canvas-soft}"
    headerTypography: "{typography.caption}"
    headerFontWeight: "500"
    bodyTypography: "{typography.body-md}"
    rowBorder: "{colors.hairline}"
    cellPadding: "12px 16px"
  ex-im-bubble-self:
    description: "IM 聊天气泡 - 本人消息：浅蓝底，深色文字。"
    backgroundColor: "#C9E7FF"
    pressBackgroundColor: "#BFDDF5"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    maxWidth: "70%"
  ex-im-bubble-other:
    description: "IM 聊天气泡 - 对方消息：白底，深色文字。"
    backgroundColor: "{colors.surface}"
    pressBackgroundColor: "#F6F6F6"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    maxWidth: "70%"
---


## Overview

钉钉设计系统（dingtalk_common 主题）面向钉钉的全平台产品矩阵——覆盖桌面端（Windows / macOS）、移动端（iOS / Android）以及 Web 端。视觉语言追求**克制的理性与平台包容的中性**：以中性灰阶为底色、以钉钉蓝 `#007FFF` 作为唯一的品牌主色焦点；通过统一的 4pt 基础间距、半径阶梯（4 / 6 / 8）与三级阴影系统（s / m / l）建立跨端一致性；同时支持浅色 / 深色模式自适应，保证在企业沟通、协作、办公等高强度使用场景下的可读性与可操作性。

**Key Characteristics:**

- **单一品牌主色策略**：标准版钉钉下 `primary` = `blue1` = `#007FFF`，但在客户定制主题下 `primary` 可被替换，`blue` 仍保持 `#007FFF` 固定——这种 "blue vs primary" 的双轨设计为主题化预留了空间。
- **透明度层级而非色阶梯级**：文字色使用同一基色 `#171A1D` 的 100% / 60% / 40% / 24% 透明度划分 4 个语义层级，保证中英文混排与暗色模式下的视觉一致性。
- **z 轴分层背景系统**：背景色使用 `bg / fg / z1 / z2 / press` 的语义分层而非单纯色阶，遵循 "z1 高度 +1，press 高度 -1" 的物理逻辑。
- **平台原生字体优先**：优先调用各平台系统字体（macOS SF Pro / iOS PingFang SC / Android Roboto / Windows Segoe UI），不强制下载 web font，保证零性能损耗。
- **克制的阴影哲学**：阴影颜色统一为 `#000000 16% / 24%` 两种透明度，通过 `y` 偏移与 `blur` 区分层级，避免使用单层重度模糊的 Material 风格阴影。
- **动静结合的圆角**：固定 4 / 6 / 8 阶梯覆盖绝大多数场景，头像等多尺寸基础元件使用 `height * 0.16` 的动态圆角保持视觉感知一致。

## Colors

### Brand & Accent (品牌与强调色)

- **钉钉蓝 `{colors.primary}`** — `#007FFF` (浅色模式) / `rgba(48,128,219,1)` (深色模式)：所有主要 CTA 按钮、链接、强调文本、激活态的视觉焦点。
- **亮蓝 `{colors.secondary}`** — `#5AC8FA`：用于数据可视化的次要类别、辅助强调、引导性装饰元素。
- **success 绿** — `#00B042`：成功、完成态、积极反馈。
- **warning 橙** — `#FF9200`：警示、警告、二级通知。
- **error 红** — `#FF5219`：错误、危险、破坏性操作、一级通知。

> **blue vs primary**：考虑到未来大客户版主题化能力，颜色 key 分两套：
> - `common_blue1_color` = 固定 `#007FFF`，是**功能色**（hover / active / press 状态切换）。
> - `theme_primary1_color` = 可配置主题色，标准版下与 blue 一致。
>
> **在大部分场景下，建议使用 `primary` 系颜色以保证统一的品牌主色**。

### Surface (表面与背景)

- **Canvas 基础背景 `{colors.canvas}`** — `#FFFFFF` (浅色) / `#111213` (深色)：页面全局底色。
- **FG 前景层 `{colors.surface}`** — Cell 颜色，用在会话列表、表单等 "卡片" 元素，视觉上 z 轴高度 +1。
- **FG z1 / z2** — `#FFFFFF` / `#FFFFFF` (浅色)：Cell 进一步抬升的颜色层级。
- **FG press `#F6F6F6`** — Cell 按下态，z 轴高度 -1。
- **BG z1 `{colors.canvas-soft}`** — `#F2F2F6` (浅色) / `#18191B` (深色)：较浅的背景色，与 FG 形成层级。

> **层级示例（桌面端 3 列布局）**
>
> |  |  |  |
> |---|---|---|
> | `bg_color` | `bg_color` | `bg_color` |
> | `fg_color` | `fg_z1_color` | `fg_color` |
> | `bg_color` | `bg_color` | `bg_color` |
>
> **移动端通用背景色示例**（fg_z1 单色满铺）：
>
> | `fg_z1_color` | `fg_z1_color` | `fg_z1_color` | `fg_z1_color` |
> |---|---|---|---|
> | `bg_color` | `bg_color` | `bg_color` | `bg_color` |

### Text (文本色)

所有文字色基于同一基色 `#171A1D`（深色模式反转为 `#FFFFFF`），通过透明度区分层级——这一规则同样适用于图标描述色：

| Token | 浅色模式 | 深色模式 | 用途 |
|---|---|---|---|
| `level 1` `{colors.ink}` | `#171A1D 100%` | `rgba(255,255,255,0.8)` | 主要文字色：标题、正文等（WCAG 17.4:1 AAA） |
| `level 2` `{colors.body}` | `#171A1D 60%` | `rgba(255,255,255,0.5)` | 次要文字色：辅助文案、描述（WCAG 6.6:1 AA） |
| `level 3` | `#171A1D 40%` | `rgba(255,255,255,0.4)` | 描述文字色：描述、脚注（WCAG 3.3:1 AA） |
| `level 4` `{colors.mute}` | `#171A1D 24%` | `rgba(255,255,255,0.2)` | 禁用与占位文字色 |
| `stamp` `{colors.stamp}` | `#171A1D 4%` | `rgba(255,255,255,0.03)` | 水印文字色 |
| `link` `{colors.link}` | `#317EDD` | `rgba(62,136,214,1)` | 链接文字色 |
| `link_press` | `#317EDD 40%` | `rgba(62,136,214,0.4)` | 链接点击色 |

> **WCAG 合规**：level 1 / level 2 / level 3 在标准背景色下均达到 AA 及以上对比度（≥ 4.5:1），level 4 仅用于禁用与占位等非关键状态。

### Hairline & Overlay (分割线与叠加色)

分割线使用 **Alpha 透明度灰色**，可同时在暗色与亮色主题下复用：

| Token | 色值 | 用途 |
|---|---|---|
| `line_light` `{colors.hairline}` | `rgba(126,134,142,0.16)` | 较浅的分割线色：卡片边缘、列表项轻分割 |
| `line_hard` `{colors.hairline-strong}` | `rgba(126,134,142,0.24)` | 较深的分割线色：模态边界、强调分割 |
| `line_element` | `rgba(126,134,142,0.4)` | 元素级别的描边色 |
| `line_popstroke` | `rgba(126,134,142,0)` (浅) / `0.24` (深) | 浮层描边色 |

叠加色用于可操作元素的交互态：

| Token | 色值 | 用途 |
|---|---|---|
| `overlay` | `rgba(0,0,0,0.4)` (浅) / `rgba(0,0,0,0.4)` (深) | 通用蒙层 / 遮罩色 |
| `overlay_hover` | `rgba(126,134,142,0.16)` (浅) / `rgba(255,255,255,0.08)` (深) | 通用 hover 遮罩层 |
| `overlay_press` | `rgba(126,134,142,0.24)` (浅) / `rgba(255,255,255,0.16)` (深) | 通用 press 遮罩层 |
| `overlay_area` | `rgba(126,134,142,0.08)` | 区域级遮罩（如 hover 背景） |

### Semantic (语义色)

| 语义 | Token | 浅色 | 深色 | 用途 |
|---|---|---|---|---|
| Success | `green1` `{colors.success}` | `#00B042` | `rgba(0,174,75,1)` | 成功 / 完成态 |
| Success light | `green2 / green3` | `#00B042 48% / 12%` | `#00AE4B 48% / 16%` | 成功背景 / 边线 |
| Warning | `orange1` `{colors.warning}` | `#FF9200` | `rgba(255,155,0,1)` | 警示 / 二级通知 |
| Warning light | `orange2 / orange3` | `#FF9200 48% / 12%` | `#FF9B00 48% / 16%` | 警示背景 / 边线 |
| Error | `red1` `{colors.error}` | `#FF5219` | `rgba(255,94,43,1)` | 危险 / 失败 / 一级通知 |
| Error light | `red2 / red3` | `#FF5219 48% / 12%` | `#FF5E2B 48% / 16%` | 错误背景 / 边线 |
| Danger hover | `danger_hover` | `#EB4B17` | `#FF6A3B` | 危险操作 hover |
| Danger press | `danger_press` | `#D64414` | `#FF774D` | 危险操作 press |
| Primary hover | `primary_hover` | `#0075EB` | `#408ADE` | 主色 hover |
| Primary press | `primary_press` | `#006AD6` | `#5194E1` | 主色 press |

### Special Decorations (特殊装饰色)

主要用于 AI 场景与商业化场景的渐变：

- **AI 渐变（normal）**：`linear-gradient(116deg, #E98CDE 13%, #B484F4 34%, #3991FF 68%, #63D8FF 104%)`——AI 卡片 / AI 入口主背景。
- **AI 渐变（hover / press / disable）**：同方向的更深 / 更浅变体，仅用于大尺度 AI 入口，禁止缩小至 16px 以下的图标使用。
- **AI 加载渐变**：`conic-gradient(...)` 旋转光圈，仅用于 AI 处理中的加载状态。
- **商业化主渐变**：`linear-gradient(280deg, #FFD5B5 0%, #FFE9D5 96%)`——钉钉付费版本（VIP / 创业版 / 专属版 / 混合版 / 专有版）的品牌色块。
- **紫蓝主题色系**：`common_purple1 #B963D3` / `common_water1 #5AC8FA` / `common_pink1 #EC4589` / `common_olive1 #6F9200` / `common_yellow1 #F4C800`——标签、特殊元素、图表分类色。
- **灰阶中性色**：`common_gray1 #878F95` 到 `common_gray6 #F1F2F3`——深色模式反转为从 `#8F8F8F` 到 `#1C1C1C`，用于插画、统计图、装饰元素。

> **使用禁忌**：渐变只用于**大尺度背景或重点品牌装饰**，禁止用于小尺寸图标、按钮、文本背景。



## Typography

### Font Family (字体家族)

**优先调用各平台/系统默认的界面字体**，不强制下载 web font，保证性能与本地化体验：

| 平台 | 西文 | 中文 |
|---|---|---|
| macOS / iOS | SF Pro / SF Pro Display | PingFang SC |
| Android | Roboto | Noto Sans CJK |
| Windows | Segoe UI | Microsoft YaHei (微软雅黑) |

### Hierarchy (排版层级)

字体排版需要将字体样式**类型场景化**——通过场景约束来统一字号的使用，在桌面端与移动端建立相应的对应关系和一致性。所有类型均有 `regular` 和 `bold` 两种字重。

| 类型 | 移动端 | 桌面端 | 行高 | 使用场景 |
|---|---|---|---|---|
| **HyperTitle** | – | 64 | 1.2 | 品牌宣发、官网 Banner 等需要超大显示场景 |
| **SuperTitle** | 28 | 44 | 1.2 | 品牌宣发、官网 Banner 大标题；分享 Page 大标题 |
| **LargeTitle** | 24 | 32 | 1.2 | 品牌宣发、文档大标题 |
| **H1** | 20 | 24 | 1.4 | 系统级 1 级标题：markdown、文档、类文档阅读场景 |
| **H2** | 18 | 20 | 1.4 | 系统级 2 级标题 |
| **H3** | – | 18 | 1.4 | 桌面端 3 级标题 |
| **H4** | – | 16 | 1.5 | 桌面端 4 级标题 |
| **H5** | – | 15 | 1.5 | 桌面端 5 级标题 |
| **Body** | 17 | 14 | 1.5 | 系统平台默认字号，rem 单位基准，默认文字描述尺寸 |
| **Paragraph** | 17 | 14 | 1.6 | 与 Body 类似，适合大面积段落文本展示（文档、大面积文字） |
| **Subhead** | 15 | – | 1.5 | 描述性文字；Cell 第二行附属信息 |
| **Description** | 14 | 12 | 1.5 | 描述性文字；Cell 第二行附属信息 |
| **Footnote** | 12 | – | 1.5 | 脚注文字；时间戳等不重要的信息 |
| **Tiny** | 10 | 10 | 1.6 | 水印、不重要的小标注 |

### Principles (排版原则)

- **字重克制**：所有字体类型均有 `regular` 和 `bold` 两种字重，但**正文或长篇幅的文字不建议使用 bold**，bold 仅用于标题、强调、按钮文案。
- **行高分级**：标题组使用更小的行高（1.2 / 1.4）构成紧凑的视觉块，用于区分过大的行高与断行样式；正文（1.5）适用于中文单段文本或中英文混排；大面积阅读段落（1.6 / 1.8）使用 Paragraph。
- **颜色即层级**：使用透明度区分文字层级（level 1 / 2 / 3 / 4），而非引入更多灰色值；这保证了暗色模式下的视觉一致性。
- **可访问性优先**：正文、标题及一级描述文本与背景色的对比度保持在 **4.5:1 以上**（WCAG AA），主要文字色达到 **17.4:1 AAA**。

### WCAG 对比度参考

| 文字色 | 场景 | WCAG 对比度 |
|---|---|---|
| `level 1` `#171A1D 100%` | 主要文字色 | **17.4:1** AAA |
| `level 2` `#171A1D 60%` | 次要文字色 | **6.6:1** AA |
| `level 3` `#171A1D 40%` | 描述文字色 | **3.3:1** AA |
| `level 4` `#171A1D 24%` | 禁用与占位文字色 | 1.8:1 Fail（非关键信息） |

### Note on Font Substitutes (替代字体说明)

- **西文替代**：Inter / SF Pro Display / Segoe UI
- **中文替代**：PingFang SC / Microsoft YaHei / Noto Sans CJK
- **等宽替代**：SFMono-Regular / Menlo / Consolas

## Layout

### Spacing System (间距系统)

**所有间距以 4pt 为最小单位**，按整数倍指数曲线增长分布。

#### 间距尺寸 - 移动端

| 类型 | 数值 | 使用场景 |
|---|---|---|
| **Unit** | 4 | 最小单元，一般不直接用于移动端间距，间距不满足需求时可用 X Unit 定义 |
| **XS** | 8 | 元素应保持的最小间距，例如箭头和描述文字之间 |
| **S** | 12 | 列表图标和文字之间、卡片和左右屏幕的间距、列表组合之间 |
| **M** | 16 | 普遍内容和屏幕左右边缘的间距 |
| **L** | 24 | 较大的屏幕左右间距 |
| **XL** | 32 | 较大的屏幕左右间距 |
| **XXL** | 64 | 较大的屏幕左右间距 |

**屏幕左右间距**：最小使用 `S` (12)，大多数页面使用 `M` (16)，需要大量留白或运营页面使用 `L` / `XL`。

**屏幕上下间距**：最小使用 `M` (16) 分隔列表，顶部为大文字时使用 `L` (24)，需要大量留白时使用 `XL` / `XXL`。

#### 间距尺寸 - 桌面端

| 类型 | 数值 | 使用场景 |
|---|---|---|
| **Unit** | 4 | 最小单元，间距不满足需求时可用 X Unit 定义 |
| **XS** | 4 | 元素应保持的最小间距，例如箭头和描述文字之间 |
| **S** | 8 | 列表图标和文字之间、卡片和左右屏幕的间距、列表组合之间 |
| **M** | 12 | 普遍内容和屏幕左右边缘的间距 |
| **L** | 24 | 较大的屏幕左右间距 |
| **XL** | 40 | 较大的屏幕左右间距 |
| **XXL** | 64 | 较大的屏幕左右间距 |

> **关键差异**：桌面端的 `XS = 4` 比移动端的 `XS = 8` 更紧凑——因为桌面端有更大的屏幕尺寸和更高的信息密度。

### Grid & Container (网格与容器)

- **Max width**：桌面端主内容最大宽度 1200px，居中显示。
- **栅格模式**：
  - 桌面端通用背景采用 **3 列布局**（`bg / fg / bg` 或 `bg / fg_z1 / bg` 嵌套）。
  - 移动端通用背景采用 **fg_z1 满铺 + bg 区段** 的扁平布局。
  - 数据列表/卡片网格：桌面端 3-4 列，移动端 1-2 列。
  - 表单：桌面端 2 列对齐，移动端单列堆叠。

### Responsive Strategy (响应式策略)

#### Breakpoints (断点)

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 600px | 导航折叠为汉堡菜单；3 列网格降为单列堆叠；字号切换为移动端阶梯 |
| Tablet | 600–959px | 桌面端布局降级，2 列网格；侧边栏可折叠 |
| Desktop | ≥ 960px | 展现完整多列布局和侧边导航；字号切换为桌面端阶梯 |

#### Collapsing Strategy (折叠与适配策略)

- **Nav (导航)**：桌面端展示完整水平导航，移动端折叠为汉堡菜单 + 抽屉。
- **Hero (首屏)**：桌面端图文左右分栏，移动端图文上下堆叠、图占比 60-70%。
- **Grids (网格)**：4 列 → 2 列 → 1 列降级；卡片内边距从 `{spacing.lg}` 降为 `{spacing.md}`。



## Elevation & Depth (层级与深度)

阴影是区分不同元素或平面层级关系的重要工具。阴影的强弱由元素与观察者之间的距离决定——在真实物理空间中，离地面越远阴影越大、模糊值越高。本系统将阴影分为 3 个梯度层级，以构建系统内组件元素的不同高度层级。

| Level | Token | 颜色 | 方向 (x, y) | 模糊 | 使用场景 |
|---|---|---|---|---|---|
| **Level 1 — Subtle** | `{shadows.s}` | `#000000 16%` | 0, 1 | 4 | 导航条、悬停 hover 操作、中小型 card |
| **Level 2 — Float** | `{shadows.m}` | `#000000 16%` | 0, 8 | 24 | Dropdown、菜单 Menu 等非阻断式卡片 |
| **Level 3 — Modal** | `{shadows.l}` | `#000000 24%` | 0, 12 | 32 | 模态、侧弹窗等阻断式与非阻断式大型信息容器 |

*注：本系统**拒绝使用单层重度模糊的 Material 风格阴影**，倾向于使用 `y` 偏移小、blur 适中、透明度低的多层叠加，配合内描边（hairline）来营造克制的悬浮感。*

### Backdrop Blur (背景模糊)

模糊是 **macOS 与 Win10 平台的高级显示属性**，适用于性能较好的平台，体现操作界面质感对比时使用。**模糊值必须与背景色组合使用**，亮色与暗色背景色有所区分。

| Token | 颜色 | 模糊 | 描述 |
|---|---|---|---|
| `blur.default-light` | `#FFFFFF 94%` | 10 | 浅色模式下通用毛玻璃 |
| `blur.thin-light` | `#F1F2F3 90%` | 10 | 浅色模式下较透的毛玻璃 |
| `blur.default-dark` | `#1E1E1E 94%` | 10 | 深色模式下通用毛玻璃 |
| `blur.thin-dark` | `#272727 90%` | 10 | 深色模式下较透的毛玻璃 |

**典型应用**：顶部导航背景（`common_backdropblur_tabbar` `rgba(245,247,250,0.88)`）、菜单背景（`common_backdropblur_menu` `rgba(255,255,255,0.88)`）、主 tab 背景。

### Hairline Borders (内描边层级)

| 层级 | Token | 色值 | 用途 |
|---|---|---|---|
| Light | `{colors.hairline}` | `rgba(126,134,142,0.16)` | 卡片边缘、输入框静息态 |
| Hard | `{colors.hairline-strong}` | `rgba(126,134,142,0.24)` | 模态边界、强调分割 |
| Element | — | `rgba(126,134,142,0.4)` | 元素级描边色 |

## Shapes (形状与几何)

### Border Radius Scale (圆角阶梯)

根据实际的圆角实现方案以及设计一致性，本系统将圆角分为**非动态圆角**和**动态圆角**两种。

#### 非动态圆角

根据使用场景，固定为三个梯度的圆角值：

| Token | 圆角值 | 使用场景 |
|---|---|---|
| `{rounded.xs}` | 4 | S 梯度的元件，或元素高度 ≤ 36 时 |
| `{rounded.sm}` | 6 | M 梯度的元件，或 72 > 元素高度 > 36 时 |
| `{rounded.md}` | 8 | L 梯度的元件、窗口、Card，或元素高度 > 72 时 |

#### 动态圆角 `{rounded.auto}`

用于基础元件，且元件存在多种梯度尺寸大小。为了保证圆角的视觉感知一致性，采用动态圆角的实现方式（计算方法：`圆角值 = 元素高度 * 0.16`，小数点四舍五入）。

> **典型应用**：头像、用户卡片、IM 聊天气泡等同一组件存在多种尺寸的基础元件。

### Photography & Imagery (图像与图形风格)

- **风格**：钉钉插画以 2.5D 立体图形 + 扁平矢量为主，配合真实摄影图用于企业宣传。
- **裁剪规则**：统一使用 16:9 或 1:1 比例；卡片内图片使用 `{rounded.md}` 圆角与卡片外框对齐。
- **滤镜**：不使用过度风格化滤镜；保持原始色温，确保与 `{colors.canvas}` 背景自然融合。
- **图标系统**：采用线性图标（2px 描边）+ 双色图标（线性 + 主色填充）双轨制；AI 场景图标使用 渐变填充。



## Components (核心组件规范)

### Buttons (按钮)

- **`button-primary`**：品牌主色 `{colors.primary}` 填充，文字 `{colors.on-primary}`，圆角 `{rounded.sm}` (6px)，最小高度 32px。用于核心转化操作（提交、确认、发送）。
  - hover：`theme_primary_hover_color` `#0075EB`
  - press：`theme_primary_press_color` `#006AD6`
- **`button-secondary`**：`{colors.canvas}` 白底 + `{colors.hairline-strong}` 描边 + `{colors.ink}` 文字，用于次要操作（取消、返回）。
- **`button-ghost`**：透明背景 + `{colors.primary}` 文字，用于内联操作（查看更多、链接跳转）。
- **`button-danger`**：`{colors.error}` 红色填充，用于破坏性操作（删除、解除绑定）；使用 `theme_danger_hover / press_color` 处理交互态。

### Cards & Containers (卡片与容器)

- **`card-base`**：`{colors.surface}` 背景，`{rounded.md}` 圆角，`{spacing.md}` 内边距，`{shadows.s}` 阴影。用于静态内容容器。
- **`card-elevated`**：使用 `{shadows.m}` 阴影，hover 时阴影从 s 升级到 m。用于可点击卡片、临时提示。
- **`card-interactive`**：hover 时边框从 `{colors.hairline}` 升级到 `{colors.primary}` 透明度色 + 阴影从 s 升级到 m。

### Inputs & Forms (输入与表单)

- **`form-input`**：
  - 静息态：`{colors.canvas}` 背景，`{colors.hairline}` 1px 描边，`{rounded.xs}` (4px) 圆角，高度 36px，`{colors.ink}` 文字。
  - placeholder：`{colors.mute}` `#171A1D 24%`。
  - focus：边框切换为 `{colors.primary}`，可增加 1px 外发光 `0 0 0 2px rgba(0,127,255,0.12)`。
  - error：边框切换为 `{colors.error}` `#FF5219`。
  - disabled：背景切换为 `{colors.canvas-soft}`，文字 `{colors.mute}`。

### Navigation (导航)

- **`nav-bar`**：`{colors.canvas}` 背景（可选 `blur.default-light` 毛玻璃），高度 48px，文字 `{colors.body-md}` `{colors.ink}`。桌面端水平排列，移动端左侧 Logo + 右侧图标组。
- **`tab-bar`**：使用 `{shadows.s}` 阴影与内容分隔；激活态图标使用 `{colors.primary}`，未激活态使用 `{colors.mute}`。
- **`side-nav`**：固定 240px 宽度，`{colors.surface}` 背景，选中项使用 `{colors.primary3}` `#007FFF 12%` 背景 + `{colors.primary}` 文字。

### Signature Components (品牌特色组件)

#### 1. IM 聊天气泡 (IM Chat Bubble)

聊天气泡是钉钉最高频的 UI 元素，使用 **3 层颜色组合** 区分用户角色：

- **本人气泡 (self)**：浅蓝底 `#C9E7FF` + 主题蓝 press `#BFDDF5` + 文字 `{colors.ink}`；移动端最大宽度 70%，圆角 `{rounded.md}` (8px)，内边距 10px 12px。
- **对方气泡 (other)**：白底 `{colors.surface}` + press `#F6F6F6` + 文字 `{colors.ink}`。
- **公告气泡 (announcement)**：米色底 `#FCEDD9` + press `#E8DAC7`。
- **at 人色块**：使用 `{colors.primary}` 背景 + 白字。

#### 2. AI 渐变入口 (AI Entry)

- **大尺度入口**：使用 4 色对角渐变 `linear-gradient(116deg, #E98CDE → #B484F4 → #3991FF → #63D8FF)`。
- **AI 处理中**：使用 conic-gradient 旋转光圈，强制使用动效。
- **小尺寸 AI 图标**：使用 16px 以下尺寸时，切换为单色 `{colors.primary}` 图标，**禁止缩小使用渐变**。

#### 3. 商业化付费版本色块 (Commerce Tier)

钉钉 VIP / 创业版 / 专属版 / 混合版 / 专有版使用统一的暖橙渐变：

- 基础：`linear-gradient(280deg, #FFD5B5 0%, #FFE9D5 96%)`
- 文字色：`#492D0A`（深棕）
- 单一版本色块（深色模式）：
  - VIP：`#963CE6`（紫）
  - 创业版：`#00A0F0`（青）
  - 专属版：`#235AFF`（蓝）
  - 混合版：`#2D32FF`（深蓝）
  - 专有版：`#4614FF`（紫蓝）

#### 4. Tab 选中色块

`common_tab_icon_selected_bg_color` `rgba(45,132,250,1)`——主 tab 选中态使用更鲜明的蓝色变体，与 `{colors.primary}` 形成层级差异。

## Do's and Don'ts (设计准则)

### Do (推荐做法)

- **始终使用 `{colors.primary}` 作为页面中唯一引导核心转化的颜色**，所有 CTA 按钮、链接、激活态的视觉焦点必须与品牌主色一致。
- **保持大面积留白**，让内容区块之间有足够的呼吸空间；卡片间距使用 `{spacing.md}` (16px) / `{spacing.lg}` (24px)，大区块使用 `{spacing.3xl}` (64px) / `{spacing.section}` (120px)。
- **技术类标签和代码块必须使用等宽字体** (`{typography.code}`)，包括 IME 标识、命令、版本号、时间戳等场景。
- **文字层级使用透明度而非色阶**——`level 1` 到 `level 4` 全部基于 `#171A1D` 的不同透明度，保证暗色模式下的视觉一致性。
- **优先使用语义色**——成功/警示/错误状态必须使用 success / warning / error 语义色，而非自定义颜色。
- **跨端字号阶梯必须遵循**——桌面端使用桌面端字号阶梯（Body 14px / HyperTitle 64px），移动端使用移动端字号阶梯（Body 17px / SuperTitle 28px），不要混用。
- **圆角与元素高度匹配**——元素高度 ≤ 36 用 `{rounded.xs}`，36-72 用 `{rounded.sm}`，> 72 用 `{rounded.md}`；头像等多尺寸元件使用 `{rounded.auto}`。
- **阴影分级克制**——默认卡片使用 `{shadows.s}`，悬浮升级为 `{shadows.m}`，模态使用 `{shadows.l}`；**禁止自定义模糊半径**。

### Don't (禁忌事项)

- **不要混用 `blue` 系与 `primary` 系颜色**——根据场景固定使用一套：客户定制主题下使用 `theme_primary*`，品牌强相关场景使用 `common_blue*`；同一界面内禁止两套混用。
- **不要给卡片添加过重、模糊度过大的单层 Material 风格阴影**——禁止类似 `0 8px 32px rgba(0,0,0,0.4)` 的写法。
- **不要将品牌渐变缩小用作图标或局部点缀**——AI 渐变、商业化暖橙渐变仅适用于大尺度背景（≥ 120px 高度），小尺寸请切换为单色 `{colors.primary}`。
- **不要在同一页面混用大圆角（胶囊）和直角按钮**，保持圆角阶梯的一致性——S/M/L 阶梯内部不混用。
- **不要在正文或长篇幅文字中使用 bold 字重**——bold 仅用于标题、强调、按钮文案。
- **不要使用 `level 4` 文字色表达关键信息**——`#171A1D 24%` 仅用于禁用与占位等非关键状态（WCAG 1.8:1 不通过）。
- **不要在浅色模式下使用纯黑 `#000000` 或纯白 `#FFFFFF` 作为唯一前景/背景**——使用 `#171A1D` 与 `#FFFFFF` 的语义化对应组合。
- **不要在表单输入框 focus 时移除边框**——必须保留 1px 描边，可使用 `{colors.primary}` 替代 hairline。

---

## Appendix A — 文案写作 (Writing)

> 数据源：`docs/writing.md`。本节定义钉钉产品中的文案规范，是设计系统的延伸。

### 写作原则四象限

| 清晰准确 (clear) | 友好尊重 (friendly) | 表述一致 (consistency) | 简洁有效 (useful) |
|---|---|---|---|
| 使用用户熟悉的语言<br>用词精准完整，符合内容指南 | 避免歧义<br>用户作为主语<br>专注于解决问题，而非指责用户 | 描述同一事物的词汇统一<br>上下文语法、语种、语序统一<br>不同页面间相同操作名称一致 | 提供简短、易于快速获取的内容<br>符合操作场景，引导下一步操作 |

### 1. 用词清晰准确 (clear)

> *Bad writing slows things down. Good writing speed them up.*

1. **使用用户熟悉的语言**——避免生僻、文雅、暧昧的词汇。
   - ❌ "变更已生效" → ✅ "提交成功"
2. **用词精准完整**——通用基本用词要规范，不要写错字，词语表达完整。
   - ❌ "卡号：1234" / "登陆" → ✅ "银行卡号：1234" / "登录"
3. **避免歧义**——按钮文案要明确动作结果。
   - ❌ "确定" → ✅ "我知道了"

### 2. 友好尊重 (friendly)

> *Microcopy is how your product communicates.*

1. **以用户为中心**——文案应以用户为主体来写作。
   - ❌ "此问卷已被你提交，我们将为你提供 1 次抽奖机会" → ✅ "你已提交此问卷，可以获得 1 次抽奖机会"
2. **专注于解决问题**——当用户输入错误信息/遇到问题时，把问题/错误明确反馈给用户。
   - ❌ "密码不能输入纯字母" → ✅ "正确的密码格式为字母和数字的结合"

### 3. 表述一致 (consistency)

> *Make the most of your words.*

1. **描述同一个事物的词汇要保持统一**——同一概念在产品中只使用一个标准词汇。
   - ❌ "请输入校验码" → ✅ "请填写验证码"
2. **上下文的语法、语种、语序要保持统一**——并列项使用相同句式。
   - ❌ "1.输入用户名" "2.密码重置" → ✅ "1.输入用户名" "2.重置密码"
3. **不同页面间相同的操作名称保持一致**——"保存" / "提交" / "确认"等核心操作名称不得随意替换。

### 4. 简洁有效 (useful)

> *Writing is easy. All you have to do is cross out the wrong words.*

1. **省略无用词汇**——不重复用户已知事实，提供简短、易于快速获取的内容。
2. **主动语态**——用户作为主语的主动态，更能调动用户情绪。
   - ❌ "请对密码进行修改" → ✅ "请修改密码"
3. **符合操作场景，引导下一步操作**——空状态不要只说"没有内容"，要告诉用户如何产生内容。
   - ❌ "没有收藏内容" → ✅ "没有收藏内容 / 可以在聊天界面长按消息来收藏"

---

## Appendix B — Token 速查表

### 颜色 token（浅色模式简表）

| 类别 | Token | 值 |
|---|---|---|
| Primary | `{colors.primary}` | `#007FFF` |
| On primary | `{colors.on-primary}` | `#FFFFFF` |
| Secondary | `{colors.secondary}` | `#5AC8FA` |
| Accent | `{colors.accent}` | `#00B042` |
| Canvas | `{colors.canvas}` | `#FFFFFF` |
| Canvas soft | `{colors.canvas-soft}` | `#F2F2F6` |
| Surface | `{colors.surface}` | `#FFFFFF` |
| Hairline | `{colors.hairline}` | `rgba(126,134,142,0.16)` |
| Hairline strong | `{colors.hairline-strong}` | `rgba(126,134,142,0.24)` |
| Ink | `{colors.ink}` | `#171A1D` |
| Body | `{colors.body}` | `rgba(23,26,29,0.6)` |
| Mute | `{colors.mute}` | `rgba(23,26,29,0.24)` |
| Link | `{colors.link}` | `#317EDD` |
| Success | `{colors.success}` | `#00B042` |
| Error | `{colors.error}` | `#FF5219` |
| Warning | `{colors.warning}` | `#FF9200` |

### 间距速查

| Token | 值 | 典型用途 |
|---|---|---|
| `{spacing.xxs}` | 4 | 元素级最小间距 |
| `{spacing.xs}` | 8 | 列表图标与文字 |
| `{spacing.sm}` | 12 | 卡片与左右屏幕 |
| `{spacing.md}` | 16 | 普遍内容间距 |
| `{spacing.lg}` | 24 | 区块分隔 |
| `{spacing.xl}` | 32 | 大区块留白 |
| `{spacing.2xl}` | 40 | 桌面端大留白 |
| `{spacing.3xl}` | 64 | 运营页面留白 |
| `{spacing.section}` | 120 | 营销/大区块 |

### 圆角速查

| Token | 值 | 用途 |
|---|---|---|
| `{rounded.xs}` | 4 | 元素高度 ≤ 36 |
| `{rounded.sm}` | 6 | 元素高度 36-72 |
| `{rounded.md}` | 8 | 元素高度 > 72、Card、窗口 |
| `{rounded.full}` | 9999 | 胶囊按钮、头像 |
| `{rounded.auto}` | height*0.16 | 多尺寸基础元件 |

### 阴影速查

| Token | 值 | 用途 |
|---|---|---|
| `{shadows.s}` | `0 1px 4px rgba(0,0,0,0.16)` | 导航条、卡片 |
| `{shadows.m}` | `0 8px 24px rgba(0,0,0,0.16)` | Dropdown、菜单 |
| `{shadows.l}` | `0 12px 32px rgba(0,0,0,0.24)` | 模态、侧弹窗 |

---

*集成数据源：`docs/borderRadius.md` / `docs/color.md` / `docs/shadow&blur.md` / `docs/spacing.md` / `docs/theme.md` / `docs/typography.md` / `docs/writing.md`*
*模板参考：`designTemplate.md`*
