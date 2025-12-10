import React, { useState, useEffect } from 'react';
import { generateStoryboardText } from './services/geminiService';
import { StoryboardResponse, LoadingState, StoryboardBrief } from './types';
import StoryboardTable from './components/StoryboardTable';
import { Clapperboard, Sparkles, AlertCircle, FileText, Users, Lightbulb, GitMerge, Clock, ShieldAlert, Image as ImageIcon, KeyRound, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);

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

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Check if running in AI Studio environment with helper
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          // Fallback: If not in AI Studio, check if API_KEY is already injected in env
          // This prevents auto-skipping the gate if the key is missing on Vercel
          if (process.env.API_KEY) {
            setHasApiKey(true);
          } else {
            setHasApiKey(false);
          }
        }
      } catch (err) {
        console.error("Error checking API key:", err);
        setHasApiKey(false);
      } finally {
        setCheckingKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleConnectApiKey = async () => {
    // Check if the AI Studio helper exists
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful if openSelectKey resolves
        // In a real scenario, we might want to re-verify or force a reload
        setHasApiKey(true);
      } catch (error) {
        console.error("Failed to select API key", error);
        setErrorMsg("API Key selection failed. Please try again.");
      }
    } else {
      // Fallback for environments where window.aistudio is missing (e.g. Vercel)
      alert("AI Studio environment not detected. The external key picker is only available in Google AI Studio/IDX. If you are on Vercel, please set the API_KEY environment variable.");
    }
  };

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
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         setErrorMsg("API Key가 유효하지 않습니다. 다시 키를 선택해주세요.");
         setHasApiKey(false); // Reset key state to force re-selection
      } else {
         setErrorMsg("스토리보드를 생성하는 도중 문제가 발생했습니다. API 키를 확인하거나 잠시 후 다시 시도해주세요.");
      }
      setLoadingState(LoadingState.ERROR);
    }
  };

  const isFormValid = brief.topic.trim() !== '' && brief.purpose.trim() !== '';

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // API Key Selection Gate
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6 animate-fadeIn">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <KeyRound className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">API Key 연결 필요</h1>
            <p className="text-slate-600">
              AI Storyboard Creator를 사용하려면 Google Cloud 프로젝트의 API Key가 필요합니다.
            </p>
          </div>
          
          <button
            onClick={handleConnectApiKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-5 h-5" />
            API Key 연결하기
          </button>
          
          <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 hover:text-indigo-500 transition-colors">
               <ExternalLink className="w-3 h-3" /> API 비용 및 결제 관련 문서 보기
             </a>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
              Powered by Google Gemini 2.5
            </div>
            {/* Allow re-selecting key if needed */}
            <button 
              onClick={handleConnectApiKey} 
              className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              title="Change API Key"
            >
              <KeyRound className="w-3 h-3" /> 설정
            </button>
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