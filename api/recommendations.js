/**
 * 游戏推荐系统API
 * 基于用户行为和偏好提供个性化游戏推荐
 */

// 模拟数据库
const gameDatabase = {
  // 游戏类别
  categories: {
    'puzzle': ['2048-local', 'memory-local'],
    'strategy': ['tictactoe-local'],
    'action': ['snake-local', 'poor-bunny'],
    'racing': ['race'],
    'sports': ['soccer'],
    'adventure': ['dragon', 'parkour'],
    'music': ['beat'],
    'simulation': ['robot', 'space', 'royal']
  },
  
  // 游戏相似度矩阵（简化版）
  similarity: {
    'snake-local': ['poor-bunny', 'parkour'],
    '2048-local': ['memory-local', 'puzzle'],
    'memory-local': ['2048-local', 'puzzle'],
    'tictactoe-local': ['chess', 'puzzle'],
    'poor-bunny': ['snake-local', 'parkour'],
    'race': ['soccer', 'parkour'],
    'puzzle': ['2048-local', 'memory-local'],
    'soccer': ['race'],
    'robot': ['space', 'dragon'],
    'dragon': ['robot', 'royal'],
    'beat': ['ghost', 'ocean'],
    'ghost': ['beat', 'ocean'],
    'ocean': ['ghost', 'space'],
    'space': ['ocean', 'robot'],
    'royal': ['dragon'],
    'parkour': ['poor-bunny', 'race']
  }
};

/**
 * 获取基于内容的推荐
 * @param {string} gameKey - 当前游戏的键名
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} 推荐游戏列表
 */
function getContentBasedRecommendations(gameKey, limit = 3) {
  // 如果没有相似度数据，返回空数组
  if (!gameDatabase.similarity[gameKey]) {
    return [];
  }
  
  // 返回相似游戏列表
  return gameDatabase.similarity[gameKey].slice(0, limit);
}

/**
 * 获取基于类别的推荐
 * @param {string} category - 游戏类别
 * @param {Array} excludeGames - 要排除的游戏列表
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} 推荐游戏列表
 */
function getCategoryBasedRecommendations(category, excludeGames = [], limit = 3) {
  // 如果没有该类别，返回空数组
  if (!gameDatabase.categories[category]) {
    return [];
  }
  
  // 过滤掉要排除的游戏
  const filteredGames = gameDatabase.categories[category].filter(
    game => !excludeGames.includes(game)
  );
  
  // 返回推荐游戏列表
  return filteredGames.slice(0, limit);
}

/**
 * 获取基于协同过滤的推荐（简化版）
 * @param {Array} playedGames - 用户已玩过的游戏列表
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} 推荐游戏列表
 */
function getCollaborativeRecommendations(playedGames = [], limit = 3) {
  // 如果用户没有玩过游戏，返回空数组
  if (playedGames.length === 0) {
    return [];
  }
  
  // 收集所有相似游戏
  const similarGames = [];
  playedGames.forEach(game => {
    if (gameDatabase.similarity[game]) {
      similarGames.push(...gameDatabase.similarity[game]);
    }
  });
  
  // 过滤掉已玩过的游戏
  const filteredGames = similarGames.filter(
    game => !playedGames.includes(game)
  );
  
  // 计算每个游戏的推荐频率
  const gameFrequency = {};
  filteredGames.forEach(game => {
    gameFrequency[game] = (gameFrequency[game] || 0) + 1;
  });
  
  // 按推荐频率排序
  const sortedGames = Object.keys(gameFrequency).sort(
    (a, b) => gameFrequency[b] - gameFrequency[a]
  );
  
  // 返回推荐游戏列表
  return sortedGames.slice(0, limit);
}

/**
 * 获取混合推荐
 * @param {Object} userData - 用户数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Array} 推荐游戏列表
 */
function getHybridRecommendations(userData, limit = 6) {
  const recommendations = [];
  
  // 如果用户最近玩过游戏，基于内容推荐
  if (userData.recentGame) {
    const contentBased = getContentBasedRecommendations(userData.recentGame, 2);
    recommendations.push(...contentBased);
  }
  
  // 如果用户有偏好类别，基于类别推荐
  if (userData.preferredCategory) {
    const categoryBased = getCategoryBasedRecommendations(
      userData.preferredCategory,
      userData.playedGames,
      2
    );
    recommendations.push(...categoryBased);
  }
  
  // 如果用户有游戏历史，基于协同过滤推荐
  if (userData.playedGames && userData.playedGames.length > 0) {
    const collaborativeBased = getCollaborativeRecommendations(
      userData.playedGames,
      2
    );
    recommendations.push(...collaborativeBased);
  }
  
  // 去重
  const uniqueRecommendations = [...new Set(recommendations)];
  
  // 返回推荐游戏列表
  return uniqueRecommendations.slice(0, limit);
}

// 导出API函数
module.exports = {
  getContentBasedRecommendations,
  getCategoryBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations
};