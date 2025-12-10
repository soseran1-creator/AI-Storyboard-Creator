import React from 'react';
import { StoryboardResponse } from '../types';
import ImageCell from './ImageCell';
import { Film, FileVideo, Mic, Type as TextIcon, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import '../assets/fonts/NotoSansKR-Regular-normal.js'; // Commented out to prevent build errors on some platforms

interface StoryboardTableProps {
  data: StoryboardResponse;
}

const StoryboardTable: React.FC<StoryboardTableProps> = ({ data }) => {
  
  const handleExportPDF = () => {
    // Basic PDF export logic - Note: CJK characters often require custom fonts in jsPDF
    // This is a simplified placeholder for the action
    alert("PDF 내보내기 기능은 폰트 설정이 필요합니다. 현재 화면을 캡처하여 사용해주세요.");
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h2>
            <p className="text-slate-600">{data.synopsis}</p>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF (Beta)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="p-4 w-16 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                #
              </th>
              <th className="p-4 w-[30%] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4" /> 화면 내용 (Visual)
                </div>
              </th>
              <th className="p-4 w-[15%] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileVideo className="w-4 h-4" /> 소스 파일 (Source)
                </div>
              </th>
              <th className="p-4 w-[25%] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <TextIcon className="w-4 h-4" /> 자막 (Subtitle)
                </div>
              </th>
              <th className="p-4 w-[25%] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" /> 내레이션 (Audio)
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.cuts.map((cut) => (
              <tr key={cut.cutNumber} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="p-4 text-center align-top">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                    {cut.cutNumber}
                  </span>
                </td>
                <td className="p-4 align-top">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {cut.visualDescription}
                    </p>
                    {/* The Image Generation Component */}
                    <div className="mt-2">
                       <ImageCell 
                         prompt={cut.imagePrompt || cut.visualDescription} 
                         visualDescription={cut.visualDescription}
                         cutNumber={cut.cutNumber}
                       />
                    </div>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-mono break-all block w-full">
                    {cut.sourceFileName}
                  </code>
                </td>
                <td className="p-4 align-top">
                  <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-100 h-full">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium">
                      {cut.subtitles}
                    </p>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 h-full">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap italic leading-relaxed">
                      "{cut.narration}"
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoryboardTable;