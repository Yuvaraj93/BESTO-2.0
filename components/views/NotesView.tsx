import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../../types';
import Modal from '../Modal';
import { improveGrammar, summarizeText, summarizeConversation } from '../../services/geminiService';

// FIX: Removed local SpeechRecognition types. They are now defined globally in types.ts.

interface NotesViewProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    consumeTokens: (amount: number) => boolean;
    remainingTokens: number;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const WandIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 8.86-8.86a2 2 0 0 1 2.82 0l8.86 8.86M21 3l-8.86 8.86a2 2 0 0 0 0 2.82L21 21"/></svg>
const SummarizeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12.5 8 15l-2-2.5"/><path d="m3 14 2-2 3 3 2-2"/><path d="M3 6h18"/><path d="M3 10h18"/><path d="M3 18h18"/></svg>
const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
);
const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><rect width="6" height="6" x="9" y="9"/></svg>
);


const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes, consumeTokens, remainingTokens }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [noteImage, setNoteImage] = useState<string | null>(null);
    
    const [currentTag, setCurrentTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const transcriptRef = useRef('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcriptRef.current += event.results[i][0].transcript + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };
            
            recognition.onend = () => {
                setIsRecording(false);
                if (transcriptRef.current.trim()) {
                    handleSummarizeConversation(transcriptRef.current);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            if (!consumeTokens(150)) {
                alert("You don't have enough tokens to record and summarize a conversation.");
                return;
            }
            transcriptRef.current = '';
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleSummarizeConversation = async (transcript: string) => {
        setIsSummarizing(true);
        try {
            const summary = await summarizeConversation(transcript);
            openAddModal('Conversation Summary', summary);
        } catch (error) {
            console.error('Failed to summarize conversation', error);
            openAddModal('Conversation Transcript', `Failed to summarize. Raw transcript:\n\n${transcript}`);
        } finally {
            setIsSummarizing(false);
            transcriptRef.current = '';
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNoteImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setNoteTitle('');
        setNoteContent('');
        setNoteTags([]);
        setNoteImage(null);
        setCurrentTag('');
        setEditingNote(null);
    };

    const openAddModal = (initialTitle = '', initialContent = '') => {
        resetForm();
        setNoteTitle(initialTitle);
        setNoteContent(initialContent);
        setIsModalOpen(true);
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setNoteTags(note.tags);
        setNoteImage(note.image || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = () => {
        // Allow saving if there is a title, content, or image
        if (noteTitle.trim() || noteContent.trim() || noteImage) {
            if (editingNote) {
                // Update note
                const updatedNote: Note = {
                    ...editingNote,
                    title: noteTitle.trim() || 'Untitled Note',
                    content: noteContent,
                    tags: noteTags,
                    image: noteImage || undefined,
                };
                setNotes(notes.map(n => n.id === editingNote.id ? updatedNote : n));
            } else {
                // Add new note
                const newNote: Note = {
                    id: Date.now().toString(),
                    title: noteTitle.trim() || 'Untitled Note',
                    content: noteContent,
                    tags: noteTags,
                    image: noteImage || undefined,
                };
                setNotes([newNote, ...notes]);
            }
            handleCloseModal();
        }
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !noteTags.includes(currentTag.trim())) {
            setNoteTags([...noteTags, currentTag.trim()]);
            setCurrentTag('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setNoteTags(noteTags.filter(tag => tag !== tagToRemove));
    };

    const handleImproveGrammar = async () => {
        if (!consumeTokens(50)) return;
        setIsProcessing(true);
        const improvedText = await improveGrammar(noteContent);
        setNoteContent(improvedText);
        setIsProcessing(false);
    };
    
    const handleSummarize = async () => {
        if (!consumeTokens(50)) return;
        setIsProcessing(true);
        const summary = await summarizeText(noteContent);
        setNoteContent(summary);
        setIsProcessing(false);
    };

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const recordButtonContent = () => {
        if (isSummarizing) return <><LoaderIcon className="w-5 h-5 animate-spin"/> Summarizing...</>;
        if (isRecording) return <><StopCircleIcon className="w-5 h-5"/> Stop Recording</>;
        return <><MicIcon className="w-5 h-5"/> Record Summary</>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
                 <h2 className="text-3xl font-bold text-slate-900">Notes</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleToggleRecording} 
                        disabled={isSummarizing || (!isRecording && remainingTokens < 150)}
                        className={`bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${isRecording ? 'bg-red-600' : 'hover:bg-purple-700'} disabled:bg-slate-400 disabled:cursor-not-allowed`}
                    >
                        {recordButtonContent()}
                    </button>
                    <button onClick={() => openAddModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                        <PlusIcon className="w-5 h-5"/>
                        <span>Add Note</span>
                    </button>
                </div>
            </div>
             <div className="relative mb-4">
                <input 
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                    <div key={note.id} onClick={() => openEditModal(note)} className="bg-white rounded-lg border border-slate-200 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-blue-500 transition-colors">
                        <div>
                            {note.image && <img src={note.image} alt={note.title} className="w-full h-40 object-cover" />}
                            <div className="p-4">
                               <h3 className="font-bold text-lg text-slate-800 mb-2">{note.title}</h3>
                                {note.content && <p className="text-slate-600 whitespace-pre-wrap text-sm">{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>}
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {note.tags.map(tag => <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end p-4 pt-0">
                            <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-slate-400 hover:text-red-500">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && <p className="text-slate-500 text-center mt-8">No notes yet. Create one to capture your thoughts.</p>}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNote ? 'Edit Note' : 'Add New Note'}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Enter note title..."
                            className="w-full bg-slate-100 text-slate-800 p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Content</label>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Write your note here..."
                            rows={6}
                            className="w-full bg-slate-100 text-slate-800 p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={handleImproveGrammar} disabled={isProcessing || !noteContent || remainingTokens < 50} className="flex items-center justify-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                            {isProcessing ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <WandIcon className="w-4 h-4"/>}
                            Improve Grammar
                        </button>
                         <button onClick={handleSummarize} disabled={isProcessing || !noteContent || remainingTokens < 50} className="flex items-center justify-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                            {isProcessing ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <SummarizeIcon className="w-4 h-4"/>}
                            Summarize
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 text-sm bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-300 transition-colors font-medium">
                            <ImageIcon className="w-4 h-4" />
                            Image
                        </button>
                        <div className="relative">
                            <button disabled title="Upgrade to Pro to summarize files" className="flex items-center justify-center gap-2 text-sm bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                                <FileTextIcon className="w-4 h-4" />
                                Summarize File
                            </button>
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full transform scale-90">PRO</span>
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                     {noteImage && (
                        <div className="relative">
                            <img src={noteImage} alt="Preview" className="rounded-lg w-full max-h-48 object-cover"/>
                            <button onClick={() => setNoteImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div>
                         <label className="text-sm font-medium text-slate-700 block mb-1">Tags</label>
                         <div className="flex gap-2">
                             <input type="text" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} placeholder="Add a tag..." className="flex-grow bg-slate-100 p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                             <button onClick={handleAddTag} className="bg-slate-200 text-slate-700 px-4 rounded-md hover:bg-slate-300 font-semibold">Add</button>
                         </div>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {noteTags.map(tag => (
                                <span key={tag} className="bg-slate-200 text-slate-700 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-slate-800">
                                        <XIcon className="w-3 h-3"/>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-3 pt-4">
                        <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-slate-700">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
                            {editingNote ? 'Save Note' : 'Save Note'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NotesView;