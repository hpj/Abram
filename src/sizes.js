export function responsive(height, standardHeight)
{
  standardHeight = standardHeight || 1130;

  height = (height * this.state.size.height) / standardHeight;

  return Math.round(height);
}

export const sizes = {
  windowMargin: 20,

  topBarHeight: 52,
  topBarMiniMargin: 5,
  topBarBigMargin: 15,

  badge: 12,
  navigationBar: 56,
  
  icon: 24,
  navigationBarButton: 44,

  inboxAvatar: 70,
  avatar: 38,

  bottomSheetHeaderHeight: 5
};