import React, { useState, useEffect, useRef } from 'react';
import { classifyText, generateSpeech } from '../../services/geminiService';
// FIX: Alias the custom Event type to avoid conflict with the DOM Event type.
import { Task, Note, Event as AppEvent, ClassificationType, View } from '../../types';
import Modal from '../Modal';

// FIX: Removed local SpeechRecognition types. They are now defined globally in types.ts.

interface DashboardProps {
  consumeTokens: (amount: number) => boolean;
  remainingTokens: number;
  tasks: Task[];
  notes: Note[];
  events: AppEvent[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
  setCurrentView: (view: View) => void;
  voiceFeedbackEnabled: boolean;
}

interface ConflictInfo {
    suggestions: string[];
    originalEventData: Omit<AppEvent, 'id'>;
}

const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const LightningIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"></polygon></svg>;
const CheckSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
);
const SoundWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 10v4" /><path d="M6 7v10" /><path d="M10 4v16" /><path d="M14 7v10" /><path d="M18 10v4" /></svg>
);

const StatCard: React.FC<{ icon: React.ReactElement; label: string; value: number | string; color: string; onClick?: () => void; }> = ({ icon, label, value, color, onClick }) => {
    const content = (
        <>
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
            </div>
        </>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-4 w-full text-left transition-colors hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                {content}
            </button>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-4">
            {content}
        </div>
    );
};

const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

const Dashboard: React.FC<DashboardProps> = ({ consumeTokens, remainingTokens, tasks, notes, events, setTasks, setNotes, setEvents, setCurrentView, voiceFeedbackEnabled }) => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error' | 'conflict'>('idle');
    const [feedback, setFeedback] = useState("Tap the mic and speak your thoughts. I'll help organize them intelligently.");
    const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isDigestOpen, setIsDigestOpen] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const lastDigestDate = localStorage.getItem('lastDigestDate');
        const todayStr = new Date().toISOString().split('T')[0];

        if (lastDigestDate !== todayStr) {
            const openTasks = tasks.filter(t => t.status !== 'completed');
            const todayEvents = events.filter(e => e.startDate === todayStr);

            if (openTasks.length > 0 || todayEvents.length > 0) {
                setIsDigestOpen(true);
                localStorage.setItem('lastDigestDate', todayStr);
            }
        }
    }, [tasks, events]);

    const speak = async (text: string) => {
        if (!voiceFeedbackEnabled || !text) return;
        
        if (!consumeTokens(10)) {
            console.warn("Not enough tokens for voice feedback.");
            return; // Fail silently if tokens are insufficient for optional feedback
        }

        setStatus('speaking');
        try {
            const audioData = await generateSpeech(text);
            if (audioData && audioContextRef.current) {
                const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
                return new Promise(resolve => {
                    source.onended = () => resolve(void 0);
                });
            }
        } catch (error) {
            console.error("Error speaking:", error);
        } finally {
            // Status will be changed by the caller after await
        }
    };


    const resetState = () => {
        setStatus('idle');
        setFeedback("Tap the mic and speak your thoughts. I'll help organize them intelligently.");
        setConflictInfo(null);
    };

    const processTranscript = async (transcript: string) => {
        setStatus('processing');
        setFeedback('Thinking...');

        if (!consumeTokens(100)) {
            const errorFeedback = "You don't have enough tokens to process that request.";
            setStatus('error');
            setFeedback(errorFeedback);
            await speak(errorFeedback); // This might fail if tokens are very low, but that's ok.
            setTimeout(resetState, 3000);
            return;
        }

        try {
            const result = await classifyText(transcript, events);
            let feedbackMessages = [];
            
            // Always create a summary note
            if (result.summary) {
                const summaryNote: Note = {
                    id: Date.now().toString(),
                    title: `Summary of capture`,
                    content: result.summary,
                    tags: ['quick-capture'],
                };
                setNotes(prev => [summaryNote, ...prev]);
                feedbackMessages.push('Summary saved to notes');
            }

            if (result.type === ClassificationType.TASK) {
                const item = result.data[0];
                const newTask: Task = {
                    id: Date.now().toString(),
                    content: item.content || item.title || 'New Task',
                    status: 'yet-to-start',
                    priority: item.priority || 'none',
                    dueDate: item.date,
                };
                setTasks(prev => [newTask, ...prev]);
                feedbackMessages.push('Task created');
            } else if (result.type === ClassificationType.MULTI_TASK) {
                const newTasks: Task[] = result.data.map(item => ({
                    id: `${Date.now()}-${Math.random()}`,
                    content: item.content || item.title || 'New Task',
                    status: 'yet-to-start',
                    priority: item.priority || 'none',
                    dueDate: item.date,
                }));
                setTasks(prev => [...newTasks, ...prev]);
                feedbackMessages.push(`${newTasks.length} tasks created`);
            } else if (result.type === ClassificationType.NOTE) {
                 const item = result.data[0];
                 const newNote: Note = {
                    id: Date.now().toString(),
                    title: item.title || 'New Note',
                    content: item.content || '',
                    tags: [],
                };
                setNotes(prev => [newNote, ...prev]);
                feedbackMessages.push('Note created');
            } else if (result.type === ClassificationType.EVENT) {
                const item = result.data[0];
                const originalEventData: Omit<AppEvent, 'id'> = {
                    title: item.title || 'New Event',
                    eventType: item.eventType || 'meeting',
                    allDay: false,
                    startDate: item.date || new Date().toISOString().split('T')[0],
                    startTime: item.time || '12:00',
                };

                if (item.conflict && item.suggestions) {
                    const conflictFeedback = 'This time is busy. How about one of these instead?';
                    setConflictInfo({ suggestions: item.suggestions, originalEventData });
                    setFeedback(conflictFeedback);
                    await speak(conflictFeedback);
                    setStatus('conflict');
                    return; // Stop further processing until user makes a choice
                } else {
                    setEvents(prev => [...prev, { ...originalEventData, id: Date.now().toString() }]);
                    feedbackMessages.push('Event created');
                }
            } else {
                feedbackMessages.push("Could not classify intent");
            }

            const finalFeedback = feedbackMessages.join(' & ') + '!';
            setFeedback(finalFeedback);
            await speak(finalFeedback);
            setStatus('success');
        } catch (error) {
            const errorFeedback = 'An error occurred during classification.';
            setStatus('error');
            setFeedback(errorFeedback);
            await speak(errorFeedback);
            console.error("Failed to process capture", error);
        } finally {
            if (status !== 'conflict') {
                setTimeout(resetState, 3000);
            }
        }
    };
    
    const handleSuggestionSelect = async (suggestion: string) => {
        if (!conflictInfo) return;
        const [startDate, startTime] = suggestion.split(' ');
        const newEvent: AppEvent = {
            ...conflictInfo.originalEventData,
            id: Date.now().toString(),
            startDate,
            startTime,
        };
        setEvents(prev => [...prev, newEvent]);
        const feedbackMessage = 'Great, event scheduled for the new time!';
        setFeedback(feedbackMessage);
        await speak(feedbackMessage);
        setStatus('success');
        setTimeout(resetState, 3000);
    };


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus('error');
            setFeedback("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
            setFeedback("I'm listening...");
        };

        recognition.onend = () => {
            if (status === 'listening') {
                 resetState();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            const errorFeedback = `Error: ${event.error === 'not-allowed' ? 'Permission denied' : event.error}`;
            setFeedback(errorFeedback);
            // No need to speak this, as it's a browser/permission error
            setStatus('error');
            setTimeout(resetState, 3000);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                processTranscript(transcript);
            }
        };
        
        recognitionRef.current = recognition;
    }, [status]);


    const handleQuickCapture = () => {
        if (!recognitionRef.current) return;
        
        if (remainingTokens < 100) {
            setFeedback("You don't have enough tokens for Quick Capture today.");
            setStatus('error');
            setTimeout(resetState, 3000);
            return;
        }

        // Initialize AudioContext on first user interaction
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (status === 'listening') {
            recognitionRef.current.stop();
        } else if (status === 'idle' || status === 'error' || status === 'success') {
            recognitionRef.current.start();
        }
    };
    
    const isProcessing = ['processing', 'speaking', 'success', 'error', 'conflict'].includes(status);
    
    const openTasks = tasks.filter(t => t.status !== 'completed');
    const todayEvents = events.filter(e => e.startDate === new Date().toISOString().split('T')[0]);

    return (
        <div className="space-y-6">
            <Modal isOpen={isDigestOpen} onClose={() => setIsDigestOpen(false)} title="Your Daily Digest">
                <div className="space-y-4">
                    <p className="text-slate-600">Here's a look at your day. Let's make it a productive one!</p>
                    {todayEvents.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Today's Events</h3>
                            <ul className="space-y-2 list-disc list-inside text-slate-700">
                                {todayEvents.map(event => (
                                    <li key={event.id}><strong>{event.startTime}</strong> - {event.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {openTasks.length > 0 && (
                         <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Open Tasks</h3>
                            <ul className="space-y-2 list-disc list-inside text-slate-700">
                                {openTasks.slice(0, 5).map(task => (
                                    <li key={task.id} className="flex items-center">
                                        {task.priority === 'high' && <FlagIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />}
                                        <span>{task.content}</span>
                                    </li>
                                ))}
                                {openTasks.length > 5 && <li>...and {openTasks.length - 5} more.</li>}
                            </ul>
                        </div>
                    )}
                    <button onClick={() => setIsDigestOpen(false)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold mt-4">
                        Got It!
                    </button>
                </div>
            </Modal>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                <h2 className="text-xl font-bold mb-2">Quick Capture</h2>
                <p className="text-slate-500 mb-4 text-sm max-w-sm mx-auto h-10 flex items-center justify-center">{feedback}</p>
                
                {status !== 'conflict' && (
                    <button 
                        onClick={handleQuickCapture}
                        disabled={isProcessing || remainingTokens < 100}
                        className={`text-white rounded-full p-5 transition-all duration-200 ease-in-out hover:scale-105 disabled:scale-100 mx-auto flex items-center justify-center
                            ${status === 'listening' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}
                            ${isProcessing || remainingTokens < 100 ? 'disabled:bg-slate-400 cursor-not-allowed' : ''}
                        `}
                        aria-label={status === 'listening' ? 'Stop Capture' : 'Start Capture'}
                    >
                        {status === 'processing' ? <LoaderIcon className="w-8 h-8 animate-spin" /> :
                         status === 'speaking' ? <SoundWaveIcon className="w-8 h-8" /> :
                         <MicIcon className="w-8 h-8" />}
                    </button>
                )}
                
                {status === 'conflict' && conflictInfo && (
                    <div className="space-y-2 max-w-md mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {conflictInfo.suggestions.map(sugg => (
                                <button key={sugg} onClick={() => handleSuggestionSelect(sugg)} className="bg-blue-100 text-blue-800 text-sm font-semibold p-2 rounded-md hover:bg-blue-200">
                                    {new Date(sugg).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            ))}
                        </div>
                        <button onClick={resetState} className="text-slate-500 text-sm hover:text-slate-800">Cancel</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard 
                    icon={<LightningIcon className="w-6 h-6 text-yellow-800"/>}
                    label="AI Tokens remaining"
                    value={`${remainingTokens} / 1000`}
                    color="bg-yellow-100"
                />
                 <StatCard 
                    icon={<CheckSquareIcon className="w-6 h-6 text-blue-800"/>}
                    label="Open Tasks"
                    value={tasks.filter(t => t.status !== 'completed').length}
                    color="bg-blue-100"
                    onClick={() => setCurrentView('todos')}
                />
                 <StatCard 
                    icon={<FileTextIcon className="w-6 h-6 text-green-800"/>}
                    label="Notes"
                    value={notes.length}
                    color="bg-green-100"
                    onClick={() => setCurrentView('notes')}
                />
                <StatCard 
                    icon={<CalendarIcon className="w-6 h-6 text-purple-800"/>}
                    label="Events"
                    value={events.length}
                    color="bg-purple-100"
                />
            </div>

             <div>
                <h2 className="text-lg font-bold mb-4 text-slate-800">Recent Activity</h2>
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                    <p className="text-slate-500">Your most recently created items will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
