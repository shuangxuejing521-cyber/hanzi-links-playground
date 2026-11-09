# 字有意思 汉字部件实验室

面向外国学习者的汉字与词汇学习网站，结合汉字来源、偏旁探索、组字练习和联想记忆，帮助练习汉字、记住汉语单词。当前界面提供韩语辅助说明。官方HSK 1–6级及合并7–9级的11,000条词汇均可进入逐字学习；覆盖3,088个不同汉字，兼容旧版五级词表独有的“桔”，共3,089字。保留原26类物象图解、171个经审阅的左右组合及旧版五级2,500条词汇；206类辞书部首作为分类入口，字典归部与构字角色分开呈现。

## 使用

- 偏旁探索：按所选级别的部首进入全部汉字，查看真实字形、嵌套部件结构、单字韩语释义、来源及关联词。词汇详情中的每个汉字均可继续学习。
- 跟着一根线学字：受用户指定视频启发的原创丝束描形、颜色、连接和打结课程。
- 自由组字：新版级别支持左右、上下、三部、包围和重叠结构；按源结构精确匹配，重复部件可以重复放置。旧版五级保留原171字的拖放组字体验。未知组合只提示当前范围暂未收录。
- 看图挑战：新版级别依据真实字形进行结构拼图；旧版五级保留原图片含义题。一题只计一次分，支持按部首更换题目。
- 我的连接：合并旧版和全量课程已学字，去重保存发现、收藏与累计成绩；记录保存在本机浏览器。

## 开发

安装依赖后执行 `npm run dev`，默认端口5184。`npm test`运行数据和学习记录测试；`npm run build`执行类型检查和静态构建。浏览器端到端检查为 `node tests/browser.mjs`，可通过HANZI_URL设置目标地址。

站点身份保存在`.openai/hosting.json`。发布使用Sites源工作流与精确构建产物。不要将凭据写入文件。

## 内容与许可

实物和动作图使用内置 image_gen 逐图生成，按教学义项检查，不是文物实拍或字源证据。根部件取形图为原创 SVG，现代字形采用 Make Me a Hanzi / Arphic 真实笔画。视频仅为教学方法参考，未复制课程画面或公开完整字幕；核对说明见 `docs/video-method.md`。韩语尚未经母语教师独立审校。

字形、拼音和韩语来源及许可见 `src/data/NOTICE.txt` 与 `public/sources/`。现代简体练的右部为𫠣，页面直接提取练的右部真实笔画，不能用东或柬替换。

## 验证

验证包括数据、学习记录、证据和图片覆盖测试、TypeScript、生产构建与浏览器检查。浏览器流程覆盖组合库、油泳对照、未知组合、跨偏旁连接、挑战计分、刷新记录、韩语搜索、图形课程、稀有部件、手机和来源说明。

## 2026-11-05 图解修订

152种可选部件、26类根部件及171个组合逐条记录来源和置信度。字源优先香港中文大学《汉语多功能字库》和教育部字典；女另核对中央研究院《汉字古今字资料库》。声旁、形旁和现代简化形分别说明，不把独立字义硬加为整字义。

历史/传统形体用楷书对照，不伪称甲骨文摹本；点击来源可查看古文字。447个现代字形轮廓依 Arphic Public License 提供。图片清单见 `src/data/image-manifest.json`，提示词见 `docs/image-prompts.json`。

## 汉典字源演变

依据用户指定的汉典页面，26个偏旁本字共保留171个原图库字例及出典。主界面选择甲骨文、金文、《说文》小篆与楷书中的可用代表图，点击切换放大；缺阶段略去，不将楚简、秦简等材料强排成一条年代链。SVG依据汉典现行CC0 1.0声明使用。逐图来源和SHA256见 src/data/radical-evolution.json，下载/同步脚本 scripts/sync-zdic.py。

## 熊猫雨与暖色主题

熊猫雨采用用户指定的后期文化课网页 https://claude.ai/artifact/BerPmm6iwNt7KjhTXPRbLc 中八种立体熊猫原图，以及掉落、弹跳、落地摆动逻辑。原图位于 public/illustrations/pandas，来源与校验值见其中 SOURCE.json。点击熊猫会蹦起并冒心；页头按钮重播、浮动按钮或Esc结束。每次重播清理上一场，页面隐藏与组件卸载时取消动画和待触发定时器；减少动态效果偏好下不播放。手机落点避开固定导航。独立组件为 src/components/PandaRain.tsx，暖色分区与字号覆盖为 src/warm-theme.css。

功能说明、搜索提示、组字反馈、字源区引导和熊猫雨操作已精简为韩语；汉字、拼音及逐字构形依据保留。来源与许可集中到帮助面板，较长许可细节可展开查看。

## HSK 官方分级词汇与练习

新增官方《HSK考试大纲》（2025-11发布，封面标注2026-07实施）词汇大纲11,000条。级别为1、2、3、4、5、6、7–9，新增数300/200/500/1000/1600/1800/5600，累计300/500/1000/2000/3600/5400/11000；7–9为合并词汇组。旧版五级累计2,500条原样保留，默认仍为旧版五级。

src/data/hsk-official.json 保留官方序号、词形、拼音、词性、原始等级标注与PDF页码，韩语释义单独标记来源。public/sources/hsk-official.json 为原始官方记录，hsk-official-source.json 包含官方PDF哈希、来源与韩语同形义项处理记录。导入脚本为 scripts/import-hsk-official.py；韩语采用Second Language/CC-CEDICT（CC BY-SA 4.0），不是官方翻译。

分级框提供累计/本级切换、分页浏览、汉字/有调或无调拼音/韩语搜索和翻卡练习。全局搜索、逐字学习、关联词和新版结构拼图均使用所选词汇范围；旧版五级保留原171字的组字与图片挑战。原有三栏框架与熊猫雨保留，学习记录扩展到全部课程汉字。

## 辞书部首检索

“사전 부수”按Unicode 18.0.0 Unihan `kRSUnicode`的康熙214部首编号，收录当前词库实际用到的206类。官方11,000条词汇中的3,088个汉字全部覆盖；另纳入旧版词表独有的“桔”，共3,089字。词语按其中任一汉字的检字部首归类，因此可出现在多个类别中；70个官方词表汉字的多重检字分类全部保留。

这套索引用于查词。原有26类图解、逐字字源依据与171个组合继续独立用于教学；检字归类不能直接推导字源、形旁/声旁或有效的组字规则。月/肉、阜/邑按源数据分别保留。206类采用康熙编号体系，与[《汉字部首表》的201个主部首](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202211/t20221118_995332.html)统计口径不同。

来源为Unicode 18.0.0的[Unihan.zip](https://www.unicode.org/Public/18.0.0/ucd/Unihan.zip)与[CJKRadicals.txt](https://www.unicode.org/Public/18.0.0/ucd/CJKRadicals.txt)，另以官方RSIndex交叉核对全部3,089字。Unicode数据依Unicode License V3提供。原始属性、逐字多值审计、来源哈希、验证结果及许可证在`public/sources/unicode18/`。将对应版本的`Unihan.zip`、`CJKRadicals.txt`、`RSIndex.txt`与`Unicode-LICENSE.txt`放入同一目录后，执行`python3 scripts/import-dictionary-radicals.py --source-dir /path/to/unicode18`复现；脚本先校验固定SHA-256，再生成索引和公开审计文件。


## 全词汇逐字图解课程

现有单词详情中增加“字源字形”区，每个不同汉字都有可点击的来源入口，覆盖全部3,089字。来源面板展示汉典释形、实际收录的各阶段字例、文献出处、繁体/相关字提示及清楚标注的现代字形。原有183个组合的“탐색하기”跳转、26类偏旁主界面、组字与看图挑战、旧版进度均继续使用原接线。通用课程数据中的现代结构保留为来源依据；不把嵌套IDS或现代部件本身当作历史释形，也不把未编码圈号当汉字。

现代字形与结构分别来自Make Me a Hanzi的笔画及字典、CJKVI/CHISE IDS；它们不自动证明形旁、声旁或古文字来源。逐字结构、选择依据和哈希见`public/sources/course-characters.json`、`course-characters-audit.json`、`course-characters-provenance.json`，生成脚本为`scripts/build-course-characters.py`。补充组件轮廓见`course-component-glyphs.json`，以其覆盖报告及实际文件为准；没有取得轮廓的部件不虚构笔画。

本轮补充973项韩语单字参考译义，编辑源分别为`src/data/course-korean-a.json`和`course-korean-b.json`；结合英文词典义与官方例词选义，连绵词构件、音译及多音多义单独说明，不把多字词的整个意思硬套单字。合并课程层后，官方3,088个汉字均有韩语参考义；韩语释义为AI编辑的学习参考，尚未经韩语母语教师独立审校，也不是官方翻译。9项读音修订及逐字汉典来源见`src/data/course-corrections.json`，公开副本与韩译文件在`public/sources/`。最终教学层的覆盖、图形和义项统计见`public/sources/course-teaching-coverage.json`；原`course-characters-provenance.json`中的2,116项韩语覆盖是生成时的上游原始快照，按原样保留，不冒称已包含后续叠加修订。

字形清单检查了全部3,089个目标字的汉典字页，并按页面实际列出的甲骨文、金文、楚系简帛、《说文》小篆、秦系简牍、隶书及楷书增量保留11,304条阶段记录。2,681个条目列有非楷书阶段，161个条目仅列楷书，247个条目未列该栏目阶段；这些统计表示来源条目的收录，不能解释为已独立核实每个简体字的直系古形。楷书单独计数，不纳入古字覆盖。实际本地图像、远程引用和SHA256以`public/sources/course-evolution.json`的coverage为准；远程失败只保留链接。脚本为`scripts/sync-course-evolution.py`和`scripts/mirror-course-evolution.py`。已有字例、修订记录和核查日期保留，缓存扩展不伪称重新访问来源页。

实物图片与上述字形另列：沿用原26类部件和171字的AI参考场景，并为新增常见部件提供取形参考，清单见`public/sources/course-objects.json`。同一个部件可在不同字卡中重复出现，但注明仅是部件线索，不冒称整字或整词的物象。全词汇有逐字课程，不等于为3,089字生成了3,089张实物照片；现代结构图、古字例和AI实物参考分别标明。

逐字说明保留汉典的归属。缺少简短分析时另存《说文》原文、段注或详细解释的带出处引文；异字转引注明索引字和关系限制。少量补充释形以简短编辑转述另列`character-origin-supplements.json`，引用香港中文大学字库或教育部《异体字字典》，保留争议和收录边界。现代字形、相关字例与未收录阶段分别标明，不生成虚构古字形。


## Private analytics

The learning site remains public at https://hanzi-links-playground.jazzybay4.chatgpt.site/ . Its `/admin` dashboard, summary API and CSV exports require the founder identity configured by the server-side `ADMIN_USER_IDS` secret. Never commit that value to GitHub.

The dashboard compares learning-mode entry clicks, click shares, radical selections and session-based radical CTR. Mode clicks and automatic views are counted separately. New mode clicks start with the 2026-11-09 update; historical views are preserved. Founder traffic is excluded. Date, course and level filters apply to the displayed totals.

Cloudflare D1 stores real visitor records. This repository contains schema and synthetic tests, not production data, database files, analytics exports, credentials or runtime configuration values. Keep `.env*`, `.dev.vars*`, `.wrangler/`, `.sites-runtime/` and exports out of Git. Publishing source does not grant write access to the running site. Retain the individual data and asset notices listed above.


## 分级词义照片补全

在现有照片学习界面中，按官方词条ID逐级补充词义照片；组件、布局、CSS、词库ID和统计权限保持不变。已有照片和对应关系保留。词义相同或明确的例句情境才共用图片，抽象词和语法词附使用语境说明，照片不充当字源证据。

各级实际照片覆盖与待补数量见 `public/sources/word-photo-coverage.json`，新增图片的实际提示词、SHA256和审核记录见 `public/sources/word-photo-expansion.json`。补全目标为11,000词，按真实完成度逐级更新，不把字形SVG计作词义照片。


## 左侧部首扩充

偏旁探索左侧现在保留原26类教学字族的ID、顺序、名称和活动，并追加180个原先未覆盖的辞书分类，共206类。原26字族按来源部首对齐，并保留酒（水字族）、料（米字族）等已有教学成员；同一字也能在酉、斗等辞书分类找到。肉130与月74、邑163与阜170分别保留。每类字数和词条随当前HSK范围变化；原26字族中新出现的其余汉字同样可从补充字卡进入，原183组合的教学照片与游戏继续保留。

新增分类中的字卡复用现代真实字形、源结构和统一字源面板，并可进入对应单词。词义照片仍按分级清单逐步补齐，不能以字形图替代词义照片完成度。新增分类的点击、曝光和点击率进入原私有后台，创始人权限、统计排除规则与数据保密边界保持。分类逻辑及覆盖测试见`src/lib/sidebar-families.ts`、`tests/sidebar-families.test.ts`。
