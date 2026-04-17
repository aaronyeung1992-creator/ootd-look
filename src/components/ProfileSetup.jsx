/**
 * 人设设置引导组件
 * 5道题快速建立用户画像
 */
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { PROFILE_OPTIONS, saveProfile, getProfile, resetProfile } from '../services/profile';

const QUESTION_ORDER = ['gender', 'scene', 'body', 'colorStyle', 'habit'];

export default function ProfileSetup({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profile] = useState(() => getProfile());

  // 初始化已有答案
  useEffect(() => {
    if (profile.answers) {
      setAnswers(profile.answers);
    }
  }, [profile]);

  const currentKey = QUESTION_ORDER[currentStep];
  const currentQuestion = PROFILE_OPTIONS[currentKey];
  const isMulti = currentQuestion?.type === 'multi';
  const currentValue = answers[currentKey];

  const handleSelect = (optionId) => {
    if (isMulti) {
      // 多选
      const current = currentValue || [];
      const newValue = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setAnswers(prev => ({ ...prev, [currentKey]: newValue }));
    } else {
      // 单选，直接下一步
      setAnswers(prev => ({ ...prev, [currentKey]: optionId }));
      setTimeout(() => {
        if (currentStep < QUESTION_ORDER.length - 1) {
          setCurrentStep(prev => prev + 1);
        }
      }, 300);
    }
  };

  const isSelected = (optionId) => {
    if (isMulti) {
      return (currentValue || []).includes(optionId);
    }
    return currentValue === optionId;
  };

  const canProceed = () => {
    if (isMulti) {
      return (currentValue || []).length > 0;
    }
    return !!currentValue;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep < QUESTION_ORDER.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // 保存答案
    const finalAnswers = {
      ...profile,
      answers,
      completed: true,
    };
    saveProfile(finalAnswers);
    onComplete();
  };

  const handleSkip = () => {
    onClose();
  };

  const progress = ((currentStep + 1) / QUESTION_ORDER.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className="glass rounded-3xl w-full max-w-md mb-4 animate-slide-up overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-amber-300" />
            <h2 className="text-white font-semibold text-lg">让我更懂你</h2>
          </div>
          <p className="text-white/50 text-sm">回答几个问题，获得专属穿搭建议</p>

          {/* 进度条 */}
          <div className="mt-4 h-1 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/40 text-xs mt-2 text-right">
            {currentStep + 1} / {QUESTION_ORDER.length}
          </p>
        </div>

        {/* 问题内容 */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <h3 className="text-white font-medium text-base mb-1">
              {currentQuestion?.label}
            </h3>
            {isMulti && (
              <p className="text-white/40 text-xs">可多选</p>
            )}
          </div>

          {/* 选项列表 */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`w-full p-4 rounded-xl text-left transition-all active:scale-98 ${
                  isSelected(option.id)
                    ? 'bg-gradient-to-r from-amber-400/30 to-orange-400/30 border border-amber-400/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${isSelected(option.id) ? 'text-white' : 'text-white/80'}`}>
                      {option.label}
                    </p>
                    {option.desc && (
                      <p className="text-white/40 text-xs mt-0.5">{option.desc}</p>
                    )}
                  </div>
                  {isSelected(option.id) && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                      <Check size={14} className="text-black" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 底部导航 */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}

            {currentStep < QUESTION_ORDER.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex-1 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:opacity-90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                下一步
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`flex-1 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:opacity-90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                <Check size={18} />
                完成设置
              </button>
            )}
          </div>

          {/* 跳过提示 */}
          {currentStep === 0 && (
            <p className="text-white/30 text-xs text-center mt-3">
              稍后可在底部按钮重新设置
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
