import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/views/Dashboard';
import TasksView from './components/views/TasksView';
import NotesView from './components/views/NotesView';
import EventsView from './components/views/EventsView';
import SettingsView from './components/views/SettingsView';
import { View, Task, Note, Event } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import AIAssistant from './components/AIAssistant';
import Modal from './components/Modal';
import Confetti from './components/Confetti';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);
  const [activeReminder, setActiveReminder] = useState<Event | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useLocalStorage<boolean>('voiceFeedback', true);
  
  const [dailyTokens, setDailyTokens] = useLocalStorage<{ count: number; lastReset: string }>('dailyTokens', {
    count: 1000,
    lastReset: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dailyTokens.lastReset !== todayStr) {
      setDailyTokens({ count: 1000, lastReset: todayStr });
    }
  }, []); // Run only once on component mount

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      // Find the first reminder that is due and not yet triggered
      const dueReminder = events.find(event => {
        if (event.eventType !== 'reminder' && event.eventType !== 'birthday' && event.eventType !== 'anniversary' && event.eventType !== 'important-date' || event.triggered) {
          return false;
        }
        // Combine date and time into a single Date object
        const eventDateTime = new Date(`${event.startDate}T${event.startTime}`);
        return eventDateTime <= now;
      });

      if (dueReminder && !activeReminder) {
        setActiveReminder(dueReminder);
        if (dueReminder.celebration) {
          setShowConfetti(true);
        }
      }
    };

    // Check for reminders every 10 seconds
    const intervalId = setInterval(checkReminders, 10000); 

    return () => clearInterval(intervalId);
  }, [events, activeReminder]);
  
  const triggerConfetti = () => {
    setShowConfetti(true);
    // Hide confetti after the animation duration
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  const dismissReminder = () => {
    if (activeReminder) {
      // Mark the reminder as triggered in the main events list
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === activeReminder.id ? { ...event, triggered: true } : event
        )
      );
      // Clear the active reminder from the state
      setActiveReminder(null);
      setShowConfetti(false);
    }
  };


  const consumeTokens = (amount: number): boolean => {
    if (dailyTokens.count >= amount) {
        setDailyTokens(prev => ({ ...prev, count: prev.count - amount }));
        return true;
    }
    return false;
  };

  const setTaskReminder = (task: Task) => {
    const reminderTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const newEvent: Event = {
      id: `task-reminder-${task.id}-${Date.now()}`,
      title: `Reminder: ${task.content}`,
      eventType: 'reminder',
      allDay: false,
      startDate: reminderTime.toISOString().split('T')[0],
      startTime: `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`,
      description: `This is a reminder for your task: "${task.content}"`,
    };
    setEvents(prev => [...prev, newEvent]);
    // Optionally: add a toast notification here for user feedback
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard 
          consumeTokens={consumeTokens}
          remainingTokens={dailyTokens.count}
          tasks={tasks}
          notes={notes}
          events={events}
          setTasks={setTasks}
          setNotes={setNotes}
          setEvents={setEvents}
          setCurrentView={setCurrentView}
          voiceFeedbackEnabled={voiceFeedback}
        />;
      case 'todos':
        return <TasksView tasks={tasks} setTasks={setTasks} triggerConfetti={triggerConfetti} setTaskReminder={setTaskReminder} />;
      case 'notes':
        return <NotesView notes={notes} setNotes={setNotes} consumeTokens={consumeTokens} remainingTokens={dailyTokens.count} />;
      case 'calendar':
        return <EventsView events={events} setEvents={setEvents} />;
      case 'settings':
        return <SettingsView voiceFeedback={voiceFeedback} setVoiceFeedback={setVoiceFeedback} />;
      default:
        return <Dashboard 
          consumeTokens={consumeTokens}
          remainingTokens={dailyTokens.count}
          tasks={tasks}
          notes={notes}
          events={events}
          setTasks={setTasks}
          setNotes={setNotes}
          setEvents={setEvents}
          setCurrentView={setCurrentView}
          voiceFeedbackEnabled={voiceFeedback}
        />;
    }
  };
  
  const getReminderTitle = () => {
    if (!activeReminder) return '';
    switch(activeReminder.eventType) {
        case 'birthday': return `🎉 Happy Birthday, ${activeReminder.title}!`;
        case 'anniversary': return `💖 Happy Anniversary!`;
        case 'important-date': return `🌟 Important: ${activeReminder.title}`;
        default: return `Reminder: ${activeReminder.title}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Confetti isActive={showConfetti} />
      <Header remainingTokens={dailyTokens.count} />
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      <AIAssistant consumeTokens={consumeTokens} remainingTokens={dailyTokens.count} />
       <Modal
        isOpen={!!activeReminder}
        onClose={dismissReminder}
        title={getReminderTitle()}
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            {activeReminder?.description || `This is your scheduled reminder for "${activeReminder?.title}".`}
          </p>
          <p className="font-semibold text-slate-800">
            {`Scheduled for: ${activeReminder?.startTime}`}
          </p>
          <button
            onClick={dismissReminder}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Dismiss
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;