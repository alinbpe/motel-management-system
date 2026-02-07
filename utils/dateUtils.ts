
import jalaali from 'jalaali-js';

export const toJalaali = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return j;
};

export const toJalaaliString = (date: Date | string) => {
  const { jy, jm, jd } = toJalaali(date);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
};

export const fromJalaaliToDate = (jy: number, jm: number, jd: number) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
};

export const getTodayJalaali = () => {
  const now = new Date();
  return toJalaali(now);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return toJalaaliString(dateString);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  return `${toJalaaliString(d)} - ${time}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
