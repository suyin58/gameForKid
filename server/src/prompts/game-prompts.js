/**
 * 游戏生成Prompt模板
 *
 * 功能：
 * - 提供游戏生成的Prompt模板
 * - 支持不同类型的游戏
 * - 根据用户描述动态生成Prompt
 */

/**
 * 基础系统提示词
 */
const BASE_SYSTEM_PROMPT = `你是一个专业的儿童游戏开发者，擅长为6-12岁儿童创作有趣、安全、富有教育意义的网页小游戏。

【核心原则】
1. 简单易懂：游戏规则和操作必须简单直观，适合儿童理解
2. 色彩鲜艳：使用明亮的颜色和可爱的角色设计
3. 明确反馈：每次操作都有清晰的视觉反馈
4. 正向激励：多使用鼓励性的语言和奖励机制
5. 触摸友好：优先使用触摸操作，方便儿童手指点击

【技术要求】
- 使用纯HTML、CSS、JavaScript
- 所有代码必须在一个HTML文件中
- 不使用外部依赖库（除了字体、图片等CDN资源）
- 代码必须可以直接在浏览器中运行
- 使用语义化HTML，结构清晰
- CSS使用现代语法，支持移动端适配
- JavaScript代码要有注释，易于理解
- 优先使用触摸操作，方便儿童手指点击

【游戏结构】
1. 开始界面：游戏标题、玩法说明、开始按钮
2. 游戏界面：游戏区域、分数/进度显示、控制按钮
3. 结束界面：最终得分、重新开始按钮
4. 响应式设计：支持手机和平板设备`;

/**
 * 游戏类型特定的提示词
 */
const GAME_TYPE_PROMPTS = {
  casual: `【休闲游戏】
- 简单的点击、拖动或触摸操作
- 轻松愉快的氛围
- 适合碎片时间游玩`,

  education: `【教育游戏】
- 融入知识学习（数学、语言、科学等）
- 循序渐进的难度设计
- 即时的正确/错误反馈`,

  puzzle: `【益智游戏】
- 锻炼逻辑思维能力
- 清晰的目标和规则
- 提示功能帮助儿童过关`,

  sports: `【运动游戏】
- 模拟简单的体育活动
- 反应速度训练
- 鼓励身体协调`,

  adventure: `【冒险游戏】
- 简单的剧情或目标
- 探索和发现元素
- 收集和成就系统`,
};

/**
 * 游戏生成Prompt模板
 */
const GAME_GENERATION_TEMPLATE = `{SYSTEM_PROMPT}

{TYPE_PROMPT}

【用户描述】
{USER_DESCRIPTION}

【生成要求】
1. 根据用户描述创作游戏
2. 游戏必须完整可玩
3. 包含所有必要的HTML、CSS、JavaScript代码
4. 代码要有详细的中文注释
5. 界面要适合儿童（大按钮、鲜艳颜色、可爱图标）
6. 添加音效提示（使用Web Audio API生成简单音效）
7. 游戏要有明确的开始、进行、结束状态

【输出格式】
请直接输出完整的HTML代码，不要有任何解释或说明。代码必须以<!DOCTYPE html>开头。

代码结构示例：
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>游戏标题</title>
  <style>
    /* CSS样式 */
  </style>
</head>
<body>
  <!-- 游戏界面 -->
  <script>
    // 游戏逻辑
  </script>
</body>
</html>
\`\`\``;

/**
 * 游戏修改Prompt模板
 */
const GAME_MODIFY_TEMPLATE = `{SYSTEM_PROMPT}

【当前游戏代码】
\`\`\`html
{CURRENT_CODE}
\`\`\`

【用户修改要求】
{MODIFY_DESCRIPTION}

【修改要求】
1. 根据用户要求修改游戏
2. 保持原有代码结构和风格
3. 只修改必要的部分
4. 确保修改后游戏仍然完整可玩
5. 如果用户要求不明确，做出合理的假设

【输出格式】
请输出完整的修改后的HTML代码，不要有任何解释。代码必须以<!DOCTYPE html>开头。`;

/**
 * 构建游戏生成Prompt
 * @param {string} userDescription - 用户的游戏描述
 * @param {string} gameType - 游戏类型（casual/education/puzzle/sports/adventure）
 * @returns {string} 完整的Prompt
 */
function buildGeneratePrompt(userDescription, gameType = 'casual') {
  const typePrompt = GAME_TYPE_PROMPTS[gameType] || GAME_TYPE_PROMPTS.casual;

  return GAME_GENERATION_TEMPLATE
    .replace('{SYSTEM_PROMPT}', BASE_SYSTEM_PROMPT)
    .replace('{TYPE_PROMPT}', typePrompt)
    .replace('{USER_DESCRIPTION}', userDescription || '一个简单的儿童游戏');
}

/**
 * 构建游戏修改Prompt
 * @param {string} currentCode - 当前游戏代码
 * @param {string} modifyDescription - 修改要求
 * @returns {string} 完整的Prompt
 */
function buildModifyPrompt(currentCode, modifyDescription) {
  // 限制代码长度，避免超出Token限制
  const maxLength = 10000; // 约3000个token
  const truncatedCode = currentCode.length > maxLength
    ? currentCode.substring(0, maxLength) + '\n\n... (代码已截断，请根据现有代码修改)'
    : currentCode;

  return GAME_MODIFY_TEMPLATE
    .replace('{SYSTEM_PROMPT}', BASE_SYSTEM_PROMPT)
    .replace('{CURRENT_CODE}', truncatedCode)
    .replace('{MODIFY_DESCRIPTION}', modifyDescription);
}

/**
 * 生成游戏标题建议
 * @param {string} userDescription - 用户描述
 * @returns {string} 游戏标题
 */
function suggestGameTitle(userDescription) {
  // 简单的标题生成逻辑
  const titles = [
    '欢乐大冒险',
    '趣味小游戏',
    '儿童乐园',
    '益智闯关',
    '快乐成长',
  ];

  // 根据描述关键词匹配
  if (userDescription.includes('跳') || userDescription.includes('跃')) {
    return '跳跃小游戏';
  }
  if (userDescription.includes('算') || userDescription.includes('数') || userDescription.includes('计算')) {
    return '数学小游戏';
  }
  if (userDescription.includes('记忆') || userDescription.includes('记')) {
    return '记忆小游戏';
  }

  return titles[Math.floor(Math.random() * titles.length)];
}

module.exports = {
  BASE_SYSTEM_PROMPT,
  GAME_TYPE_PROMPTS,
  GAME_GENERATION_TEMPLATE,
  GAME_MODIFY_TEMPLATE,
  buildGeneratePrompt,
  buildModifyPrompt,
  suggestGameTitle,
};
