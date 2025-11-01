export type Priority = 'none' | 'low' | 'medium' | 'high';
export type TaskStatus = 'yet-to-start' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
}

export interface Note {
  id:string;
  title: string;
  content: string;
  tags: string[];
  image?: string;
}

export type EventType = 'meeting' | 'appointment' | 'reminder' | 'other' | 'birthday' | 'anniversary' | 'important-date';

export interface Event {
  id: string;
  title: string;
  eventType: EventType;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
  triggered?: boolean;
  celebration?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  createdAt: string;
}

export type View = 'home' | 'todos' | 'notes' | 'calendar' | 'settings';

export enum ClassificationType {
    TASK = 'task',
    MULTI_TASK = 'multi_task',
    NOTE = 'note',
    EVENT = 'event',
    UNKNOWN = 'unknown',
}

export interface ClassificationResult {
    type: ClassificationType;
    summary: string;
    data: Array<{
        title?: string;
        content?: string;
        date?: string;
        time?: string;
        priority?: Priority;
        eventType?: EventType;
        conflict?: boolean;
        suggestions?: string[];
    }>;
}


export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// FIX: Add centralized Web Speech API type definitions to avoid conflicts and errors.
// -- Web Speech API types for global scope --

// FIX: Move Web Speech API interfaces into `declare global` to make them globally available.
declare global {
    interface SpeechRecognitionAlternative {
        transcript: string;
        confidence: number;
    }
      
    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }
      
    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }
      
    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message?: string;
    }
      
    interface SpeechRecognition {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: () => void;
        onend: () => void;
        onerror: (event: SpeechRecognitionErrorEvent) => void;
        onresult: (event: SpeechRecognitionEvent) => void;
        start: () => void;
        stop: () => void;
    }
  
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}