export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetType: 'total_sessions' | 'perfect_sessions' | 'unique_samples';
  targetCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'badge_cham_chi',
    title: 'Chăm Chỉ 🦉',
    description: 'Hoàn thành 5 lượt tập đọc bài',
    icon: '📚',
    targetType: 'total_sessions',
    targetCount: 5,
  },
  {
    id: 'badge_phat_am_chuan',
    title: 'Phát Âm Chuẩn 🌟',
    description: 'Đạt điểm chính xác 100% trong 3 bài đọc',
    icon: '🌟',
    targetType: 'perfect_sessions',
    targetCount: 3,
  },
  {
    id: 'badge_vua_danh_van',
    title: 'Vua Đánh Vần 👑',
    description: 'Đọc đúng cả 3 bài mẫu của ứng dụng',
    icon: '👑',
    targetType: 'unique_samples',
    targetCount: 3,
  },
];
