import React, { useEffect, useState } from 'react';
import { generateStoryboardImage } from '../services/geminiService';
import { Loader2, RefreshCw, ImageOff } from 'lucide-react';

interface ImageCellProps {
  prompt: string;
  visualDescription: string;
  cutNumber: number;
}

const ImageCell: React.FC<ImageCellProps> = ({ prompt, visualDescription, cutNumber }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchImage = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await generateStoryboardImage(prompt);
      if (result) {
        setImageUrl(result);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Artificial staggered delay to avoid hitting rate limits instantly if many rows are rendered
    const timeout = setTimeout(() => {
      fetchImage();
    }, cutNumber * 800); 

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  if (loading) {
    return (
      <div className="w-full h-32 bg-slate-100 rounded-md flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <span className="text-xs">스케치 생성 중...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="w-full h-auto min-h-[128px] bg-slate-50 rounded-md flex flex-col items-center justify-center text-slate-400 p-2 border border-slate-200">
        <ImageOff className="w-6 h-6 mb-2 opacity-50" />
        <p className="text-xs text-center mb-2 line-clamp-3 italic text-slate-500">
          {visualDescription}
        </p>
        <button 
          onClick={fetchImage}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> 다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="group relative w-full overflow-hidden rounded-md border border-slate-200 shadow-sm bg-white">
      <img 
        src={imageUrl} 
        alt={`Cut ${cutNumber} Storyboard`} 
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="line-clamp-2">{visualDescription}</p>
      </div>
      <button 
        onClick={fetchImage}
        className="absolute top-2 right-2 bg-white/90 p-1 rounded-full text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 hover:bg-white shadow-sm"
        title="Regenerate Image"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ImageCell;