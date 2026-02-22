// Utility functions for managing reward points (localStorage-based)

const REWARD_KEY = 'vinsaky_reward_points';
const REWARD_HISTORY_KEY = 'vinsaky_reward_history';
const LAST_LOGIN_BONUS_KEY = 'vinsaky_last_login_bonus';

// Reward level definitions
export const REWARD_LEVELS = [
  { name: 'Đồng', minPoints: 0, maxPoints: 99, color: '#cd7f32', icon: '🥉', gradient: 'linear-gradient(135deg, #cd7f32, #a0522d)' },
  { name: 'Bạc', minPoints: 100, maxPoints: 499, color: '#c0c0c0', icon: '🥈', gradient: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  { name: 'Vàng', minPoints: 500, maxPoints: 999, color: '#ffd700', icon: '🥇', gradient: 'linear-gradient(135deg, #ffd700, #ffb300)' },
  { name: 'Kim Cương', minPoints: 1000, maxPoints: Infinity, color: '#b9f2ff', icon: '💎', gradient: 'linear-gradient(135deg, #b9f2ff, #00bcd4)' },
];

// Points for different actions
export const POINT_VALUES = {
  DAILY_LOGIN: 5,
  VIEW_PRODUCT: 1,
  ADD_FAVORITE: 2,
  PROFILE_COMPLETE: 10,
  FIRST_VISIT: 20,
};

// Get stored data for a user
const getStoredData = (key, userId) => {
  try {
    const raw = localStorage.getItem(`${key}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredData = (key, userId, data) => {
  try {
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage error:', e);
  }
};

// Get total reward points
export const getRewardPoints = (userId) => {
  if (!userId) return 0;
  const data = getStoredData(REWARD_KEY, userId);
  return data?.total || 0;
};

// Add reward points with reason
export const addRewardPoints = (userId, points, reason) => {
  if (!userId || !points) return 0;
  
  // Update total
  const current = getStoredData(REWARD_KEY, userId) || { total: 0 };
  current.total = (current.total || 0) + points;
  setStoredData(REWARD_KEY, userId, current);

  // Add to history
  const history = getStoredData(REWARD_HISTORY_KEY, userId) || [];
  history.unshift({
    points,
    reason,
    timestamp: new Date().toISOString(),
  });
  // Keep only last 50 entries
  if (history.length > 50) history.splice(50);
  setStoredData(REWARD_HISTORY_KEY, userId, history);

  return current.total;
};

// Get reward history
export const getRewardHistory = (userId) => {
  if (!userId) return [];
  return getStoredData(REWARD_HISTORY_KEY, userId) || [];
};

// Get current reward level based on points
export const getRewardLevel = (points) => {
  for (let i = REWARD_LEVELS.length - 1; i >= 0; i--) {
    if (points >= REWARD_LEVELS[i].minPoints) {
      return REWARD_LEVELS[i];
    }
  }
  return REWARD_LEVELS[0];
};

// Get next reward level
export const getNextLevel = (points) => {
  const currentLevel = getRewardLevel(points);
  const currentIdx = REWARD_LEVELS.indexOf(currentLevel);
  if (currentIdx < REWARD_LEVELS.length - 1) {
    return REWARD_LEVELS[currentIdx + 1];
  }
  return null; // Already max level
};

// Calculate progress to next level (0-100%)
export const getLevelProgress = (points) => {
  const currentLevel = getRewardLevel(points);
  const nextLevel = getNextLevel(points);
  if (!nextLevel) return 100;
  
  const levelRange = nextLevel.minPoints - currentLevel.minPoints;
  const progress = points - currentLevel.minPoints;
  return Math.min(100, Math.round((progress / levelRange) * 100));
};

// Check and award daily login bonus
export const checkDailyLoginBonus = (userId) => {
  if (!userId) return { awarded: false, points: 0 };
  
  const today = new Date().toDateString();
  const lastBonus = localStorage.getItem(`${LAST_LOGIN_BONUS_KEY}_${userId}`);
  
  if (lastBonus === today) {
    return { awarded: false, points: 0 };
  }
  
  localStorage.setItem(`${LAST_LOGIN_BONUS_KEY}_${userId}`, today);
  const newTotal = addRewardPoints(userId, POINT_VALUES.DAILY_LOGIN, 'Đăng nhập hàng ngày');
  return { awarded: true, points: POINT_VALUES.DAILY_LOGIN, total: newTotal };
};

// Initialize first-visit bonus
export const checkFirstVisitBonus = (userId) => {
  if (!userId) return { awarded: false, points: 0 };
  
  const key = `vinsaky_first_visit_${userId}`;
  if (localStorage.getItem(key)) {
    return { awarded: false, points: 0 };
  }
  
  localStorage.setItem(key, 'true');
  const newTotal = addRewardPoints(userId, POINT_VALUES.FIRST_VISIT, 'Lần đầu truy cập hồ sơ');
  return { awarded: true, points: POINT_VALUES.FIRST_VISIT, total: newTotal };
};

// Format points nicely
export const formatPoints = (points) => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};
