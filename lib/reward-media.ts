import type { AchievementTier } from "@/lib/achievements";

const medalByTier: Record<AchievementTier, string> = {
  bronze: "/assets/rewards/medal-bronze.png",
  silver: "/assets/rewards/medal-silver.png",
  gold: "/assets/rewards/medal-gold.png",
  special: "/assets/rewards/trophy-gold.png",
};

const celebrationByTier: Record<AchievementTier, string> = {
  bronze: "/assets/rewards/reward-monkey-bronze.png",
  silver: "/assets/rewards/reward-monkey-silver.png",
  gold: "/assets/rewards/reward-monkey-gold.png",
  special: "/assets/rewards/reward-monkey-gold.png",
};

export function getRewardMedalIcon(tier: AchievementTier) {
  return medalByTier[tier] ?? medalByTier.bronze;
}

export function getRewardCelebrationArt(tier: AchievementTier) {
  return celebrationByTier[tier] ?? celebrationByTier.bronze;
}

export function getRewardTrophyIcon() {
  return "/assets/rewards/trophy-gold.png";
}
