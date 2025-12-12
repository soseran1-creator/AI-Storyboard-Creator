import React, { useRef, useState, useEffect } from 'react';
import { StoryboardResponse, StoryboardCut } from '../types';
import ImageCell from './ImageCell';
import { Film, FileVideo, Mic, Type as TextIcon, Download, Loader2, Edit, Check, PenLine } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StoryboardTableProps {
  data: StoryboardResponse;
  onUpdateCut: (cutIndex: number, field: keyof StoryboardCut, value: string) => void;
}

const StoryboardTable: React.FC<StoryboardTableProps> = ({ data, onUpdateCut }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Auto-resize textareas when content changes
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleExportPDF = async () => {
    if (isEditMode) {
      alert("수정 모드를 완료한 후 PDF를 다운로드해주세요.");
      return;
    }
    if (!containerRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = containerRef.current;
      
      // Use html2canvas to capture the DOM element
      // scale: 2 improves resolution for clearer text
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true, // Allow loading cross-origin images if needed
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Initialize PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`${data.title}_storyboard.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h2>
            <p className="text-slate-600 whitespace-pre-wrap">{data.synopsis}</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                isEditMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>수정 완료</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>내용 수정</span>
                </>
              )}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || isEditMode}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
              title={isEditMode ? "수정 완료 후 다운로드 가능합니다" : "PDF 다운로드"}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* This container is what gets captured for the PDF */}
      <div ref={containerRef} className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white p-4 md:p-8">
        {/* PDF Header (Only visible in PDF mostly, but good for context) */}
        <div className="mb-6 border-b border-slate-100 pb-4">
           <h1 className="text-3xl font-bold text-slate-900 mb-2">{data.title}</h1>
           <div className="flex gap-4 text-sm text-slate-500">
             <span>총 {data.cuts.length}컷</span>
             <span>•</span>
             <span>AI Storyboard Generated</span>
           </div>
        </div>

        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200 text-left">
              <th className="p-4 w-16 text-xs font-bold text-slate-600 uppercase tracking-wider text-center border-r border-slate-100">
                #
              </th>
              <th className="p-4 w-[35%] text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4" /> 화면 내용 (Visual)
                </div>
              </th>
              <th className="p-4 w-[15%] text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <FileVideo className="w-4 h-4" /> 소스 파일
                </div>
              </th>
              <th className="p-4 w-[25%] text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <TextIcon className="w-4 h-4" /> 자막 (Subtitle)
                </div>
              </th>
              <th className="p-4 w-[25%] text-xs font-bold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" /> 내레이션 (Audio)
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.cuts.map((cut, index) => (
              <tr key={cut.cutNumber} className="bg-white">
                <td className="p-4 text-center align-top border-r border-slate-100 bg-slate-50/30 font-bold text-slate-700">
                   {cut.cutNumber}
                </td>
                <td className="p-4 align-top border-r border-slate-100">
                  <div className="space-y-3">
                    {isEditMode ? (
                      <textarea
                        value={cut.visualDescription}
                        onChange={(e) => {
                          onUpdateCut(index, 'visualDescription', e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none overflow-hidden bg-slate-50"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                        {cut.visualDescription}
                      </p>
                    )}
                    
                    {/* The Image Generation Component */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                       <ImageCell 
                         prompt={cut.imagePrompt || cut.visualDescription} 
                         visualDescription={cut.visualDescription}
                         cutNumber={cut.cutNumber}
                         onUpdatePrompt={(newPrompt) => onUpdateCut(index, 'imagePrompt', newPrompt)}
                       />
                    </div>
                  </div>
                </td>
                <td className="p-4 align-top border-r border-slate-100">
                   {isEditMode ? (
                      <textarea
                        value={cut.sourceFileName}
                        onChange={(e) => {
                          onUpdateCut(index, 'sourceFileName', e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none overflow-hidden bg-slate-50 font-mono"
                        rows={1}
                      />
                    ) : (
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-mono break-all block w-full">
                        {cut.sourceFileName}
                      </code>
                    )}
                </td>
                <td className="p-4 align-top border-r border-slate-100">
                  <div className={`p-3 rounded-lg border h-full transition-colors ${isEditMode ? 'bg-white border-slate-300' : 'bg-yellow-50 border-yellow-100'}`}>
                    {isEditMode ? (
                      <textarea
                        value={cut.subtitles}
                        onChange={(e) => {
                          onUpdateCut(index, 'subtitles', e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none resize-none overflow-hidden"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">
                        {cut.subtitles}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className={`p-3 rounded-lg border h-full transition-colors ${isEditMode ? 'bg-white border-slate-300' : 'bg-blue-50 border-blue-100'}`}>
                    {isEditMode ? (
                      <textarea
                        value={cut.narration}
                        onChange={(e) => {
                          onUpdateCut(index, 'narration', e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none resize-none overflow-hidden"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap italic leading-relaxed">
                        "{cut.narration}"
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
           Generated by AI Storyboard Creator
        </div>
      </div>
    </div>
  );
};

export default StoryboardTable;