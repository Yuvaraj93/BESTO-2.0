import React, { useState, useEffect, useRef } from 'react';
import { Event, EventType } from '../../types';
import Modal from '../Modal';

interface EventsViewProps {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
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
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const CakeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
);
const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);


const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [displayDate, setDisplayDate] = useState(initialDate);
    
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const handleDateSelect = (day: Date) => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const date = String(day.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${date}`;
        onChange(formattedDate);
    };
    
    const changeMonth = (delta: number) => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + delta, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setDisplayDate(today);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const date = String(today.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${date}`);
    }
    
    const handleClear = () => {
        onChange('');
    }

    return (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 w-80">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"><ChevronLeftIcon className="w-5 h-5"/></button>
                <span className="font-semibold text-slate-800">{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-500 font-medium mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) return <div key={`pad-${index}`}></div>;
                    const dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const isSelected = value === dayString;
                    const isToday = new Date().toDateString() === day.toDateString();
                    return (
                        <button 
                            key={dayString} 
                            onClick={() => handleDateSelect(day)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${
                                isSelected ? 'bg-blue-600 text-white font-semibold' : 
                                isToday ? 'bg-blue-100 text-blue-700' : 
                                'hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            {day.getDate()}
                        </button>
                    )
                })}
            </div>
             <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200">
                <button onClick={handleClear} className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1">Clear</button>
                <button onClick={handleToday} className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1">Today</button>
            </div>
        </div>
    );
};

interface TimePickerProps {
    value: string; // HH:MM
    onChange: (time: string) => void;
    onClose: () => void;
}
  
const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, onClose }) => {
    const [hour, minute] = value ? value.split(':').map(Number) : [null, null];
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hourRef.current && hour !== null) {
            const selectedHourElement = hourRef.current.children[hour] as HTMLElement;
            if (selectedHourElement) {
                selectedHourElement.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
        if (minuteRef.current && minute !== null) {
            const selectedMinuteElement = minuteRef.current.children[minute] as HTMLElement;
            if (selectedMinuteElement) {
                selectedMinuteElement.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [hour, minute]);

    const handleHourSelect = (h: number) => {
        const newHour = String(h).padStart(2, '0');
        const currentMinute = value ? value.split(':')[1] : '00';
        onChange(`${newHour}:${currentMinute}`);
    };

    const handleMinuteSelect = (m: number) => {
        const currentHour = value ? value.split(':')[0] : '12';
        const newMinute = String(m).padStart(2, '0');
        onChange(`${currentHour}:${newMinute}`);
        onClose();
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    return (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-10 flex h-48">
            <div ref={hourRef} className="w-16 overflow-y-scroll">
                {hours.map((h, i) => (
                    <button
                        key={h}
                        onClick={() => handleHourSelect(i)}
                        className={`w-full text-center p-1 rounded-md text-sm ${hour === i ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
                    >
                        {h}
                    </button>
                ))}
            </div>
            <div ref={minuteRef} className="w-16 overflow-y-scroll">
                {minutes.map((m, i) => (
                    <button
                        key={m}
                        onClick={() => handleMinuteSelect(i)}
                        className={`w-full text-center p-1 rounded-md text-sm ${minute === i ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>
    );
};


const EventsView: React.FC<EventsViewProps> = ({ events, setEvents }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [title, setTitle] = useState('');
    const [eventType, setEventType] = useState<EventType>('meeting');
    const [allDay, setAllDay] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
    const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
    const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

    const startDateRef = useRef<HTMLDivElement>(null);
    const endDateRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<HTMLDivElement>(null);
    const endTimeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (startDateRef.current && !startDateRef.current.contains(target)) setIsStartDatePickerOpen(false);
            if (endDateRef.current && !endDateRef.current.contains(target)) setIsEndDatePickerOpen(false);
            if (startTimeRef.current && !startTimeRef.current.contains(target)) setIsStartTimePickerOpen(false);
            if (endTimeRef.current && !endTimeRef.current.contains(target)) setIsEndTimePickerOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const resetForm = () => {
        setTitle(''); setEventType('meeting'); setAllDay(false);
        setStartDate(''); setStartTime(''); setEndDate(''); setEndTime('');
        setLocation(''); setDescription('');
        setEditingEvent(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    
    const openEditModal = (event: Event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setEventType(event.eventType);
        setAllDay(event.allDay);
        setStartDate(event.startDate);
        setStartTime(event.startTime);
        setEndDate(event.endDate || '');
        setEndTime(event.endTime || '');
        setLocation(event.location || '');
        setDescription(event.description || '');
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = () => {
        if (title.trim() && startDate && (allDay || startTime)) {
            const specialEventTypes: EventType[] = ['birthday', 'anniversary', 'important-date'];
            const isCelebration = specialEventTypes.includes(eventType);
            
            const eventData = {
                title, eventType, allDay, startDate, startTime,
                endDate: endDate || undefined,
                endTime: endTime || undefined,
                location: location || undefined,
                description: description || undefined,
                celebration: isCelebration,
            };

            if (editingEvent) {
                setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e)
                    .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
            } else {
                const newEvent: Event = {
                    id: Date.now().toString(),
                    ...eventData,
                };
                setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
            }
            handleCloseModal();
        }
    };
    
    const deleteEvent = (id: string) => {
        setEvents(events.filter(event => event.id !== id));
    };

    const filteredEvents = events.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const standardEventTypes: {label: string, value: EventType}[] = [{label: 'Meeting', value: 'meeting'}, {label: 'Appointment', value: 'appointment'}, {label: 'Reminder', value: 'reminder'}, {label: 'Other', value: 'other'}];
    const specialEventTypes: {label: string, value: EventType, icon: React.ReactElement}[] = [
        {label: 'Birthday', value: 'birthday', icon: <CakeIcon className="w-4 h-4 mr-2" />}, 
        {label: 'Anniversary', value: 'anniversary', icon: <HeartIcon className="w-4 h-4 mr-2" />}, 
        {label: 'Important Date', value: 'important-date', icon: <StarIcon className="w-4 h-4 mr-2" />}
    ];
    
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    
    const inputStyles = "w-full bg-white p-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none";
    const dateTimeInputStyles = "w-full bg-white cursor-pointer pl-3 pr-10 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Calendar</h2>
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add Event</span>
                </button>
            </div>
             <div className="relative mb-4">
                <input 
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-4">
                {filteredEvents.map(event => (
                    <div key={event.id} onClick={() => openEditModal(event)} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors">
                        <div>
                            <p className="font-bold text-lg text-slate-800">{event.title}</p>
                            <p className="text-slate-600">{new Date(event.startDate).toDateString()} at {event.startTime}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }} className="text-slate-400 hover:text-red-500">
                           <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>

            {events.length === 0 && <p className="text-slate-500 text-center mt-8">No events scheduled. Add one to stay organized.</p>}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEvent ? 'Edit Event' : 'Add New Event'}>
                <div className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className={inputStyles} />
                    <div>
                         <p className="text-sm font-medium text-slate-700 mb-2">Event Type</p>
                         <div className="grid grid-cols-4 gap-2">
                             {standardEventTypes.map(opt => <button key={opt.value} onClick={() => setEventType(opt.value)} className={`p-2 rounded-md border text-xs sm:text-sm transition-colors ${eventType === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-100 border-slate-300'}`}>{opt.label}</button>)}
                         </div>
                         <div className="grid grid-cols-3 gap-2 mt-2">
                             {specialEventTypes.map(opt => <button key={opt.value} onClick={() => setEventType(opt.value)} className={`p-2 rounded-md border text-xs sm:text-sm transition-colors flex items-center justify-center ${eventType === opt.value ? 'bg-pink-500 text-white border-pink-500' : 'bg-white hover:bg-slate-100 border-slate-300'}`}>{opt.icon}{opt.label}</button>)}
                         </div>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} id="all-day" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="all-day" className="ml-2 text-sm text-slate-700">All day event</label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative" ref={startDateRef}>
                           <input
                                readOnly
                                type="text"
                                value={formatDateForDisplay(startDate)}
                                onClick={() => setIsStartDatePickerOpen(p => !p)}
                                placeholder="dd-mm-yyyy"
                                className={dateTimeInputStyles}
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                           {isStartDatePickerOpen && <DatePicker value={startDate} onChange={(date) => { setStartDate(date); setIsStartDatePickerOpen(false); }} />}
                        </div>

                        {!allDay && (
                            <div className="relative" ref={startTimeRef}>
                                 <input
                                    readOnly
                                    type="text"
                                    value={startTime}
                                    onClick={() => setIsStartTimePickerOpen(p => !p)}
                                    placeholder="--:--"
                                    className={dateTimeInputStyles}
                                />
                                <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                {isStartTimePickerOpen && <TimePicker value={startTime} onChange={setStartTime} onClose={() => setIsStartTimePickerOpen(false)} />}
                            </div>
                        )}
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                         <div className="relative" ref={endDateRef}>
                            <input
                                readOnly
                                type="text"
                                value={formatDateForDisplay(endDate)}
                                onClick={() => setIsEndDatePickerOpen(p => !p)}
                                placeholder="dd-mm-yyyy"
                                className={dateTimeInputStyles}
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            {isEndDatePickerOpen && <DatePicker value={endDate} onChange={(date) => { setEndDate(date); setIsEndDatePickerOpen(false); }} />}
                         </div>
                        {!allDay && (
                            <div className="relative" ref={endTimeRef}>
                                <input
                                    readOnly
                                    type="text"
                                    value={endTime}
                                    onClick={() => setIsEndTimePickerOpen(p => !p)}
                                    placeholder="--:--"
                                    className={dateTimeInputStyles}
                                />
                                <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                {isEndTimePickerOpen && <TimePicker value={endTime} onChange={setEndTime} onClose={() => setIsEndTimePickerOpen(false)} />}
                            </div>
                        )}
                    </div>
                     <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (Optional)" className={inputStyles} />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" rows={3} className={inputStyles} />
                    <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        {editingEvent ? 'Update Event' : 'Add Event'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default EventsView;