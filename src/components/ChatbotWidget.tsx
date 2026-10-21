'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowUp, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  Check, 
  Bot,
  Search,
  ChevronLeft,
  Paperclip,
  FileText
} from 'lucide-react';
import { marked } from 'marked';
import AIRobotAvatar from './AIRobotAvatar';
import SiriOrb from './smoothui/siri-orb';
import AILoader from './smoothui/ai-loader';

// Configure marked with GitHub Flavored Markdown and line breaks
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content, { async: false }) as string;
  } catch {
    return content;
  }
}

const BRAND_ORB_COLORS = {
  bg: '#0A192F',
  c1: '#DC2626',
  c2: '#1D4ED8',
  c3: '#38BDF8',
  c4: '#2563EB',
};

interface AttachedFile {
  name: string;
  size: string;
  file?: File;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  attachment?: {
    name: string;
    size: string;
  };
  options?: { id: string; label: string }[];
  chips?: string[];
  summaryCard?: { label: string; value: string }[];
  actionPair?: {
    cancelText: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
}


const INITIAL_WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hello! Welcome to NAIR.AI. How can I assist you with our enterprise AI platforms today?',
  timestamp: 'Just now',
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'streaming'>('idle');
  const [wsConnected, setWsConnected] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUserPromptRef = useRef<string>('');
  const streamingContentRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, streamingContent, scrollToBottom]);

  // Fallback interactive simulation function
  const runSimulationResponse = useCallback((promptText: string) => {
    setAiState('streaming');
    let response = '';
    let options: { id: string; label: string }[] | undefined;
    let chips: string[] | undefined;
    let summaryCard: { label: string; value: string }[] | undefined;
    let actionPair: Message['actionPair'] | undefined;

    const lower = promptText.toLowerCase();

    if (lower.includes('schedule') || lower.includes('call') || lower.includes('book')) {
      response = 'Great! Here are the details for your technical consultation:';
      summaryCard = [
        { label: 'Consultation', value: '30-Min AI Architecture' },
        { label: 'Focus', value: 'Autonomous Systems & RAG' },
        { label: 'Engineer', value: 'Senior AI Specialist' },
      ];
      actionPair = {
        cancelText: 'Cancel',
        confirmText: 'Confirm Booking',
        onConfirm: () => handleSend('Confirmed! Please proceed.'),
        onCancel: () => handleSend('I would like to explore other options first.'),
      };
    } else if (lower.includes('swarm') || lower.includes('agent')) {
      response = 'Our Autonomous Multi-Agent Swarms orchestrate tasks across your enterprise workflows with zero human bottleneck. What timeline are you considering?';
      chips = ['2-3 Weeks', '1-2 Months', 'Exploring'];
    } else if (lower.includes('governance') || lower.includes('retention') || lower.includes('security')) {
      response = 'NAIR.AI Zero-Retention Architecture ensures zero model-side prompt caching and cryptographic memory isolation. Which tier fits your compliance needs?';
      options = [
        { id: '1', label: 'SOC2 & HIPAA Compliant VPC >' },
        { id: '2', label: 'On-Premise Air-Gapped Cluster >' },
      ];
    } else {
      response = 'NAIR.AI builds production-grade multi-agent swarms, zero-retention pipelines, and sovereign enterprise inference engines. How can we help your team?';
      chips = ['Consulting Services', 'Zero Retention', 'Schedule Call'];
    }

    let index = 0;
    const words = response.split(' ');
    const interval = setInterval(() => {
      index += 2;
      setStreamingContent(words.slice(0, index).join(' '));
      if (index >= words.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setAiState('idle');
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === response) {
            return prev;
          }
          return [
            ...prev,
            {
              id: 'resp-' + Date.now(),
              role: 'assistant',
              content: response,
              options,
              chips,
              summaryCard,
              actionPair,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
        });
        setStreamingContent('');
      }
    }, 35);
  }, []);

  // Connect WebSocket to Python Backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isDisposed = false;

    const connectWebSocket = () => {
      if (isDisposed) return;
      try {
        const rawUrl = (import.meta.env.VITE_WS_URL as string)?.trim();
        const defaultWsUrl = 'wss://nai-chatbot.onrender.com/ws/chat';
        let wsUrl = rawUrl || defaultWsUrl;

        if (wsUrl) {
          // Normalize protocol: http -> ws, https -> wss
          wsUrl = wsUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
          if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
            wsUrl = (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://') + wsUrl;
          }
          // Automatically append /ws/chat if omitted
          if (!wsUrl.includes('/ws/chat')) {
            wsUrl = wsUrl.replace(/\/+$/, '') + '/ws/chat';
          }
        }

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isDisposed) setWsConnected(true);
        };
        ws.onerror = () => {
          if (!isDisposed) setWsConnected(false);
        };
        ws.onclose = () => {
          if (isDisposed) return;
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'start') {
              setIsStreaming(true);
              setAiState('streaming');
              streamingContentRef.current = '';
              setStreamingContent('');
            } else if (data.type === 'token') {
              streamingContentRef.current += (data.content || '');
              setStreamingContent(streamingContentRef.current);
            } else if (data.type === 'done') {
              const finalContent = streamingContentRef.current;
              streamingContentRef.current = '';
              setIsStreaming(false);
              setAiState('idle');
              setStreamingContent('');

              if (finalContent.trim()) {
                setMessages((prev) => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === finalContent) {
                    return prev;
                  }
                  return [
                    ...prev,
                    {
                      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                      role: 'assistant',
                      content: finalContent,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ];
                });
              }
            } else if (data.type === 'error') {
              // Gracefully fall back to rich presaved simulation if provider/API key error happens
              console.warn('Backend returned service note, engaging fallback simulation:', data.content);
              runSimulationResponse(lastUserPromptRef.current || 'services');
            }
          } catch (e) {
            console.error('Error handling WebSocket event:', e);
          }
        };

        wsRef.current = ws;
      } catch {
        if (!isDisposed) {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close();
      }
      wsRef.current = null;
    };
  }, [runSimulationResponse]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = file.size < 1024 * 1024
      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setAttachedFile({
      name: file.name,
      size: formattedSize,
      file,
    });
    e.target.value = '';
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleSend = (textToSend?: string) => {
    const rawText = (textToSend || inputValue).trim();
    if ((!rawText && !attachedFile) || isStreaming) return;

    const currentAttachment = attachedFile ? { name: attachedFile.name, size: attachedFile.size } : undefined;
    const text = rawText || (currentAttachment ? `Attached document: ${currentAttachment.name}` : '');

    lastUserPromptRef.current = text;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      attachment: currentAttachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setAttachedFile(null);
    setAiState('thinking');
    setIsStreaming(true);
    setStreamingContent('');

    const promptPayload = currentAttachment 
      ? `${text}\n\n[Uploaded File Attachment: ${currentAttachment.name} (${currentAttachment.size})]`
      : text;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: promptPayload,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        })
      );
    } else {
      setTimeout(() => {
        runSimulationResponse(text);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_WELCOME]);
    setStreamingContent('');
    setIsStreaming(false);
    setAiState('idle');
  };

  return (
    <>
      {/* Floating Corner: Standalone Orb Face + Left Hovering Pill (NO box around Orb) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Message hovering to the LEFT side of the Orb */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, x: 14, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(true)}
              className="cursor-pointer group flex items-center gap-2.5 rounded-full bg-white px-4.5 py-2.5 text-slate-800 shadow-[0_4px_22px_rgba(0,0,0,0.1)] border border-slate-200/90 backdrop-blur-md hover:shadow-[0_6px_25px_rgba(29,78,216,0.2)] hover:border-blue-400 transition-all active:scale-98"
              aria-label="Talk with NAIR.AI"
            >
              <span className="relative flex size-2">
                <span className={`absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'animate-ping bg-emerald-400 opacity-75' : 'bg-amber-400/50'}`} />
                <span className={`relative inline-flex size-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-xs font-semibold tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                Talk with NAIR.AI
              </span>
              <Sparkles className="size-3 text-blue-500 opacity-80" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* The Standalone Friendly Robot Avatar (NO background box or container) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative cursor-pointer select-none outline-none filter drop-shadow-[0_12px_32px_rgba(37,99,235,0.35)] transition-transform flex items-center justify-center p-0 bg-transparent border-0"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <AIRobotAvatar
            size={76}
            state={isOpen ? 'thinking' : aiState}
            showStatusLight={true}
          />
        </motion.button>
      </div>

      {/* Redesigned Clean White Chatbot Interface (Matching uploaded UI reference) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 flex h-[640px] max-h-[calc(100vh-2.5rem)] w-[410px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[32px] border border-slate-200/90 bg-[#F8FAFC] text-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]"
          >
            {/* Header (Top Nav bar from reference) */}
            <header className="relative flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Back"
                className="flex size-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                  Support Assistant
                </h3>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                  <span className={`inline-block size-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                  {wsConnected ? 'Online • Nair Core' : 'Connecting • Nair Core'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            {/* Conversation Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Date stamp in center like reference */}
              <div className="flex justify-center my-1">
                <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                  Today
                </span>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.role === 'assistant' ? (
                    <div className="flex items-start gap-2.5 max-w-[88%]">
                      {/* Avatar from reference */}
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center">
                        <AIRobotAvatar size={32} state="idle" showStatusLight={false} />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-400 mb-1 pl-1">
                          Assistant
                        </span>

                        {/* Bubble Card */}
                        <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-sm text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 leading-relaxed font-normal">
                          <div
                            className="markdown-content text-sm text-slate-800 leading-relaxed font-normal [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_code]:bg-slate-100 [&_code]:text-blue-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:my-2 [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-800 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-2"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                          />

                          {/* Option list with Chevrons (Like 'New bicycle >' in reference) */}
                          {msg.options && msg.options.length > 0 && (
                            <div className="mt-3 flex flex-col gap-1.5">
                              {msg.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSend(opt.label.replace(' >', ''))}
                                  className="group flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-600 transition-all border border-slate-100/80 cursor-pointer text-left"
                                >
                                  <span>{opt.label}</span>
                                  <ChevronRight className="size-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Quick Chips inline (Like '$50  $100  $300' in reference) */}
                          {msg.chips && msg.chips.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.chips.map((chip, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSend(chip)}
                                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Summary Card (Like Amount/From/To in reference) */}
                          {msg.summaryCard && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1 text-xs text-slate-600">
                              {msg.summaryCard.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span className="text-slate-400">{item.label}:</span>
                                  <span className="font-semibold text-slate-800">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Confirmation Pair Button (Like Cancel / Confirm in reference) */}
                        {msg.actionPair && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={msg.actionPair.onCancel}
                              className="flex-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs cursor-pointer"
                            >
                              {msg.actionPair.cancelText}
                            </button>
                            <button
                              type="button"
                              onClick={msg.actionPair.onConfirm}
                              className="flex-1 rounded-full bg-[#84CC16] hover:bg-[#65A30D] px-4 py-2 text-xs font-bold text-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              {msg.actionPair.confirmText}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* User Bubble (Right-aligned clean pill from reference) */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-[0_2px_6px_rgba(0,0,0,0.03)] border border-slate-200/90 leading-relaxed">
                        {msg.attachment && (
                          <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200/80 text-xs font-mono text-slate-700">
                            <FileText className="size-4 text-blue-600 shrink-0" />
                            <span className="truncate font-semibold max-w-[170px] text-[11px]">{msg.attachment.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">({msg.attachment.size})</span>
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming In-Progress Assistant Bubble */}
              {isStreaming && (
                <div className="flex items-start gap-2.5 max-w-[88%]">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center">
                    <AIRobotAvatar size={32} state={aiState === 'streaming' ? 'streaming' : 'thinking'} showStatusLight={false} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-slate-400 mb-1 pl-1">
                      Assistant
                    </span>
                    <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-sm text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 leading-relaxed">
                      {streamingContent ? (
                        <div>
                          <div
                            className="markdown-content text-sm text-slate-800 leading-relaxed font-normal [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_code]:bg-slate-100 [&_code]:text-blue-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:my-2 [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-800 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
                          />
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-600 animate-pulse" />
                        </div>
                      ) : (
                        <AILoader variant="dots" label="Typing..." className="text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer Bar */}
            <div className="p-3 bg-white border-t border-slate-100">
              {/* Attached file chip preview above input */}
              {attachedFile && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/90 px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="size-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium text-slate-800 text-[11px] max-w-[240px]">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      ({attachedFile.size})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove attachment"
                    className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />

              <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/90 pl-3 pr-1.5 py-1.5 focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-xs transition-all no-focus-ring">
                {/* Paperclip attachment button */}
                <button
                  type="button"
                  onClick={handleFileClick}
                  disabled={isStreaming}
                  title="Attach file (PDF, Docs, TXT, CSV, Images)"
                  aria-label="Attach file"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Paperclip className="size-4" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedFile ? "Add a message or press Enter..." : "Ask something..."}
                  disabled={isStreaming}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 outline-none border-none no-focus-ring disabled:opacity-50"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={(!inputValue.trim() && !attachedFile) || isStreaming}
                  aria-label="Send message"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-95 transition-all"
                >
                  <ArrowUp className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatbotWidget;
