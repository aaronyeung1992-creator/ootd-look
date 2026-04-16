/**
 * Loading 动画组件
 */
export default function LoadingSpinner({ message = '正在获取今日天气…' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
      {/* 动态圆圈 */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
      </div>
      {/* 文字 */}
      <div className="text-center">
        <p className="text-white/90 text-lg font-medium text-shadow">{message}</p>
        <p className="text-white/50 text-sm mt-1">正在感受今日能量…</p>
      </div>
    </div>
  );
}
