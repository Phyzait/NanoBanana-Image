// constants.ts — NanoBanana Studio 配置

import type { ImageOptimizePreset, ImageModelConfig, OptimizeConfig } from './types';

export const APP_NAME = 'NanoBanana Studio';
export const APP_VERSION = '1.1.0';

// ── API 配置 ──────────────────────────────────────────────
export const DEFAULT_BASE_URL = 'https://api.ikuncode.cc';

export function normalizeBaseUrl(baseUrl?: string): string {
  return (baseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

// ── 双模型配置 ────────────────────────────────────────────
export const IMAGE_MODELS: ImageModelConfig[] = [
  {
    id: 'nano-banana',
    name: 'NanoBanana Pro',
    description: 'Gemini 3 Pro · 效果最佳 · 较慢',
    modelPath: '/v1beta/models/gemini-3-pro-image-preview:generateContent',
  },
  {
    id: 'nano-banana-2',
    name: 'NanoBanana 2',
    description: 'Gemini 3.1 Flash · 速度快 · 价格低',
    modelPath: '/v1beta/models/gemini-3.1-flash-image-preview:generateContent',
  },
];

// ── 默认优化 API 配置 ─────────────────────────────────────
export const DEFAULT_OPTIMIZE_CONFIG: OptimizeConfig = {
  baseUrl: 'https://api.ikuncode.cc/v1',
  apiKey: '',
  model: 'gemini-3-flash-preview',
};

// ── localStorage keys ─────────────────────────────────────
export const LS_API_KEY = 'nanoBananaApiKey';
export const LS_IMAGE_BASE_URL = 'nanoBananaImageBaseUrl';
export const LS_THEME = 'nanoBananaTheme';
export const LS_GALLERY = 'nanoBananaGallery';
export const LS_MODEL = 'nanoBananaModel';
export const LS_OPTIMIZE_CONFIG = 'nanoBananaOptimizeConfig';
export const LS_CONVERSATIONS = 'nanoBananaConversations';
export const LS_ACTIVE_CONV = 'nanoBananaActiveConv';

// ── 宽高比选项 ────────────────────────────────────────────
export const ASPECT_RATIOS = [
  '1:1', '16:9', '9:16', '4:3', '3:4',
  '3:2', '2:3', '21:9', '5:4', '4:5',
];

// ── 分辨率选项 ────────────────────────────────────────────
export const SIZE_OPTIONS = ['1K', '2K', '4K'];

// ── 8 种风格预设 ──────────────────────────────────────────
export const STYLE_PRESETS = [
  { id: 'none',    name: '无风格',   prefix: '' },
  { id: 'fashion', name: '时尚写真', prefix: '东亚年轻女性，时尚杂志风格，高对比度，都市背景，' },
  { id: 'fresh',   name: '清新文艺', prefix: '东亚年轻女性，清新温柔，自然光，文艺氛围，' },
  { id: 'street',  name: '街拍纪实', prefix: '街拍摄影风格，自然姿态，城市街道背景，纪实感，' },
  { id: 'ancient', name: '古风玄幻', prefix: '古风写真，华丽古装，发饰精致，玄幻古风背景，' },
  { id: 'daily',   name: '日常人像', prefix: '日常生活场景人像，自然表情，室内暖光，' },
  { id: 'cyber',   name: '赛博霓虹', prefix: '赛博朋克风格，霓虹灯光，暗黑科技感，城市夜景，' },
  { id: 'ootd',    name: '穿搭种草', prefix: '穿搭展示风格，全身搭配清晰可见，时尚感，' },
  { id: 'cinema',  name: '电影剧照', prefix: '电影剧照风格，浅景深，胶片质感，叙事感构图，' },
];

// ── 提示词优化指令 ────────────────────────────────────────

const BASE_OPTIMIZE_INSTRUCTION = `你是一位专业的 AI 绘画提示词工程师。用户会给你一段简短的图片描述，你需要将其扩展为详细的、适合 AI 图像生成的提示词。

要求：
1. 保留用户原意，不要偏离主题
2. 补充以下维度的描述（按需）：
   - 主体：外貌特征、表情、姿态
   - 服饰：具体款式、材质、颜色
   - 场景/背景：具体地点、环境氛围
   - 光影：光源方向、光影效果、色温
   - 构图：景别（特写/中景/全景）、视角
   - 色调/氛围：整体色彩倾向、情绪氛围
   - 画质指令：如"超高清"、"细腻质感"等
3. 在末尾添加质量约束："无水印，无多余文字，画面干净，构图完整"
4. 输出 150-400 字的中文提示词
5. 仅输出优化后的提示词，不要输出其他内容

用户描述：`;

export const IMAGE_OPTIMIZE_PRESETS: ImageOptimizePreset[] = [
  {
    id: 'default',
    name: '通用',
    description: '全面补充主体、场景、光影、色调等维度',
    instruction: BASE_OPTIMIZE_INSTRUCTION,
  },
  {
    id: 'fashion',
    name: '时尚写真',
    description: '时尚杂志感、高对比、酷感、暗黑清新混搭',
    instruction: `你是一位专业的 AI 绘画提示词工程师，擅长中文结构化时尚写真风格。用户会给你一段简短的图片描述，你需要将其扩展为详细的结构化提示词。

输出必须严格按以下结构，逐行填充，未指定的维度自动补全：
- 主体：东亚年轻[女性/少女]，年龄约[16-25]岁，[发型描述：颜色+长度+造型]，发丝[质感描述]
- 面部特征：[肤色色调]白皙肤色，[眼睛颜色]眼眸，眼神[情绪描述]，嘴唇为[颜色]色，表情[神态]
- 服饰：[外套描述：颜色+材质+剪裁+装饰细节]；内搭[内搭描述]；颈部佩戴[首饰]；[鞋子描述]
- 姿态：[坐姿/站姿/倚靠]，[手部位置]，身体[朝向/角度]，姿态[氛围词]
- 背景：[纯色/渐变/场景]背景，[有无装饰元素]，突出[强调重点]
- 色彩：主色调为[3-5个颜色]，色彩对比[描述]，整体色调[氛围]
- 光影：[光源方向+类型]打光，突出[质感重点]，阴影过渡[描述]，增强[效果]
- 构图：[竖版/横版][景别]构图，人物为视觉中心，聚焦于[重点部位]，背景[处理方式]
- 氛围：整体氛围[2-3个氛围关键词]，风格[总结]

要求：
1. 保留用户原意，不要偏离主题
2. 人物必须是中国面孔/东方五官，优先中国场景和中式元素
3. 色调优先使用中国传统色名（朱红、靛蓝、月白、鹅黄、黛绿、藕粉、琥珀、墨色）
4. 末尾添加：超高清，最高画质，细腻渲染，丰富细节，无水印，无多余文字，画面干净，构图完整
5. 输出 150-500 字中文，仅输出优化后的提示词

用户描述：`,
  },
  {
    id: 'fresh',
    name: '清新文艺',
    description: '日系写真、窗边光影、温柔氛围、文艺清新',
    instruction: `你是一位专业的 AI 绘画提示词工程师，擅长中文温柔清新日系风格。用户会给你一段简短的图片描述，你需要将其扩展为详细的结构化提示词。

输出必须严格按以下结构，逐行填充，未指定的维度自动补全：
- 主体：东亚年轻女性，年龄约[18-25]岁，[发色][发型描述]，[发饰细节]
- 面部特征：暖调白皙肤色，脸颊带有[腮红描述]，[眼睛颜色]眼眸，眼神[情绪]，嘴唇为[颜色]色，表情[神态]
- 服饰：[外搭描述]，内搭[内搭描述]；[首饰1]，[首饰2]
- 姿态：[姿态描述]，头部[朝向]，姿态自然放松，发丝[动态描述]
- 环境：[室内/室外][具体场景]，背景为[模糊元素描述]，光线从[方向]透入，在人物[部位]形成[光影效果]，整体氛围[描述]
- 色彩：主色调为[4-5个颜色]，色彩对比[柔和/鲜明]且充满[氛围]感
- 光影：柔和的[方向]自然光打光，突出[质感重点]，面部光影变化增强[氛围]
- 构图：[方向][景别]构图，人物为视觉中心，聚焦于[重点]，背景[元素]强化[氛围]
- 氛围：整体氛围充满[核心氛围词]，兼具[风格A]与[风格B]

要求：
1. 保留用户原意，不要偏离主题
2. 人物必须是中国面孔/东方五官
3. 场景优先中式环境（茶室、书房、园林窗边）
4. 末尾添加：超高清，最高画质，细腻渲染，丰富细节，无水印，无多余文字，画面干净，构图完整
5. 输出 150-500 字中文，仅输出优化后的提示词

用户描述：`,
  },
  {
    id: 'street',
    name: '街拍纪实',
    description: '街拍、咖啡馆、户外、纪实感、自然抓拍（英文输出）',
    instruction: `You are an expert AI image prompt engineer specializing in street photography and candid documentary style. The user will give you a brief image description (possibly in Chinese). Expand it into a detailed English prompt.

Output must follow this structure:
Photograph of a young Asian woman with [skin tone] skin and [hair description], wearing [top description] and [bottom description]. She is [pose/action] in/at [location], [gaze/expression description]. She has [accessories/shoes]. The background includes [2-3 background elements]. The [venue type] has [architectural/environmental details]. [Additional environmental elements] are visible in the background. The image has a [mood] feel.

Requirements:
1. Preserve the user's original intent
2. Subject must be Asian/Chinese features
3. Prioritize Chinese urban scenes: Beijing hutongs, Shanghai lanes, Chinese cafés, markets
4. Add quality tags at the end: ultra HD, highest quality, detailed rendering, photorealistic, no watermark, clean composition, correct anatomy
5. Output 80-250 words in English, output ONLY the optimized prompt

User description: `,
  },
  {
    id: 'ancient',
    name: '古风玄幻',
    description: '古装、玄幻、华丽发饰、仙侠、国风',
    instruction: `你是一位专业的 AI 绘画提示词工程师，擅长中文古风玄幻写真风格。用户会给你一段简短的图片描述，你需要将其扩展为详细的古风提示词。

输出必须严格按以下结构，将用户要素填入槽位：
[构图]构图，[镜头距离]，[写真类型]，逼真，[肤色]，[发型描述：颜色+蓬松度+造型名称]，[光线下的肌肤效果]，[神态气质2-3词]，华丽古装，[发饰描述：步摇/流苏/簪子/宝石链]，[风格定位]，[色彩基调]，[肤色强调]。[光影描述2-3组]，[拍摄姿势]，超高清，[气质词]，最高画质，细腻渲染，[肤色]，细节五官。丰富细节，[气质词]，[肌肤质感3-4词]，高清32k，面部阴影，面部聚焦，[氛围词]，高质量，写实逼真，有质感，细腻肌理

古风元素词库（按需选用）：
- 发型: 飞仙髻、堕马髻、抛家髻、双环望仙髻、凌云髻、百合髻、反绾髻
- 发饰: 步摇、流苏、凤冠、珠钗、玉簪、宝石链、金丝绕、花钿
- 服饰风格: 玄幻古风、仙侠、唐风、汉服、旗装、宫廷
- 色调: 米黄青绿渐变、朱砂红金、水墨黑白、藕粉鹅黄、冰蓝银白
- 氛围: 空灵感、仙气飘飘、清冷出尘、端庄华贵、妖娆魅惑

要求：
1. 保留用户原意，不要偏离主题
2. 人物必须是中国面孔/东方五官，冷白皮
3. 必须包含明确的光影描述和氛围词
4. 末尾必须有：无水印，无多余文字，画面干净，构图完整
5. 输出 150-500 字中文，仅输出优化后的提示词

用户描述：`,
  },
  {
    id: 'daily',
    name: '日常人像',
    description: '教室、办公室、生活场景、穿搭展示（英文输出）',
    instruction: `You are an expert AI image prompt engineer specializing in daily life portrait photography. The user will give you a brief image description (possibly in Chinese). Expand it into a detailed English prompt.

Output must follow this structure:
Photograph of a young Asian woman with [hair description], wearing [top with details] and [bottom]. She [pose] in a [setting]-like setting, [hand gesture/action]. [Optional decorative element]. In the background, there is [background element 1], [background element 2], and [background element 3]. The room has [wall color] walls and a [atmosphere description].

Requirements:
1. Preserve the user's original intent
2. Subject must be Asian/Chinese features
3. Prioritize Chinese daily settings: Chinese campus, classroom, office, home
4. Add quality tags: ultra HD, highest quality, detailed rendering, photorealistic, no watermark, clean composition
5. Output 80-250 words in English, output ONLY the optimized prompt

User description: `,
  },
  {
    id: 'cyber',
    name: '赛博霓虹',
    description: '赛博朋克、霓虹、暗黑、未来感',
    instruction: `你是一位专业的 AI 绘画提示词工程师，擅长赛博朋克暗黑风格。用户会给你一段简短的图片描述，你需要将其扩展为详细的结构化提示词。

输出必须严格按以下结构，逐行填充，未指定的维度自动补全：
- 主体：东亚年轻女性，年龄约[18-25]岁，[发色：银白/渐变/荧光]+[发型]，发丝带有[光泽/荧光效果]
- 面部特征：[冷白/苍白]肤色，[眼睛特效：异瞳/荧光/机械]，[面部装饰：电子纹身/荧光妆容]
- 服饰：[科技感服饰描述：PVC/皮革/金属扣件/LED装饰]；[配件：赛博护目镜/机械臂环/全息项链]
- 姿态：[姿态描述]，[科技感互动元素：全息屏/光剑/数据流]
- 环境：[赛博城市场景]，背景[霓虹/全息广告/雨夜]，[环境光效]
- 色彩：主色调为[霓虹粉/电光蓝/荧光紫/暗黑]，[对比描述]
- 光影：[霓虹灯光/冷色调光源]，[反射/折射效果]，[阴影浓重]
- 构图：[景别]构图，[视角：仰拍/低角度]，[景深效果]
- 氛围：赛博朋克+[副氛围词]，科技感与[对比元素]交织

要求：
1. 保留用户原意，不要偏离主题
2. 人物必须是中国面孔/东方五官
3. 场景优先中国赛博城市（重庆夜景、香港霓虹、上海外滩）
4. 末尾添加：超高清，最高画质，细腻渲染，丰富细节，无水印，无多余文字，画面干净，构图完整
5. 输出 150-500 字中文，仅输出优化后的提示词

用户描述：`,
  },
  {
    id: 'ootd',
    name: '穿搭种草',
    description: '小红书穿搭 OOTD、种草、氛围感、生活感',
    instruction: `你是一位专业的 AI 绘画提示词工程师，擅长小红书穿搭种草风格。用户会给你一段简短的图片描述，你需要将其扩展为详细的穿搭展示提示词。

输出必须严格按以下结构：
[季节][风格]穿搭，东亚年轻女性，[身材描述]，[发型简述]。上身穿[上装品类+颜色+材质+设计亮点]，下身搭配[下装品类+颜色+版型]，脚踩[鞋子品类+颜色+细节]。配饰：[1-3件配饰]。在[场景]拍摄，[姿态]，[表情]。[光线描述]，[色调滤镜感]，清晰质感，穿搭细节可见，氛围感十足。

要求：
1. 保留用户原意，不要偏离主题
2. 人物必须是中国面孔/东方五官
3. 服饰优先新中式穿搭、国潮风格
4. 场景优先中式咖啡馆、新中式空间、中国都市街头
5. 末尾添加：超高清，最高画质，细腻渲染，丰富细节，无水印，无多余文字，画面干净，构图完整
6. 输出 150-500 字中文，仅输出优化后的提示词

用户描述：`,
  },
  {
    id: 'cinema',
    name: '电影剧照',
    description: '电影质感、叙事性、戏剧光影、故事感（英文输出）',
    instruction: `You are an expert AI image prompt engineer specializing in cinematic still photography. The user will give you a brief image description (possibly in Chinese). Expand it into a detailed English cinematic prompt.

Output must follow this structure:
Cinematic still of a young Asian woman, [age], [hair and appearance]. She wears [outfit with cinematic detail]. [Action/pose in narrative context]. The scene is set in [dramatic location]. [Cinematic lighting description: key light, fill, rim]. The color palette is [2-3 tones], creating a [mood] atmosphere. Shot on [camera/lens], [film stock reference], [depth of field]. The composition follows [rule], with [foreground/background elements creating depth]. [Overall cinematic quality descriptors].

Requirements:
1. Preserve the user's original intent
2. Subject must be Asian/Chinese features
3. Prioritize Chinese cinematic settings: rain-slicked Chinese alleys, lantern-lit streets, neon-lit Chinese cities
4. Add quality tags: 4K cinematic quality, film grain, masterful composition, no watermark, clean composition, correct anatomy
5. Output 80-250 words in English, output ONLY the optimized prompt

User description: `,
  },
];
