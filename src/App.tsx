import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Download, Copy, Check, Type as TypeIcon, Languages, Info, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { identifyFonts, FontInfo } from './services/fontService';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FontInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResults([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  } as any);

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const fonts = await identifyFonts(image);
      setResults(fonts);
      if (fonts.length === 0) {
        setError("No fonts could be identified. Try a clearer image.");
      }
    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <TypeIcon size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">FontFinder AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Languages size={16} />
              فارسی / English
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Upload Image</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Upload a receipt, document, or logo to identify the fonts used. 
                Supports both Persian and English text.
              </p>
              
              <div 
                {...getRootProps()} 
                className={`
                  relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                  ${isDragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-300 bg-white hover:border-zinc-400'}
                `}
              >
                <input {...getInputProps()} />
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium">Drag & drop or click to upload</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!image || loading}
                className={`
                  w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
                  ${!image || loading 
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing Fonts...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Identify Fonts
                  </>
                )}
              </button>
              
              {error && (
                <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}
            </section>

            <section className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <Info size={18} />
                <h3>How it works</h3>
              </div>
              <ul className="text-sm text-emerald-700/80 space-y-2 list-disc pl-4">
                <li>Our AI analyzes the shapes of characters in your image.</li>
                <li>It identifies the most likely font families used.</li>
                <li>You can download the fonts or copy individual characters.</li>
              </ul>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-semibold tracking-tight mb-8">Detected Fonts</h2>
            
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {results.map((font, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-zinc-100 flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-zinc-900">{font.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${font.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {font.isFree ? 'Free Font' : 'Premium Font'}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">Confidence: {Math.round(font.confidence * 100)}%</span>
                          </div>
                        </div>
                        <a 
                          href={font.downloadUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        <p className="text-sm text-zinc-500 leading-relaxed">
                          {font.description}
                        </p>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Character Map (Click to copy)</h4>
                            
                            {/* Numbers */}
                            <div className="flex flex-wrap gap-2">
                              {font.sampleCharacters.numbers.map((char, i) => (
                                <button
                                  key={i}
                                  onClick={() => copyToClipboard(char)}
                                  className="w-10 h-10 rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-center text-lg font-medium hover:bg-white hover:border-emerald-300 hover:text-emerald-600 transition-all relative group"
                                >
                                  {char}
                                  {copiedChar === char && (
                                    <div className="absolute -top-8 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded">Copied!</div>
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* English */}
                            <div className="flex flex-wrap gap-2">
                              {font.sampleCharacters.english.map((char, i) => (
                                <button
                                  key={i}
                                  onClick={() => copyToClipboard(char)}
                                  className="w-10 h-10 rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-center text-lg font-medium hover:bg-white hover:border-emerald-300 hover:text-emerald-600 transition-all relative"
                                >
                                  {char}
                                  {copiedChar === char && (
                                    <div className="absolute -top-8 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded">Copied!</div>
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Persian */}
                            <div className="flex flex-wrap gap-2" dir="rtl">
                              {font.sampleCharacters.persian.map((char, i) => (
                                <button
                                  key={i}
                                  onClick={() => copyToClipboard(char)}
                                  className="w-10 h-10 rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-center text-xl font-medium hover:bg-white hover:border-emerald-300 hover:text-emerald-600 transition-all relative"
                                >
                                  {char}
                                  {copiedChar === char && (
                                    <div className="absolute -top-8 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded">کپی شد!</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50"
                >
                  {loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-emerald-500" size={40} />
                      <p className="text-sm font-medium animate-pulse">Scanning typography patterns...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">Results will appear here after analysis</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-200 text-center">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
          Powered by Gemini 3.1 Pro • Supports Persian & English
        </p>
      </footer>
    </div>
  );
}
