import React, { useState } from 'react';
import { generateStoryboardImage } from '../services/geminiService';
import { Loader2, RefreshCw, ImagePlus, PenLine, Check } from 'lucide-react';

interface ImageCellProps {
  prompt: string;
  visualDescription: string;
  cutNumber: number;
  onUpdatePrompt: (newPrompt: string) => void;
}

const ImageCell: React.FC<ImageCellProps> = ({ prompt, visualDescription, cutNumber, onUpdatePrompt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  
  // State to toggle between Prompt View and Image View
  const [showPromptEdit, setShowPromptEdit] = useState<boolean>(true);

  const fetchImage = async () => {
    setLoading(true);
    setError(false);
    setShowPromptEdit(false); // Hide prompt editor while loading
    
    try {
      const result = await generateStoryboardImage(prompt);
      if (result) {
        setImageUrl(result);
        setShowPromptEdit(false); // Show image
      } else {
        setError(true);
        setShowPromptEdit(true); // Revert to prompt edit on error
      }
    } catch (err) {
      setError(true);
      setShowPromptEdit(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdatePrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="w-full h-40 bg-slate-100 rounded-md flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
        <span className="text-xs font-medium text-slate-600">스케치 생성 중...</span>
      </div>
    );
  }

  // State 2: Prompt Edit & Generation Trigger (Default Initial State or after "Edit Prompt")
  if (showPromptEdit || !imageUrl) {
    return (
      <div className="w-full bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <PenLine className="w-3 h-3" />
          <span>이미지 프롬프트 (수정 가능)</span>
        </div>
        
        <textarea 
          value={prompt}
          onChange={handlePromptChange}
          className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-700"
          placeholder="이미지 생성을 위한 묘사를 작성하세요."
          rows={3}
        />
        
        <button 
          onClick={fetchImage}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {error ? <RefreshCw className="w-3 h-3" /> : <ImagePlus className="w-3 h-3" />}
          {error ? "다시 시도" : "스케치 생성"}
        </button>
        
        {error && (
          <p className="text-[10px] text-red-500 text-center">이미지 생성에 실패했습니다. 다시 시도해주세요.</p>
        )}
      </div>
    );
  }

  // State 3: Display Image
  return (
    <div className="group relative w-full overflow-hidden rounded-md border border-slate-200 shadow-sm bg-white">
      <img 
        src={imageUrl} 
        alt={`Cut ${cutNumber} Storyboard`} 
        className="w-full h-auto object-cover"
      />
      
      {/* Overlay Actions */}
      <div className="absolute top-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowPromptEdit(true)}
          className="bg-white/90 p-1.5 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-white shadow-md text-xs font-medium flex items-center gap-1"
          title="Edit Prompt & Regenerate"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="text-[10px] pr-1">수정/재생성</span>
        </button>
      </div>
    </div>
  );
};

export default ImageCell;