import React, { useState } from 'react';
import { generateStoryboardText } from './services/geminiService';
import { StoryboardResponse, LoadingState, StoryboardBrief } from './types';
import StoryboardTable from './components/StoryboardTable';
import { Clapperboard, Sparkles, AlertCircle, FileText, Users, Lightbulb, GitMerge, Clock, ShieldAlert, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [brief, setBrief] = useState<StoryboardBrief>({
    topic: '',
    purpose: '',
    targetAudience: '',
    keyConcepts: '',
    narrativeFlow: '',
    cutCount: '10~15컷 내외',
    constraints: '폭력적 표현 금지, 캐릭터 외형 유지',
    conceptSettings: ''
  });
  
  const [storyboardData, setStoryboardData] = useState<StoryboardResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof StoryboardBrief, value: string) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.topic.trim()) return;

    setLoadingState(LoadingState.GENERATING_TEXT);
    setErrorMsg(null);
    setStoryboardData(null);

    try {
      const data = await generateStoryboardText(brief);
      setStoryboardData(data);
      setLoadingState(LoadingState.COMPLETE);
    } catch (err) {
      console.error(err);
      setErrorMsg("스토리보드를 생성하는 도중 문제가 발생했습니다. API 키를 확인하거나 잠시 후 다시 시도해주세요.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const isFormValid = brief.topic.trim() !== '' && brief.purpose.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Clapperboard className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AI Storyboard Creator
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Google Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Input Section - Hidden when data exists to focus on result, but accessible if needed (could implement a 'back' or 'edit' button later) */}
        {!storyboardData ? (
          <section className="animate-fadeIn max-w-4xl mx-auto">
            <div className="mb-8 text-center space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                영상 제작을 위한 <span className="text-indigo-600">완벽한 콘티</span> 설계
              </h2>
              <p className="text-lg text-slate-600">
                콘텐츠 브리프를 작성하면 AI가 교육적 규칙과 서사를 반영한 정교한 스토리보드를 생성합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              
              <div className="p-6 md:p-8 space-y-6">
                
                {/* 1. Main Topic */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    주제 (Topic) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brief.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="예: 서울의 숨겨진 역사 유적 탐방 브이로그"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. Content Purpose */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> 콘텐츠의 목적
                    </label>
                    <textarea
                      value={brief.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      placeholder="학습자가 무엇을 이해해야 하는지, 어떤 상황에서 쓰이는지"
                      className="w-full p-3 h-24 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                  </div>

                  {/* 3. Target Audience */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Users className="w-4 h-4 text-indigo-500" /> 타깃 학습자 (난이도)
                    </label>
                    <textarea
                      value={brief.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      placeholder="예: 초등학교 3학년 수준, 시각적 비중 높이고 설명 단순화"
                      className="w-full p-3 h-24 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 4. Key Concepts */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Lightbulb className="w-4 h-4 text-indigo-500" /> 핵심 개념
                    </label>
                    <input
                      type="text"
                      value={brief.keyConcepts}
                      onChange={(e) => handleInputChange('keyConcepts', e.target.value)}
                      placeholder="각 컷이 전달해야 할 핵심 메시지"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>

                  {/* 5. Narrative Flow */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <GitMerge className="w-4 h-4 text-indigo-500" /> 서사 흐름
                    </label>
                    <input
                      type="text"
                      value={brief.narrativeFlow}
                      onChange={(e) => handleInputChange('narrativeFlow', e.target.value)}
                      placeholder="예: 도입 -> 문제제시 -> 개념설명 -> 예시 -> 정리"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 6. Cut Count */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Clock className="w-4 h-4 text-indigo-500" /> 컷 수 및 분량
                    </label>
                    <input
                      type="text"
                      value={brief.cutCount}
                      onChange={(e) => handleInputChange('cutCount', e.target.value)}
                      placeholder="예: 10~15컷, 2~3분 포맷"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>

                  {/* 7. Constraints */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-500" /> 제한 조건
                    </label>
                    <input
                      type="text"
                      value={brief.constraints}
                      onChange={(e) => handleInputChange('constraints', e.target.value)}
                      placeholder="과도한 창의성 제어, 캐릭터 변경 금지 등"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* 8. Concept Board (Text representation of PDF) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> 컨셉보드 / 캐릭터 설정
                  </label>
                  <div className="relative">
                    <textarea
                      value={brief.conceptSettings}
                      onChange={(e) => handleInputChange('conceptSettings', e.target.value)}
                      placeholder="첨부할 컨셉보드(PDF)의 내용을 텍스트로 요약해 주세요. (예: 주인공 '미나'는 노란색 후드티를 입은 10살 소녀, 호기심 많은 성격)"
                      className="w-full p-3 h-32 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">* PDF 파일의 내용을 여기에 상세히 적어주시면 AI가 반영합니다.</p>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
                   <button
                    type="submit"
                    disabled={loadingState === LoadingState.GENERATING_TEXT || !isFormValid}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transform hover:-translate-y-1"
                  >
                    {loadingState === LoadingState.GENERATING_TEXT ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>스토리보드 설계 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>AI 스토리보드 생성하기</span>
                      </>
                    )}
                  </button>
                  {!isFormValid && (
                     <p className="text-xs text-red-400 mt-2">주제와 콘텐츠 목적을 입력해주세요.</p>
                  )}
                </div>

              </div>
            </form>

            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-fadeIn text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-6">
             <button 
               onClick={() => setStoryboardData(null)}
               className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mb-4"
             >
               ← 새로운 브리프 작성하기
             </button>
             <StoryboardTable data={storyboardData} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;