import React, { useState } from 'react';
import { FileUp, Camera, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadZoneProps {
  onUpload: (text: string) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Simulate upload
    startSimulatedUpload("Sample Notice Text from PDF...");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startSimulatedUpload("This is the extracted text from the government notice regarding the new property tax regulations in Karnataka...");
    }
  };

  const startSimulatedUpload = (text: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onUpload(text);
          setUploadProgress(0);
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pt-10">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Process Document</h2>
        <p className="text-slate-500">Upload a PDF or Image of any government notice for instant simplification.</p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative group h-80 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.02] shadow-2xl" 
            : "border-slate-300 bg-white/50 hover:border-primary/50 hover:bg-white",
          isProcessing && "pointer-events-none opacity-80"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg,.txt"
        />

        <AnimatePresence mode="wait">
          {isProcessing || uploadProgress > 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              key="processing"
              className="flex flex-col items-center gap-4 text-center p-8"
            >
              <div className="relative">
                <Loader2 className="text-primary animate-spin" size={64} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                  {uploadProgress}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-800">
                  {uploadProgress < 100 ? "Uploading Document..." : "Analyzing Notice..."}
                </p>
                <p className="text-sm text-slate-500">
                  AI is extracting information and simplifying the content.
                </p>
              </div>
              
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress < 100 ? uploadProgress : 100}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key="idle"
              className="flex flex-col items-center gap-6 p-8"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-slate-200">
                <FileUp className="text-primary" size={32} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">Drag & Drop Documents</p>
                <p className="text-sm text-slate-500 mt-1">Accepts PDF, JPG, PNG up to 10MB</p>
              </div>
              <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                Browse Files
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {dragActive && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center border-4 border-primary border-dashed rounded-3xl animate-pulse">
            <p className="text-primary font-black text-2xl">Drop to Process</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 p-4 glass rounded-2xl hover:bg-slate-50 transition-colors border-slate-200 group">
          <Camera className="text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm text-slate-700">Scan with Camera</span>
        </button>
        <button className="flex items-center justify-center gap-3 p-4 glass rounded-2xl hover:bg-slate-50 transition-colors border-slate-200 group">
          <FileText className="text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm text-slate-700">Paste Notice Text</span>
        </button>
      </div>

      <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="text-accent shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Pro Tip</h4>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">
              For best results, ensure the document is clear and readable. High-resolution images help the AI extract dates and fees more accurately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
