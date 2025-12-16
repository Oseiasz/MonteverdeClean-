import { Apartment, ScheduleItem } from '../types';

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const current = new Date(date);
  // Normalize to midnight
  current.setHours(0, 0, 0, 0);
  
  // Assuming week starts on Monday as requested (Day 1)
  // getDay() returns 0 for Sunday, 1 for Monday.
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  
  const start = new Date(current.setDate(diff));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

export const generateSchedule = (
  apartments: Apartment[],
  cycleStartDateStr: string,
  weeksToGenerate: number = 6,
  startFromDate?: Date
): ScheduleItem[] => {
  const schedule: ScheduleItem[] = [];
  const cycleStart = new Date(cycleStartDateStr);
  cycleStart.setHours(0, 0, 0, 0);

  // Use provided start date or default to today
  const referenceDate = startFromDate ? new Date(startFromDate) : new Date();
  referenceDate.setHours(0, 0, 0, 0);
  
  // Get start of the reference week
  const { start: startWeek } = getWeekRange(referenceDate);

  // Calculate offset from the absolute cycle start date
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < weeksToGenerate; i++) {
    // Calculate the start date for this iteration's week
    const weekStart = new Date(startWeek);
    weekStart.setDate(startWeek.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Calculate which apartment index it is
    const diffDays = Math.round((weekStart.getTime() - cycleStart.getTime()) / oneDay);
    const weeksPassed = Math.floor(diffDays / 7);
    
    const totalApartments = apartments.length;
    let aptIndex = weeksPassed % totalApartments;
    if (aptIndex < 0) aptIndex = totalApartments + aptIndex;

    // Check if this specific item is the actual current week relative to real today
    const realToday = new Date();
    const { start: realCurrentWeekStart } = getWeekRange(realToday);
    const isCurrentWeek = weekStart.getTime() === realCurrentWeekStart.getTime();

    schedule.push({
      startDate: weekStart,
      endDate: weekEnd,
      apartment: apartments[aptIndex],
      isCurrentWeek: isCurrentWeek,
    });
  }

  return schedule;
};

export const generatePastSchedule = (
  apartments: Apartment[],
  cycleStartDateStr: string,
  weeksBack: number = 4
): ScheduleItem[] => {
  const schedule: ScheduleItem[] = [];
  const cycleStart = new Date(cycleStartDateStr);
  cycleStart.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { start: currentWeekStart } = getWeekRange(today);
  const oneDay = 24 * 60 * 60 * 1000;

  // Loop backwards from 1 (last week) to weeksBack
  for (let i = 1; i <= weeksBack; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const diffDays = Math.round((weekStart.getTime() - cycleStart.getTime()) / oneDay);
    const weeksPassed = Math.floor(diffDays / 7);
    
    const totalApartments = apartments.length;
    let aptIndex = weeksPassed % totalApartments;
    if (aptIndex < 0) aptIndex = totalApartments + aptIndex;

    schedule.push({
      startDate: weekStart,
      endDate: weekEnd,
      apartment: apartments[aptIndex],
      isCurrentWeek: false,
    });
  }

  return schedule;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
};