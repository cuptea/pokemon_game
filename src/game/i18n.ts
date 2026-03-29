import { getStoryProfile, getStoryStatus } from "../data/stories";
import type { GameDifficulty, PlayerAvatar, WorldState } from "../types/world";

export type SupportedLanguage = "en" | "zh" | "de";

const STORAGE_KEY = "pokemon_game_language_v1";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  zh: "中文",
  de: "Deutsch",
};

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    "language.label": "Language",
    "difficulty.casual": "CASUAL",
    "difficulty.adventure": "ADVENTURE",
    "difficulty.heroic": "HEROIC",
    "app.login_title": "Login To Begin Your Quest",
    "app.login_copy":
      "Sign in with Google to save your name to the leaderboard, or continue as a guest and keep playing locally.",
    "app.google_sign_in": "Sign In With Google",
    "app.google_missing": "Google Login Needs Firebase Config",
    "app.guest_continue": "Continue As Guest",
    "app.note_google": "Google login uses Firebase Auth in this build.",
    "app.note_score":
      "Leaderboard scores track victories, discoveries, owned creatures, and story progress.",
    "app.note_remote":
      "Remote leaderboard is enabled when your Firebase project allows Firestore reads and writes.",
    "app.note_local":
      "Firebase env vars are missing, so this build will use a local guest leaderboard fallback.",
    "app.top_trainers": "Top Trainers",
    "app.signed_in_google": "Signed in with Google",
    "app.guest_mode": "Guest mode with local save + local leaderboard",
    "app.leaderboard": "Leaderboard",
    "app.sign_out": "Sign Out",
    "app.no_scores": "No scores yet. Be the first trainer to make the board.",
    "app.row_meta":
      "{avatar} • {difficulty} • {victories} wins • {discoveries} discoveries • {owned} owned",
    "app.google_failed": "Google sign-in could not be completed.",
    "app.trainer_default": "Trainer",
    "start.subtitle": "1980s handheld-inspired adventure mode",
    "start.select_hero": "SELECT HERO",
    "start.difficulty": "DIFFICULTY",
    "start.press_enter": "PRESS ENTER TO START",
    "start.hint":
      "{avatar} selected. {storyTitle}.\nGoal: {objective}\nRoute: {route}",
    "story.blaze.title": "The Ember Trail",
    "story.blaze.card_subtitle": "Ember Chaser",
    "story.blaze.objective_short": "Trace the ember signs.",
    "story.blaze.route": "Mossgrove -> Verdantveil -> Ember Watch -> Cinder Quarry",
    "story.blaze.opening":
      "Mentor Liora wants you to prove yourself, then trace the ember signs glowing beyond Mossgrove and into Verdantveil Glen.",
    "story.blaze.mystery":
      "An old watchtower keeps flashing with an orange glow, and wild creatures are being pushed out of the hidden paths below it.",
    "story.blaze.mentor":
      "Liora believes Blaze has rare courage, but she keeps warning that impatience will burn the clues away before the truth appears.",
    "story.mist.title": "The Silver Current",
    "story.mist.card_subtitle": "Lake Seeker",
    "story.mist.objective_short": "Study Silvermere's current.",
    "story.mist.route": "Mossgrove -> Silvermere -> Ferry Docks -> Mirror Isles",
    "story.mist.opening":
      "Mentor Liora wants you ready for the field, then she expects you to follow the strange ripples connecting Mossgrove to Silvermere Lake Edge.",
    "story.mist.mystery":
      "The lake has started reflecting lights that are not in the sky, and the ferry route remains closed until someone understands why.",
    "story.mist.mentor":
      "Liora trusts Mist to notice patterns that faster trainers miss, especially when the region starts hiding answers in reflections and tides.",
    "story.grove.title": "Song of the Grove",
    "story.grove.card_subtitle": "Forest Listener",
    "story.grove.objective_short": "Answer the forest's warning.",
    "story.grove.route": "Mossgrove -> Verdantveil -> Hidden Grove -> Root Sanctuary",
    "story.grove.opening":
      "Mentor Liora wants your first battle done, then she expects you to follow the land's warning from Mossgrove into Verdantveil Glen and the Hidden Grove.",
    "story.grove.mystery":
      "Verdantveil's balance is slipping, and the quiet grove beyond Route 01 feels more like a sealed shrine than a simple side path.",
    "story.grove.mentor":
      "Liora trusts Grove's instinct for the land, but she worries that sympathy alone will not be enough if something old is waking up in the roots.",
    "gameover.title": "GAME OVER",
    "gameover.journey": "{avatar}'s journey faltered on {route}.",
    "gameover.keep_profile":
      "Your selected hero and difficulty will be kept.\nYour team and route progress will restart from the beginning.",
    "gameover.press_enter": "PRESS ENTER TO START AGAIN",
    "gameover.space_hint": "Space also restarts the adventure.",
    "gameover.defeat_message":
      "Your battle buddies fell in combat. Regroup, rethink your team, and try the region again.",
    "overworld.marker_loot": "LOOT",
    "overworld.marker_clue": "CLUE",
    "overworld.marker_read": "READ",
    "overworld.marker_exit": "EXIT",
    "overworld.marker_door": "DOOR",
    "overworld.prompt_talk": "Press E to talk to {name}",
    "overworld.prompt_trainer_talk": "Press E to talk to {trainerClass} {name}",
    "overworld.prompt_challenge": "Press E to challenge {trainerClass} {name}",
    "overworld.prompt_wild": "Press E to approach {name}",
    "overworld.wild_appears": "Wild rustling... {name} appears!",
    "overworld.joined_team_added":
      "{name} joined your team and was added to your battle buddies.",
    "overworld.joined_team":
      "{name} joined your team. Open the party menu with C to add it to your battle buddies.",
    "overworld.already_owned":
      "{name} retreated. Your team already knows this route well.",
    "overworld.grass_settles": "{name} retreated. The tall grass settles down for a moment.",
    "overworld.lose_training": "Your team needs more training. Try another route or battle again.",
    "overworld.escape_field": "You slipped out of the battle and returned to the field.",
    "overworld.arrived": "You arrived in {map}. {objective}",
    "overworld.status":
      "Hero: {hero}\nLead: {lead}\nParty: {party}/3\nOwned: {owned}\nVictories: {victories}\nDiscoveries: {discoveries}",
    "overworld.help_title": "Field Guide",
    "overworld.help_body":
      "Move: Arrow keys or WASD\nInteract: E\nParty menu: C\nHelp: H\nReset progress: R\n\nHero: {hero}\nLead buddy: {lead}\nBattle buddies: {party}/3\nOwned allies: {owned}\nStory: {story}\nAct: {act}\nDifficulty: {difficulty}\n\nGoal: {goal}\nNext landmark: {nextLandmark}\n\nMystery: {mystery}\n\nLiora's read: {mentor}\n\nRoute: {route}\n\nArc: {arc}\n\nChapter note: {chapterSummary}\n\nAsset direction: {mapCount} maps are ready for a CC0-first art swap.",
    "overworld.hud_default":
      "Arrow keys/WASD move. E interacts. C opens party. H opens help. R resets progress.",
    "overworld.hud_exploring":
      "Exploring {map}. {zone}. {chapter}. Goal: {objective}",
    "overworld.hud_controls":
      "Arrow keys/WASD move. E interacts. C opens party. {chapter}. Goal: {objective}",
    "overworld.progress_reset": "Progress reset. Mossgrove Town is fresh again.",
    "overworld.party_lead":
      "{name} is now leading your {partySize}-buddy party.",
    "overworld.lead_fallback": "Lead buddy",
    "story.blaze.long_arc":
      "Blaze starts by chasing a stray flare from Mossgrove's watchtower, then discovers that the ember signs are part of a false signal lattice running through the watch peaks and quarry roads toward Astera Citadel.",
    "story.mist.long_arc":
      "Mist follows a chain of reflected lights from Mossgrove to Silvermere, then learns the water routes are carrying a hidden navigation code toward the Mirror Isles.",
    "story.grove.long_arc":
      "Grove traces the forest's warning from Verdantveil into the hidden sanctuaries, uncovering a root-bound rite that once protected the region from a sleeping force beneath the shrine road.",
    "chapter.blaze.0.title": "Act I - First Spark",
    "chapter.blaze.0.objective":
      "Defeat Mentor Liora, then follow the ember signs from Route 01 into Verdantveil Glen.",
    "chapter.blaze.0.objective_short": "Defeat Liora and reach Verdantveil.",
    "chapter.blaze.0.next_landmark": "Verdantveil Glen",
    "chapter.blaze.0.summary":
      "Blaze leaves Mossgrove as a hot-blooded scout, convinced the watchtower flare is a direct trail worth chasing.",
    "chapter.blaze.1.title": "Act II - Alarm on the Ridge",
    "chapter.blaze.1.objective":
      "Climb from Verdantveil to Ember Watch Peak, defeat Watch Captain Brann, and read the alarm logs before the trail goes cold.",
    "chapter.blaze.1.objective_short": "Reach Ember Watch Peak.",
    "chapter.blaze.1.next_landmark": "Ember Watch Peak",
    "chapter.blaze.1.summary":
      "The ember signs narrow into a watch-ridge alarm network, and Blaze has to read the signal instead of blindly outrunning it.",
    "chapter.blaze.2.title": "Act III - Furnace Truth",
    "chapter.blaze.2.objective":
      "Cross Cinder Quarry, defeat Furnace Warden Sol, and shut down the false signal feeding Astera's lost forge road.",
    "chapter.blaze.2.objective_short": "Shut down the quarry signal.",
    "chapter.blaze.2.next_landmark": "Cinder Quarry",
    "chapter.blaze.2.summary":
      "The flare is not a beacon but a lure, and Blaze's path turns into a test of control and precision at the quarry furnace line.",
    "chapter.mist.0.title": "Act I - The Closed Ferry",
    "chapter.mist.0.objective":
      "Defeat Mentor Liora, then inspect Silvermere Lake Edge and learn why the ferry route is closed.",
    "chapter.mist.0.objective_short": "Reach Silvermere Lake Edge.",
    "chapter.mist.0.next_landmark": "Silvermere Lake Edge",
    "chapter.mist.0.summary":
      "Mist begins as an observer, following ripples and light patterns that everyone else keeps dismissing as harmless reflections.",
    "chapter.mist.1.title": "Act II - Ferryman's Signal",
    "chapter.mist.1.objective":
      "Defeat Harbor Captain Neris at Silvermere Ferry and recover the route beacon log from the docks.",
    "chapter.mist.1.objective_short": "Secure Silvermere Ferry.",
    "chapter.mist.1.next_landmark": "Silvermere Ferry",
    "chapter.mist.1.summary":
      "The closed ferry route hides a message in reflected light, and Mist has to read motion, tide, and timing instead of force.",
    "chapter.mist.2.title": "Act III - Mirror Isles",
    "chapter.mist.2.objective":
      "Sail to the Mirror Isles, defeat Tide Reader Sel, and decode the reflected channel guiding the region's lost route.",
    "chapter.mist.2.objective_short": "Decode the Mirror Isles route.",
    "chapter.mist.2.next_landmark": "Mirror Isles",
    "chapter.mist.2.summary":
      "What looked like scattered reflections becomes a deliberate code, and Mist turns patience into the key to charting the region again.",
    "chapter.grove.0.title": "Act I - Forest Warning",
    "chapter.grove.0.objective":
      "Defeat Mentor Liora, then follow the warning signs from Route 01 into Verdantveil Glen and the Hidden Grove.",
    "chapter.grove.0.objective_short": "Reach the Hidden Grove.",
    "chapter.grove.0.next_landmark": "Hidden Grove",
    "chapter.grove.0.summary":
      "Grove leaves Mossgrove listening for what the land is trying to say, reading silence and movement as much as footsteps.",
    "chapter.grove.1.title": "Act II - Root Sanctuary",
    "chapter.grove.1.objective":
      "Travel through Hidden Grove, defeat Keeper Thalen in Root Sanctuary, and learn why the forest wards are weakening.",
    "chapter.grove.1.objective_short": "Reach Root Sanctuary.",
    "chapter.grove.1.next_landmark": "Root Sanctuary",
    "chapter.grove.1.summary":
      "The quiet side paths lead to old protective rites, and Grove has to understand the forest's memory before it fully breaks.",
    "chapter.grove.2.title": "Act III - Old Shrine",
    "chapter.grove.2.objective":
      "Restore the shrine road, defeat Shrine Warden Ilex, and calm the force waking beneath the oldest roots.",
    "chapter.grove.2.objective_short": "Restore the Old Shrine.",
    "chapter.grove.2.next_landmark": "Old Shrine",
    "chapter.grove.2.summary":
      "Grove's route becomes a restoration effort, turning trust in the land into action before the buried force fully wakes.",
    "battle.wild_encounter": "Wild Encounter",
    "battle.trainer_battle": "Trainer Battle",
    "battle.field_threat": "FIELD THREAT",
    "battle.tactical_duel": "TACTICAL DUEL",
    "battle.foe": "FOE",
    "battle.roaming_creature": "ROAMING CREATURE",
    "battle.trainer_party": "TRAINER PARTY",
    "battle.ally": "ALLY",
    "battle.team_lead": "TEAM LEAD",
    "battle.question": "QUESTION",
    "battle.quiz_intro": "Press START QUIZ ATTACK or tap Q to reveal the current question.",
    "battle.quiz_support_wild": "Wild questions are about tempo. Answer fast to keep control.",
    "battle.quiz_support_trainer":
      "Trainer duels reward cleaner reads and punish hesitation harder.",
    "battle.quiz_timer": "QUIZ TIMER",
    "battle.battle_log": "BATTLE LOG",
    "battle.command": "COMMAND",
    "battle.start_quiz_attack": "Start Quiz Attack",
    "battle.run": "Run",
    "battle.answer_controls": "Answer with 1, 2, 3 or click the command you want.",
    "battle.answer_reward":
      "Correct answers strike harder. Wrong answers or timeouts hand tempo to the foe.",
    "battle.banner_quiz_attack": "Quiz Attack",
    "battle.banner_quiz_streak": "Quiz Attack x{count}",
    "battle.wrong_support": "Wrong answer. The foe gets a clean punish window.",
    "battle.wrong_log":
      "{enemy} reads the mistake and answers with {move}. {player} takes {damage} damage.",
    "battle.correct_support":
      "Correct answer. Your ally keeps the initiative and presses forward.",
    "battle.correct_log":
      "{player} lands {move} for {damage} damage on {enemy}.",
    "battle.timeout_support": "Timer expired. The enemy seizes the tempo.",
    "battle.timeout_log":
      "{enemy} punishes the hesitation with {move}. {player} takes {damage} damage.",
    "battle.enemy_counter_log":
      "{enemy} answers with {move}. {player} takes {damage} damage.",
    "battle.fainted": "{name} fainted",
    "battle.quiz_move": "Quiz your move against {name}",
    "battle.send_in": "{name} steps in",
    "battle.opening_wild": "{name} blocks the path. {intro}",
    "battle.opening_trainer": "{label}: {name}. {intro}",
    "battle.enemy_status": "{name}  Lv {level}\nHP {hp}/{maxHp}\nParty {index}/{total}",
    "battle.player_status":
      "{name}  Lv {level}\nHP {hp}/{maxHp}\nParty {index}/{total}\nQuiz Move {move}",
    "battle.banner_too_slow": "Too Slow",
    "battle.banner_wrong_answer": "Wrong Answer",
    "battle.banner_perfect_answer": "Perfect Answer",
    "battle.banner_perfect_streak": "Perfect x{count}",
    "battle.banner_correct_answer": "Correct Answer",
    "battle.banner_correct_streak": "Quiz Streak x{count}",
    "battle.player_steps_in": "{name} takes the front slot for your team.",
    "battle.enemy_next_wild": "{fainted} fainted. Another wild creature lunges forward.",
    "battle.enemy_next_trainer": "{fainted} fainted. {name} steps into battle.",
    "battle.win_wild": "{name} fainted. The grass settles down.",
    "battle.win_trainer": "{name} fainted. The trainer's party is out of creatures.",
    "battle.victory": "Victory",
    "battle.defeat": "Defeat",
    "battle.retreat": "Retreat",
    "battle.won_default": "The battle is won. The route ahead feels earned.",
    "battle.lost_default": "Your team needs more training before the next challenge.",
    "battle.retreated_default": "You stepped out of the battle and returned to the overworld.",
    "party.title": "Buddy Party",
    "party.help":
      "Click owned buddies to add or remove them. Click a selected buddy to make it the lead.",
    "party.owned": "Owned",
    "party.selected": "Selected For Battle",
    "party.in_party": "[IN PARTY]",
    "party.owned_tag": "[OWNED]",
    "party.empty": "[Empty]",
    "party.slot": "Slot {slot}: {name}",
    "party.slot_lead": "Slot {slot}: {name}  [Lead]",
    "party.status":
      "Owned buddies: {owned}\nSelected buddies: {selected}/{required}\n{requirement}\nTip: click a selected buddy on the right to move it into the lead slot.",
    "party.requirement_full": "Choose exactly 3 buddies before leaving the menu.",
    "party.requirement_partial":
      "You only own {required} buddies right now, so your current team is smaller.",
    "party.confirm": "Press C or ESC to confirm and return to the overworld.",
    "party.block_close": "Pick {required} battle buddies before leaving the party menu."
  },
  zh: {
    "language.label": "语言",
    "difficulty.casual": "休闲",
    "difficulty.adventure": "冒险",
    "difficulty.heroic": "英勇",
    "app.login_title": "登录后开始冒险",
    "app.login_copy":
      "使用 Google 登录即可把名字保存到排行榜，或以游客身份继续并在本地游玩。",
    "app.google_sign_in": "使用 Google 登录",
    "app.google_missing": "需要先配置 Firebase 才能使用 Google 登录",
    "app.guest_continue": "以游客身份继续",
    "app.note_google": "本版本使用 Firebase Auth 处理 Google 登录。",
    "app.note_score": "排行榜分数会根据胜利、发现、拥有的伙伴以及剧情进度计算。",
    "app.note_remote": "只要你的 Firebase 项目允许 Firestore 读写，就会启用远程排行榜。",
    "app.note_local": "当前未配置 Firebase 环境变量，因此本版本会使用本地游客排行榜。",
    "app.top_trainers": "顶尖训练家",
    "app.signed_in_google": "已使用 Google 登录",
    "app.guest_mode": "游客模式：本地存档 + 本地排行榜",
    "app.leaderboard": "排行榜",
    "app.sign_out": "退出登录",
    "app.no_scores": "还没有分数，成为第一个上榜的训练家吧。",
    "app.row_meta": "{avatar} • {difficulty} • {victories}胜 • {discoveries}发现 • {owned}拥有",
    "app.google_failed": "无法完成 Google 登录。",
    "app.trainer_default": "训练家",
    "start.subtitle": "80年代掌机风冒险模式",
    "start.select_hero": "选择主角",
    "start.difficulty": "难度",
    "start.press_enter": "按 Enter 开始",
    "start.hint": "已选择 {avatar}。{storyTitle}。\n目标：{objective}\n路线：{route}",
    "story.blaze.title": "余烬之路",
    "story.blaze.card_subtitle": "追焰者",
    "story.blaze.objective_short": "追踪余烬信号。",
    "story.blaze.route": "苔谷镇 -> 翠幕林 -> 余烬哨峰 -> 炽渣采石场",
    "story.blaze.opening":
      "导师莉欧拉要你先证明自己，然后去追踪苔谷镇外、通往翠幕林的余烬信号。",
    "story.blaze.mystery":
      "古老的瞭望塔不断闪着橙色光芒，野生生物也被迫从下方的隐秘小径中逃出。",
    "story.blaze.mentor":
      "莉欧拉相信 Blaze 拥有罕见的勇气，但她也不断提醒：若太心急，线索会在真相出现前先被烧尽。",
    "story.mist.title": "银潮暗流",
    "story.mist.card_subtitle": "湖岸寻迹者",
    "story.mist.objective_short": "调查银澜湖水流。",
    "story.mist.route": "苔谷镇 -> 银澜湖 -> 渡口码头 -> 镜岛群",
    "story.mist.opening":
      "导师莉欧拉希望你先做好野外准备，然后去追查连接苔谷镇与银澜湖岸的奇异涟漪。",
    "story.mist.mystery":
      "湖面开始映照出天空中并不存在的光，而渡船路线也在真相查明前一直关闭。",
    "story.mist.mentor":
      "莉欧拉相信 Mist 能看到快节奏训练家容易错过的模式，尤其是在这个地区把答案藏进倒影与潮汐中的时候。",
    "story.grove.title": "林歌回响",
    "story.grove.card_subtitle": "森林倾听者",
    "story.grove.objective_short": "回应森林的警告。",
    "story.grove.route": "苔谷镇 -> 翠幕林 -> 隐秘林苑 -> 根须圣所",
    "story.grove.opening":
      "导师莉欧拉要你先完成第一场战斗，然后去追随土地的警告，从苔谷镇进入翠幕林与隐秘林苑。",
    "story.grove.mystery":
      "翠幕林的平衡正在失控，而 01 号路线外那片寂静的林苑更像是一座被封印的神殿。",
    "story.grove.mentor":
      "莉欧拉相信 Grove 与土地之间的直觉，但她也担心：若某个古老之物正在根系深处苏醒，仅靠共感并不足够。",
    "gameover.title": "游戏结束",
    "gameover.journey": "{avatar} 的旅程在 {route} 上暂时中断了。",
    "gameover.keep_profile": "你选择的主角与难度会被保留。\n队伍与路线进度会从开头重新开始。",
    "gameover.press_enter": "按 Enter 重新开始",
    "gameover.space_hint": "按空格也可以重新开始冒险。",
    "gameover.defeat_message":
      "你的战斗伙伴全部倒下了。重新整队、调整思路，再次挑战这片地区吧。",
    "overworld.marker_loot": "物资",
    "overworld.marker_clue": "线索",
    "overworld.marker_read": "阅读",
    "overworld.marker_exit": "出口",
    "overworld.marker_door": "门",
    "overworld.prompt_talk": "按 E 与 {name} 对话",
    "overworld.prompt_trainer_talk": "按 E 与 {trainerClass} {name} 对话",
    "overworld.prompt_challenge": "按 E 挑战 {trainerClass} {name}",
    "overworld.prompt_wild": "按 E 靠近 {name}",
    "overworld.wild_appears": "草丛摇动……{name} 出现了！",
    "overworld.joined_team_added": "{name} 加入了队伍，并被加入战斗伙伴。",
    "overworld.joined_team": "{name} 加入了队伍。按 C 打开队伍菜单，把它加入战斗伙伴。",
    "overworld.already_owned": "{name} 撤退了。你的队伍已经很熟悉这条路线。",
    "overworld.grass_settles": "{name} 撤退了。高草短暂恢复了平静。",
    "overworld.lose_training": "你的队伍还需要更多训练。去别的路线试试，或者再打一场。",
    "overworld.escape_field": "你脱离了战斗，回到了野外。",
    "overworld.arrived": "你已到达 {map}。{objective}",
    "overworld.status": "主角：{hero}\n领队：{lead}\n队伍：{party}/3\n拥有：{owned}\n胜利：{victories}\n发现：{discoveries}",
    "overworld.help_title": "野外指南",
    "overworld.help_body":
      "移动：方向键或 WASD\n互动：E\n队伍菜单：C\n帮助：H\n重置进度：R\n\n主角：{hero}\n领队伙伴：{lead}\n战斗伙伴：{party}/3\n已拥有伙伴：{owned}\n故事：{story}\n章节：{act}\n难度：{difficulty}\n\n目标：{goal}\n下一个地标：{nextLandmark}\n\n谜团：{mystery}\n\n莉欧拉的判断：{mentor}\n\n路线：{route}\n\n长线剧情：{arc}\n\n章节笔记：{chapterSummary}\n\n资源方向：已有 {mapCount} 张地图适合进行 CC0 优先的美术替换。",
    "overworld.hud_default":
      "移动：方向键/WASD。互动：E。队伍：C。帮助：H。重置：R。",
    "overworld.hud_exploring": "探索中：{map}。{zone}。{chapter}。目标：{objective}",
    "overworld.hud_controls": "移动：方向键/WASD。互动：E。队伍：C。{chapter}。目标：{objective}",
    "overworld.progress_reset": "进度已重置。苔谷镇恢复到初始状态。",
    "overworld.party_lead": "{name} 现在是你 {partySize} 人战斗小队的领队。",
    "overworld.lead_fallback": "领队伙伴",
    "story.blaze.long_arc":
      "Blaze 从苔谷镇的瞭望塔火光出发，逐渐发现那些余烬信号其实是一张通往阿斯特拉城堡旧道的伪装信号网。",
    "story.mist.long_arc":
      "Mist 从苔谷镇一路追踪到银澜湖的倒影光线，逐渐发现水路本身正在传递一段通往镜岛群的隐藏航线密码。",
    "story.grove.long_arc":
      "Grove 沿着森林的警告深入翠幕林与隐秘圣域，逐步揭开一场曾守护整片地区、如今正在失效的根系仪式。",
    "chapter.blaze.0.title": "第一幕 - 初燃火种",
    "chapter.blaze.0.objective":
      "击败导师莉欧拉，然后沿着 01 号路线的余烬信号前往翠幕林。",
    "chapter.blaze.0.objective_short": "击败莉欧拉并抵达翠幕林。",
    "chapter.blaze.0.next_landmark": "翠幕林",
    "chapter.blaze.0.summary":
      "Blaze 离开苔谷镇时像一名热血侦察员，坚信瞭望塔的火光正指向一条值得追逐的真正线索。",
    "chapter.blaze.1.title": "第二幕 - 山脊警报",
    "chapter.blaze.1.objective":
      "从翠幕林攀上余烬哨峰，击败守望队长布兰，并在痕迹消失前读取警报记录。",
    "chapter.blaze.1.objective_short": "抵达余烬哨峰。",
    "chapter.blaze.1.next_landmark": "余烬哨峰",
    "chapter.blaze.1.summary":
      "余烬信号汇聚成一套山脊警报网络，Blaze 必须学会解读信号，而不是一味追赶。",
    "chapter.blaze.2.title": "第三幕 - 炉心真相",
    "chapter.blaze.2.objective":
      "穿越炽渣采石场，击败炉卫索尔，并关闭那条为失落熔炉古道供能的伪信号。",
    "chapter.blaze.2.objective_short": "关闭采石场信号。",
    "chapter.blaze.2.next_landmark": "炽渣采石场",
    "chapter.blaze.2.summary":
      "火光并非灯塔，而是诱饵。Blaze 的道路变成了一场关于控制与精准的考验。",
    "chapter.mist.0.title": "第一幕 - 停航的渡口",
    "chapter.mist.0.objective":
      "击败导师莉欧拉，然后前往银澜湖岸调查渡船停航的原因。",
    "chapter.mist.0.objective_short": "抵达银澜湖岸。",
    "chapter.mist.0.next_landmark": "银澜湖岸",
    "chapter.mist.0.summary":
      "Mist 以观察者的姿态启程，追踪那些被别人当作普通倒影忽略掉的涟漪与光线。",
    "chapter.mist.1.title": "第二幕 - 渡船信号",
    "chapter.mist.1.objective":
      "在银澜渡口击败港务队长奈瑞丝，并从码头取回航线信标日志。",
    "chapter.mist.1.objective_short": "掌控银澜渡口。",
    "chapter.mist.1.next_landmark": "银澜渡口",
    "chapter.mist.1.summary":
      "被关闭的渡船航线在倒影中隐藏着一段信息，Mist 必须依靠潮汐、节奏与观察来解码。",
    "chapter.mist.2.title": "第三幕 - 镜岛群",
    "chapter.mist.2.objective":
      "前往镜岛群，击败潮读者塞尔，并解读那条为失落航路引路的反射水道。",
    "chapter.mist.2.objective_short": "解读镜岛群航线。",
    "chapter.mist.2.next_landmark": "镜岛群",
    "chapter.mist.2.summary":
      "原本零散的倒影其实是一套刻意安排的密码，而 Mist 将耐心变成重新绘制航线的钥匙。",
    "chapter.grove.0.title": "第一幕 - 森林警告",
    "chapter.grove.0.objective":
      "击败导师莉欧拉，然后沿着 01 号路线的警示进入翠幕林与隐秘林苑。",
    "chapter.grove.0.objective_short": "抵达隐秘林苑。",
    "chapter.grove.0.next_landmark": "隐秘林苑",
    "chapter.grove.0.summary":
      "Grove 离开苔谷镇时正倾听土地的声音，把寂静与枝叶的变化也当作线索。",
    "chapter.grove.1.title": "第二幕 - 根须圣所",
    "chapter.grove.1.objective":
      "穿过隐秘林苑，在根须圣所击败守护者萨伦，并查明森林结界为何正在衰弱。",
    "chapter.grove.1.objective_short": "抵达根须圣所。",
    "chapter.grove.1.next_landmark": "根须圣所",
    "chapter.grove.1.summary":
      "那些安静的岔路通往古老的守护仪式，而 Grove 必须先理解森林的记忆，才能阻止它彻底崩坏。",
    "chapter.grove.2.title": "第三幕 - 古老神殿",
    "chapter.grove.2.objective":
      "修复神殿道路，击败神殿守卫艾莱克斯，并平息那股在最古老根系下苏醒的力量。",
    "chapter.grove.2.objective_short": "修复古老神殿。",
    "chapter.grove.2.next_landmark": "古老神殿",
    "chapter.grove.2.summary":
      "Grove 的旅程变成了一场修复行动，在沉睡之力完全醒来之前，把对土地的信任化为实际行动。",
    "battle.wild_encounter": "野生遭遇",
    "battle.trainer_battle": "训练家对战",
    "battle.field_threat": "野外威胁",
    "battle.tactical_duel": "战术对决",
    "battle.foe": "敌方",
    "battle.roaming_creature": "游荡生物",
    "battle.trainer_party": "训练家队伍",
    "battle.ally": "我方",
    "battle.team_lead": "队伍前锋",
    "battle.question": "问题",
    "battle.quiz_intro": "按“开始问答攻击”或点 Q 来显示当前问题。",
    "battle.quiz_support_wild": "野生题目考验节奏。答得越快，越能掌控局面。",
    "battle.quiz_support_trainer": "训练家对战更看重判断，犹豫会受到更重惩罚。",
    "battle.quiz_timer": "问答计时",
    "battle.battle_log": "战斗记录",
    "battle.command": "指令",
    "battle.start_quiz_attack": "开始问答攻击",
    "battle.run": "逃跑",
    "battle.answer_controls": "按 1、2、3 或点击你要选择的指令。",
    "battle.answer_reward": "答对会造成更强攻击。答错或超时会把节奏交给敌人。",
    "battle.banner_quiz_attack": "问答攻击",
    "battle.banner_quiz_streak": "问答攻击 x{count}",
    "battle.wrong_support": "回答错误。敌人获得了完整的反击窗口。",
    "battle.wrong_log": "{enemy} 看穿了失误，用 {move} 反击。{player} 受到了 {damage} 点伤害。",
    "battle.correct_support": "回答正确。我方保持主动并继续压制。",
    "battle.correct_log": "{player} 使用 {move} 命中 {enemy}，造成 {damage} 点伤害。",
    "battle.timeout_support": "时间到了。敌人夺走了节奏。",
    "battle.timeout_log": "{enemy} 利用你的迟疑使出 {move}。{player} 受到了 {damage} 点伤害。",
    "battle.enemy_counter_log": "{enemy} 使用 {move} 反击。{player} 受到了 {damage} 点伤害。",
    "battle.fainted": "{name} 倒下了",
    "battle.quiz_move": "用问答攻击对付 {name}",
    "battle.send_in": "{name} 上场了",
    "battle.opening_wild": "{name} 挡住了去路。{intro}",
    "battle.opening_trainer": "{label}：{name}。{intro}",
    "battle.enemy_status": "{name}  等级 {level}\nHP {hp}/{maxHp}\n队伍 {index}/{total}",
    "battle.player_status":
      "{name}  等级 {level}\nHP {hp}/{maxHp}\n队伍 {index}/{total}\n问答招式 {move}",
    "battle.banner_too_slow": "太慢了",
    "battle.banner_wrong_answer": "回答错误",
    "battle.banner_perfect_answer": "完美回答",
    "battle.banner_perfect_streak": "完美连击 x{count}",
    "battle.banner_correct_answer": "回答正确",
    "battle.banner_correct_streak": "问答连击 x{count}",
    "battle.player_steps_in": "{name} 顶到了队伍最前面。",
    "battle.enemy_next_wild": "{fainted} 倒下了。另一只野生生物立刻冲了上来。",
    "battle.enemy_next_trainer": "{fainted} 倒下了。{name} 上场继续战斗。",
    "battle.win_wild": "{name} 倒下了。草丛重新安静下来。",
    "battle.win_trainer": "{name} 倒下了。训练家的队伍已经没有可战斗的伙伴。",
    "battle.victory": "胜利",
    "battle.defeat": "失败",
    "battle.retreat": "撤退",
    "battle.won_default": "你赢下了战斗，前方道路更加清晰。",
    "battle.lost_default": "你的队伍还需要更多训练后再来挑战。",
    "battle.retreated_default": "你离开了战斗，回到了大地图。",
    "party.title": "伙伴队伍",
    "party.help": "点击已拥有的伙伴可加入或移出队伍。点击已选伙伴可将其设为领队。",
    "party.owned": "已拥有",
    "party.selected": "出战队伍",
    "party.in_party": "[队伍中]",
    "party.owned_tag": "[已拥有]",
    "party.empty": "[空位]",
    "party.slot": "槽位 {slot}: {name}",
    "party.slot_lead": "槽位 {slot}: {name}  [领队]",
    "party.status":
      "已拥有伙伴：{owned}\n已选伙伴：{selected}/{required}\n{requirement}\n提示：点击右侧已选伙伴可将其移动到领队位置。",
    "party.requirement_full": "离开菜单前请刚好选择 3 个伙伴。",
    "party.requirement_partial": "你目前只拥有 {required} 个伙伴，因此当前队伍规模会更小。",
    "party.confirm": "按 C 或 ESC 确认并返回大地图。",
    "party.block_close": "离开队伍菜单前，请先选择 {required} 个战斗伙伴。"
  },
  de: {
    "language.label": "Sprache",
    "difficulty.casual": "LOCKER",
    "difficulty.adventure": "ABENTEUER",
    "difficulty.heroic": "HELDENHAFT",
    "app.login_title": "Melde dich an und beginne dein Abenteuer",
    "app.login_copy":
      "Melde dich mit Google an, um deinen Namen in die Rangliste einzutragen, oder spiele lokal als Gast weiter.",
    "app.google_sign_in": "Mit Google anmelden",
    "app.google_missing": "Google-Anmeldung braucht eine Firebase-Konfiguration",
    "app.guest_continue": "Als Gast fortfahren",
    "app.note_google": "In diesem Build wird Firebase Auth fuer die Google-Anmeldung verwendet.",
    "app.note_score":
      "Die Ranglistenpunkte basieren auf Siegen, Entdeckungen, besessenen Gefaehrten und dem Story-Fortschritt.",
    "app.note_remote":
      "Die entfernte Rangliste ist aktiv, wenn dein Firebase-Projekt Firestore-Lese- und Schreibzugriffe erlaubt.",
    "app.note_local":
      "Firebase-Umgebungsvariablen fehlen, daher verwendet dieser Build eine lokale Gast-Rangliste.",
    "app.top_trainers": "Top-Trainer",
    "app.signed_in_google": "Mit Google angemeldet",
    "app.guest_mode": "Gastmodus mit lokalem Speicherstand und lokaler Rangliste",
    "app.leaderboard": "Rangliste",
    "app.sign_out": "Abmelden",
    "app.no_scores": "Noch keine Eintraege. Werde der erste Trainer auf dem Brett.",
    "app.row_meta":
      "{avatar} • {difficulty} • {victories} Siege • {discoveries} Entdeckungen • {owned} im Team",
    "app.google_failed": "Die Google-Anmeldung konnte nicht abgeschlossen werden.",
    "app.trainer_default": "Trainer",
    "start.subtitle": "Abenteuermodus im Stil eines Handhelds der 1980er",
    "start.select_hero": "HELD AUSWAEHLEN",
    "start.difficulty": "SCHWIERIGKEIT",
    "start.press_enter": "ENTER DRUECKEN ZUM START",
    "start.hint": "{avatar} gewaehlt. {storyTitle}.\nZiel: {objective}\nRoute: {route}",
    "story.blaze.title": "Der Glutpfad",
    "story.blaze.card_subtitle": "Glutjaeger",
    "story.blaze.objective_short": "Folge den Glutzeichen.",
    "story.blaze.route": "Mossgrove -> Verdantveil -> Ember Watch -> Cinder Quarry",
    "story.blaze.opening":
      "Mentorin Liora will erst einen Beweis deiner Staerke sehen, dann sollst du den Glutzeichen hinter Mossgrove bis nach Verdantveil folgen.",
    "story.blaze.mystery":
      "Ein alter Wachturm blinkt immer wieder orange, und wilde Kreaturen werden aus den verborgenen Pfaden darunter vertrieben.",
    "story.blaze.mentor":
      "Liora glaubt, dass Blaze aussergewoehnlichen Mut besitzt, warnt aber, dass Ungeduld die Hinweise verbrennen wird, bevor die Wahrheit sichtbar wird.",
    "story.mist.title": "Die Silberstroemung",
    "story.mist.card_subtitle": "Seensucher",
    "story.mist.objective_short": "Untersuche Silvermeres Stroemung.",
    "story.mist.route": "Mossgrove -> Silvermere -> Faehrenanleger -> Spiegelinseln",
    "story.mist.opening":
      "Mentorin Liora will dich fuer das Feld bereit sehen und erwartet dann, dass du den seltsamen Wellen zwischen Mossgrove und Silvermere folgst.",
    "story.mist.mystery":
      "Der See spiegelt Lichter, die gar nicht am Himmel stehen, und die Faehre bleibt geschlossen, bis jemand herausfindet warum.",
    "story.mist.mentor":
      "Liora vertraut darauf, dass Mist Muster erkennt, die schnellere Trainer uebersehen, besonders wenn die Region Antworten in Spiegelungen und Gezeiten versteckt.",
    "story.grove.title": "Lied des Hains",
    "story.grove.card_subtitle": "Waldlaeufer",
    "story.grove.objective_short": "Antworte auf die Warnung des Waldes.",
    "story.grove.route": "Mossgrove -> Verdantveil -> Verborgener Hain -> Wurzelheiligtum",
    "story.grove.opening":
      "Mentorin Liora will zuerst deinen ersten Kampf sehen, danach sollst du der Warnung des Landes von Mossgrove bis in Verdantveil und den Verborgenen Hain folgen.",
    "story.grove.mystery":
      "Das Gleichgewicht von Verdantveil kippt, und der stille Hain jenseits von Route 01 wirkt eher wie ein versiegeltes Heiligtum als wie ein einfacher Nebenpfad.",
    "story.grove.mentor":
      "Liora vertraut Groves Gespuer fuer das Land, fuerchtet aber, dass Mitgefuehl allein nicht reicht, wenn tief in den Wurzeln etwas Altes erwacht.",
    "gameover.title": "SPIEL VORBEI",
    "gameover.journey": "{avatar}s Reise geriet auf {route} ins Stocken.",
    "gameover.keep_profile":
      "Dein gewaehltet Held und die Schwierigkeit bleiben erhalten.\nTeam und Routenfortschritt beginnen erneut von vorn.",
    "gameover.press_enter": "ENTER DRUECKEN ZUM NEUSTART",
    "gameover.space_hint": "Leertaste startet das Abenteuer ebenfalls neu.",
    "gameover.defeat_message":
      "Deine Kampfgefaehrten wurden besiegt. Stelle dein Team neu auf und versuche die Region erneut.",
    "overworld.marker_loot": "BEUTE",
    "overworld.marker_clue": "SPUR",
    "overworld.marker_read": "LESEN",
    "overworld.marker_exit": "AUSGANG",
    "overworld.marker_door": "TUER",
    "overworld.prompt_talk": "Druecke E, um mit {name} zu sprechen",
    "overworld.prompt_trainer_talk":
      "Druecke E, um mit {trainerClass} {name} zu sprechen",
    "overworld.prompt_challenge":
      "Druecke E, um {trainerClass} {name} herauszufordern",
    "overworld.prompt_wild": "Druecke E, um dich {name} zu naehern",
    "overworld.wild_appears": "Wildes Rascheln... {name} erscheint!",
    "overworld.joined_team_added":
      "{name} ist deinem Team beigetreten und wurde zu deinen Kampfgefaehrten hinzugefuegt.",
    "overworld.joined_team":
      "{name} ist deinem Team beigetreten. Oeffne mit C das Teammenue, um es zu deinen Kampfgefaehrten hinzuzufuegen.",
    "overworld.already_owned":
      "{name} hat sich zurueckgezogen. Dein Team kennt diese Route bereits sehr gut.",
    "overworld.grass_settles":
      "{name} hat sich zurueckgezogen. Das hohe Gras kommt fuer einen Moment zur Ruhe.",
    "overworld.lose_training":
      "Dein Team braucht mehr Training. Versuche eine andere Route oder kaempfe erneut.",
    "overworld.escape_field": "Du bist aus dem Kampf entkommen und ins Feld zurueckgekehrt.",
    "overworld.arrived": "Du bist in {map} angekommen. {objective}",
    "overworld.status":
      "Held: {hero}\nAnfuehrer: {lead}\nTeam: {party}/3\nBesitz: {owned}\nSiege: {victories}\nEntdeckungen: {discoveries}",
    "overworld.help_title": "Feldhandbuch",
    "overworld.help_body":
      "Bewegen: Pfeiltasten oder WASD\nInteragieren: E\nTeammenue: C\nHilfe: H\nFortschritt zuruecksetzen: R\n\nHeld: {hero}\nAnfuehrender Gefaehrte: {lead}\nKampfgefaehrten: {party}/3\nBesessene Verbuendete: {owned}\nStory: {story}\nAkt: {act}\nSchwierigkeit: {difficulty}\n\nZiel: {goal}\nNaechster Orientierungspunkt: {nextLandmark}\n\nGeheimnis: {mystery}\n\nLioras Eindruck: {mentor}\n\nRoute: {route}\n\nLangbogen: {arc}\n\nKapitelnotiz: {chapterSummary}\n\nAsset-Richtung: {mapCount} Karten sind fuer einen CC0-orientierten Art-Swap bereit.",
    "overworld.hud_default":
      "Bewegen: Pfeiltasten/WASD. Interagieren: E. Team: C. Hilfe: H. Reset: R.",
    "overworld.hud_exploring":
      "Erkunde {map}. {zone}. {chapter}. Ziel: {objective}",
    "overworld.hud_controls":
      "Bewegen: Pfeiltasten/WASD. Interagieren: E. Team: C. {chapter}. Ziel: {objective}",
    "overworld.progress_reset":
      "Fortschritt zurueckgesetzt. Mossgrove Town ist wieder frisch.",
    "overworld.party_lead":
      "{name} fuehrt nun dein {partySize}-koepfiges Kampfteam an.",
    "overworld.lead_fallback": "Fuehrender Gefaehrte",
    "story.blaze.long_arc":
      "Blaze jagt zuerst einer einsamen Turmflamme aus Mossgrove hinterher und entdeckt dann, dass die Glutzeichen zu einem falschen Signalnetz gehoeren, das Richtung Astera-Zitadelle fuehrt.",
    "story.mist.long_arc":
      "Mist folgt einer Kette gespiegelteter Lichter von Mossgrove bis Silvermere und entdeckt, dass die Wasserwege selbst einen verborgenen Navigationscode zu den Spiegelinseln tragen.",
    "story.grove.long_arc":
      "Grove folgt der Warnung des Waldes durch Verdantveil bis in verborgene Heiligtuemer und deckt ein wurzelgebundenes Ritual auf, das die Region einst schuetzte.",
    "chapter.blaze.0.title": "Akt I - Der erste Funke",
    "chapter.blaze.0.objective":
      "Besiege Mentorin Liora und folge dann den Glutzeichen von Route 01 bis nach Verdantveil Glen.",
    "chapter.blaze.0.objective_short": "Besiege Liora und erreiche Verdantveil.",
    "chapter.blaze.0.next_landmark": "Verdantveil Glen",
    "chapter.blaze.0.summary":
      "Blaze verlaesst Mossgrove als hitzkoepfiger Spaeher und glaubt, dass die Turmflamme eine direkte Spur ist, die verfolgt werden muss.",
    "chapter.blaze.1.title": "Akt II - Alarm am Grat",
    "chapter.blaze.1.objective":
      "Steige von Verdantveil zum Ember Watch Peak auf, besiege Wachhauptmann Brann und lies die Alarmprotokolle, bevor die Spur kalt wird.",
    "chapter.blaze.1.objective_short": "Erreiche Ember Watch Peak.",
    "chapter.blaze.1.next_landmark": "Ember Watch Peak",
    "chapter.blaze.1.summary":
      "Die Glutzeichen verengen sich zu einem Alarmnetz auf dem Grat, und Blaze muss das Signal lesen statt ihm blind nachzujagen.",
    "chapter.blaze.2.title": "Akt III - Wahrheit der Schmelze",
    "chapter.blaze.2.objective":
      "Durchquere Cinder Quarry, besiege Ofenwaechter Sol und schalte das falsche Signal ab, das die verlorene Schmiedestrasse speist.",
    "chapter.blaze.2.objective_short": "Schalte das Quarry-Signal ab.",
    "chapter.blaze.2.next_landmark": "Cinder Quarry",
    "chapter.blaze.2.summary":
      "Die Flamme ist kein Leuchtfeuer, sondern ein Lockruf, und Blazes Weg wird an der Ofenlinie zur Pruefung von Kontrolle und Praezision.",
    "chapter.mist.0.title": "Akt I - Die geschlossene Faehre",
    "chapter.mist.0.objective":
      "Besiege Mentorin Liora und untersuche dann den Silvermere-Lake-Edge, um den Grund fuer die geschlossene Faehre zu finden.",
    "chapter.mist.0.objective_short": "Erreiche Silvermere Lake Edge.",
    "chapter.mist.0.next_landmark": "Silvermere Lake Edge",
    "chapter.mist.0.summary":
      "Mist beginnt als Beobachterin und folgt Wellen und Lichtmustern, die andere als harmlose Spiegelungen abtun.",
    "chapter.mist.1.title": "Akt II - Signal des Faehrmanns",
    "chapter.mist.1.objective":
      "Besiege Hafenhauptfrau Neris an der Silvermere-Faehre und hole das Signalprotokoll von den Docks.",
    "chapter.mist.1.objective_short": "Sichere die Silvermere-Faehre.",
    "chapter.mist.1.next_landmark": "Silvermere Ferry",
    "chapter.mist.1.summary":
      "Die geschlossene Route verbirgt eine Botschaft im reflektierten Licht, und Mist muss Bewegung, Gezeiten und Timing lesen statt rohe Kraft zu nutzen.",
    "chapter.mist.2.title": "Akt III - Spiegelinseln",
    "chapter.mist.2.objective":
      "Segle zu den Spiegelinseln, besiege Flutleserin Sel und entschluessle den reflektierten Kanal, der die verlorene Route fuehrt.",
    "chapter.mist.2.objective_short": "Entschluessle die Route der Spiegelinseln.",
    "chapter.mist.2.next_landmark": "Mirror Isles",
    "chapter.mist.2.summary":
      "Was wie verstreute Spiegelungen wirkt, wird als absichtlich gelegter Code erkennbar, und Mist macht Geduld zum Schluessel der Region.",
    "chapter.grove.0.title": "Akt I - Warnung des Waldes",
    "chapter.grove.0.objective":
      "Besiege Mentorin Liora und folge dann den Warnzeichen von Route 01 bis in Verdantveil Glen und den Verborgenen Hain.",
    "chapter.grove.0.objective_short": "Erreiche den Verborgenen Hain.",
    "chapter.grove.0.next_landmark": "Hidden Grove",
    "chapter.grove.0.summary":
      "Grove verlaesst Mossgrove und hoert darauf, was das Land zu sagen versucht, indem auch Stille und Bewegung zu Hinweisen werden.",
    "chapter.grove.1.title": "Akt II - Wurzelheiligtum",
    "chapter.grove.1.objective":
      "Reise durch den Verborgenen Hain, besiege Bewahrer Thalen im Wurzelheiligtum und finde heraus, warum die Waldwaechten schwinden.",
    "chapter.grove.1.objective_short": "Erreiche das Wurzelheiligtum.",
    "chapter.grove.1.next_landmark": "Root Sanctuary",
    "chapter.grove.1.summary":
      "Die stillen Nebenpfade fuehren zu alten Schutzriten, und Grove muss erst das Gedaechtnis des Waldes verstehen, bevor es ganz zerfaellt.",
    "chapter.grove.2.title": "Akt III - Der alte Schrein",
    "chapter.grove.2.objective":
      "Stelle den Schreinpfad wieder her, besiege Schreinwaechter Ilex und beruhige die Macht, die unter den aeltesten Wurzeln erwacht.",
    "chapter.grove.2.objective_short": "Stelle den alten Schrein wieder her.",
    "chapter.grove.2.next_landmark": "Old Shrine",
    "chapter.grove.2.summary":
      "Groves Reise wird zu einer Wiederherstellung der Ordnung, bevor die verborgene Kraft vollends erwacht.",
    "battle.wild_encounter": "Wilde Begegnung",
    "battle.trainer_battle": "Trainerkampf",
    "battle.field_threat": "FELDGEFAHR",
    "battle.tactical_duel": "TAKTISCHES DUELL",
    "battle.foe": "GEGNER",
    "battle.roaming_creature": "UMHERSTREIFENDE KREATUR",
    "battle.trainer_party": "TRAINERTEAM",
    "battle.ally": "VERBUENDETER",
    "battle.team_lead": "TEAMSPITZE",
    "battle.question": "FRAGE",
    "battle.quiz_intro": "Druecke START QUIZ ATTACK oder tippe Q, um die aktuelle Frage zu zeigen.",
    "battle.quiz_support_wild":
      "Wilde Fragen drehen sich um Tempo. Antworte schnell, um die Kontrolle zu behalten.",
    "battle.quiz_support_trainer":
      "Trainerduelle belohnen saubere Entscheidungen und bestrafen Zoegern haerter.",
    "battle.quiz_timer": "QUIZ-TIMER",
    "battle.battle_log": "KAMPFPROTOKOLL",
    "battle.command": "BEFEHL",
    "battle.start_quiz_attack": "Quiz-Angriff starten",
    "battle.run": "Fliehen",
    "battle.answer_controls": "Antworte mit 1, 2, 3 oder klicke auf den gewuenschten Befehl.",
    "battle.answer_reward":
      "Richtige Antworten treffen staerker. Falsche Antworten oder Zeitablauf geben dem Gegner das Tempo.",
    "battle.banner_quiz_attack": "Quiz-Angriff",
    "battle.banner_quiz_streak": "Quiz-Angriff x{count}",
    "battle.wrong_support": "Falsche Antwort. Der Gegner bekommt ein sauberes Straf-Fenster.",
    "battle.wrong_log":
      "{enemy} liest den Fehler und kontert mit {move}. {player} erleidet {damage} Schaden.",
    "battle.correct_support":
      "Richtige Antwort. Dein Verbuendeter behaelt die Initiative und drueckt nach vorn.",
    "battle.correct_log":
      "{player} trifft {enemy} mit {move} fuer {damage} Schaden.",
    "battle.timeout_support": "Zeit abgelaufen. Der Gegner uebernimmt das Tempo.",
    "battle.timeout_log":
      "{enemy} nutzt dein Zoegern mit {move} aus. {player} erleidet {damage} Schaden.",
    "battle.enemy_counter_log":
      "{enemy} kontert mit {move}. {player} erleidet {damage} Schaden.",
    "battle.fainted": "{name} ist besiegt",
    "battle.quiz_move": "Quiz deinen Zug gegen {name}",
    "battle.send_in": "{name} kommt ins Feld",
    "battle.opening_wild": "{name} versperrt den Weg. {intro}",
    "battle.opening_trainer": "{label}: {name}. {intro}",
    "battle.enemy_status": "{name}  Lv {level}\nKP {hp}/{maxHp}\nTeam {index}/{total}",
    "battle.player_status":
      "{name}  Lv {level}\nKP {hp}/{maxHp}\nTeam {index}/{total}\nQuiz-Zug {move}",
    "battle.banner_too_slow": "Zu langsam",
    "battle.banner_wrong_answer": "Falsche Antwort",
    "battle.banner_perfect_answer": "Perfekte Antwort",
    "battle.banner_perfect_streak": "Perfekt x{count}",
    "battle.banner_correct_answer": "Richtige Antwort",
    "battle.banner_correct_streak": "Quiz-Serie x{count}",
    "battle.player_steps_in": "{name} uebernimmt die Spitzenposition deines Teams.",
    "battle.enemy_next_wild": "{fainted} ist besiegt. Eine weitere wilde Kreatur stuermt nach vorn.",
    "battle.enemy_next_trainer": "{fainted} ist besiegt. {name} kommt in den Kampf.",
    "battle.win_wild": "{name} ist besiegt. Das Gras beruhigt sich wieder.",
    "battle.win_trainer": "{name} ist besiegt. Das Trainerteam hat keine Kreaturen mehr uebrig.",
    "battle.victory": "Sieg",
    "battle.defeat": "Niederlage",
    "battle.retreat": "Rueckzug",
    "battle.won_default": "Der Kampf ist gewonnen. Der Weg nach vorn fuehlt sich verdient an.",
    "battle.lost_default": "Dein Team braucht mehr Training vor der naechsten Herausforderung.",
    "battle.retreated_default":
      "Du hast den Kampf verlassen und bist in die Oberwelt zurueckgekehrt.",
    "party.title": "Gefaehrten-Team",
    "party.help":
      "Klicke auf besessene Gefaehrten, um sie hinzuzufuegen oder zu entfernen. Klicke auf einen gewaehlten Gefaehrten, um ihn an die Spitze zu setzen.",
    "party.owned": "Besitzt",
    "party.selected": "Fuer den Kampf gewaehlt",
    "party.in_party": "[IM TEAM]",
    "party.owned_tag": "[BESITZT]",
    "party.empty": "[Leer]",
    "party.slot": "Platz {slot}: {name}",
    "party.slot_lead": "Platz {slot}: {name}  [Anfuehrer]",
    "party.status":
      "Besessene Gefaehrten: {owned}\nGewaehlte Gefaehrten: {selected}/{required}\n{requirement}\nTipp: Klicke rechts auf einen gewaehlten Gefaehrten, um ihn an die Spitze zu setzen.",
    "party.requirement_full": "Waehle genau 3 Gefaehrten, bevor du das Menue verlaesst.",
    "party.requirement_partial":
      "Du besitzt aktuell nur {required} Gefaehrten, daher ist dein Team im Moment kleiner.",
    "party.confirm": "Druecke C oder ESC zum Bestaetigen und zur Rueckkehr in die Oberwelt.",
    "party.block_close":
      "Waehle {required} Kampfgefaehrten, bevor du das Teammenue verlaesst."
  }
};

let currentLanguage: SupportedLanguage = loadLanguage();

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function setCurrentLanguage(language: SupportedLanguage): void {
  currentLanguage = language;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return ["en", "zh", "de"];
}

export function getLanguageLabel(language: SupportedLanguage): string {
  return LANGUAGE_LABELS[language];
}

export function getTranslationKeys(language: SupportedLanguage = "en"): string[] {
  return Object.keys(TRANSLATIONS[language]);
}

export function t(
  key: string,
  variables: Record<string, string | number> = {},
  language = currentLanguage,
): string {
  const template =
    TRANSLATIONS[language][key] ??
    TRANSLATIONS.en[key] ??
    key;

  return Object.entries(variables).reduce(
    (message, [variable, value]) => message.split(`{${variable}}`).join(String(value)),
    template,
  );
}

export function getAvatarLabel(avatar: PlayerAvatar): string {
  return avatar.toUpperCase();
}

export function getDifficultyLabel(
  difficulty: GameDifficulty,
  language = currentLanguage,
): string {
  return t(`difficulty.${difficulty}`, {}, language);
}

export function getLocalizedStorySurface(
  avatar: PlayerAvatar,
  language = currentLanguage,
): {
  storyTitle: string;
  cardSubtitle: string;
  objectiveShort: string;
  routeLabel: string;
  openingMessage: string;
  regionalMystery: string;
  mentorHook: string;
  longArc: string;
} {
  return {
    storyTitle: t(`story.${avatar}.title`, {}, language),
    cardSubtitle: t(`story.${avatar}.card_subtitle`, {}, language),
    objectiveShort: t(`story.${avatar}.objective_short`, {}, language),
    routeLabel: t(`story.${avatar}.route`, {}, language),
    openingMessage: t(`story.${avatar}.opening`, {}, language),
    regionalMystery: t(`story.${avatar}.mystery`, {}, language),
    mentorHook: t(`story.${avatar}.mentor`, {}, language),
    longArc: t(`story.${avatar}.long_arc`, {}, language),
  };
}

export function getLocalizedStoryStatus(
  state: Pick<WorldState, "selectedAvatar" | "defeatedBattles" | "currentMapId">,
  language = currentLanguage,
): {
  actLabel: string;
  chapterTitle: string;
  currentObjective: string;
  objectiveShort: string;
  nextLandmark: string;
  chapterSummary: string;
  routeLabel: string;
} {
  const status = getStoryStatus(state);
  const story = getStoryProfile(state.selectedAvatar);
  const chapterIndex = story.chapters.findIndex((chapter) => chapter.title === status.chapterTitle);
  const routePosition = story.routeMapIds.indexOf(state.currentMapId);
  const routeLabel = t(`story.${state.selectedAvatar}.route`, {}, language);

  if (chapterIndex < 0) {
    return {
      ...status,
      routeLabel:
        routePosition >= 0 ? `${routeLabel} (${routePosition + 1}/${story.routeMapIds.length})` : routeLabel,
    };
  }

  return {
    actLabel: t(`chapter.${state.selectedAvatar}.${chapterIndex}.title`, {}, language),
    chapterTitle: t(`chapter.${state.selectedAvatar}.${chapterIndex}.title`, {}, language),
    currentObjective: t(`chapter.${state.selectedAvatar}.${chapterIndex}.objective`, {}, language),
    objectiveShort: t(`chapter.${state.selectedAvatar}.${chapterIndex}.objective_short`, {}, language),
    nextLandmark: t(`chapter.${state.selectedAvatar}.${chapterIndex}.next_landmark`, {}, language),
    chapterSummary: t(`chapter.${state.selectedAvatar}.${chapterIndex}.summary`, {}, language),
    routeLabel:
      routePosition >= 0 ? `${routeLabel} (${routePosition + 1}/${story.routeMapIds.length})` : routeLabel,
  };
}

function loadLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "zh" || raw === "de" || raw === "en" ? raw : "en";
}
