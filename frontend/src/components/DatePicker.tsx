'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'date' | 'datetime-local';
    minDate?: string;
    required?: boolean;
    className?: string;
}

export default function DatePicker({
    label,
    value,
    onChange,
    type = 'date',
    minDate,
    required = false,
    className = ''
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial parsing
    const initialDate = value ? new Date(value) : new Date();
    // Handle invalid date
    const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    const [currentMonth, setCurrentMonth] = useState(validInitialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(value && !isNaN(new Date(value).getTime()) ? new Date(value) : null);

    // Time state
    const [time, setTime] = useState(() => {
        if (value && !isNaN(new Date(value).getTime())) {
            return new Date(value).toTimeString().slice(0, 5);
        }
        return '12:00';
    });

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);

        if (type === 'date') {
            // Local YYYY-MM-DD
            const offsetCall = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            onChange(offsetCall);
            setIsOpen(false);
        } else {
            // Update with current time immediately
            updateDateTime(newDate, time);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTime(newTime);
        if (selectedDate) {
            updateDateTime(selectedDate, newTime);
        }
    };

    const updateDateTime = (date: Date, timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const newDateTime = new Date(date);
        newDateTime.setHours(hours, minutes);
        // Local ISO string preservation
        const offsetCall = new Date(newDateTime.getTime() - (newDateTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        onChange(offsetCall);
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

    const renderDays = () => {
        const totalDays = daysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isSelected = selectedDate && dateToCheck.toDateString() === selectedDate.toDateString();
            const isToday = new Date().toDateString() === dateToCheck.toDateString();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`h-9 w-9 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-200 
                        ${isSelected
                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                            : isToday
                                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100'
                                : 'text-slate-700 hover:bg-slate-100'
                        }
                    `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const formatDateDisplay = (val: string) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';

        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };

        if (type === 'datetime-local') {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return d.toLocaleDateString('en-IN', options);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full cursor-pointer flex items-center justify-between rounded-xl 
                    bg-white border-2 p-3.5 transition-all duration-200
                    ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${value ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>
                        {value ? formatDateDisplay(value) : 'Select Date'}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 p-5 rounded-2xl bg-white shadow-2xl border border-slate-100 w-[340px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button type="button" onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-base font-bold text-slate-800">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-3 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-3 place-items-center">
                        {renderDays()}
                    </div>

                    {/* Time Picker Footer */}
                    {type === 'datetime-local' && (
                        <div className="mt-5 pt-5 border-t border-slate-100">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Time
                            </label>
                            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                <Clock className="w-5 h-5 text-slate-400 ml-2" />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    className="flex-1 bg-transparent border-none text-sm font-semibold text-slate-900 focus:ring-0 p-1"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
