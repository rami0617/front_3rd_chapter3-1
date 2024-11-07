import { expect } from 'vitest';

import { fetchHolidays, HOLIDAY_RECORD } from '../../entities/calendar/api/fetchHolidays.ts';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const januaryHoliday: Record<string, string> = Object.entries(HOLIDAY_RECORD).reduce(
      (acc, [key, value]) => {
        const month = key.split('-')[1];
        if (month === '01') {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    expect(fetchHolidays(new Date('2024-01-01'))).toEqual(januaryHoliday);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    expect(fetchHolidays(new Date('2024-04-01'))).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const februaryHolidays: Record<string, string> = Object.entries(HOLIDAY_RECORD).reduce(
      (acc, [key, value]) => {
        const month = key.split('-')[1];
        if (month === '02') {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );
    expect(fetchHolidays(new Date('2024-02-01'))).toEqual(februaryHolidays);
  });
});
