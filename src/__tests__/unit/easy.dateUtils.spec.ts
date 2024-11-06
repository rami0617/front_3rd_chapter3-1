import { expect } from 'vitest';

import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

const events: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Description 1',
    location: 'Location 1',
    category: 'Work',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '점심',
    date: '2024-10-02',
    startTime: '12:00',
    endTime: '13:00',
    description: 'Description 2',
    location: 'Location 2',
    category: 'Meeting',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '스크럼',
    date: '2024-10-28',
    startTime: '14:00',
    endTime: '15:00',
    description: 'Description 3',
    location: 'Location 3',
    category: 'Meeting',
    repeat: { type: 'monthly', interval: 1 },
    notificationTime: 10,
  },
];

describe('getDaysInMonth', () => {
  it('1월은 31일 일수를 반환한다', () => {
    const date = getDaysInMonth(2024, 1);

    expect(date).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const date = getDaysInMonth(2024, 4);

    expect(date).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const date = getDaysInMonth(2024, 2);

    expect(date).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    //TODO 하드코딩 안하는 방법으로 변경
    const date = getDaysInMonth(2023, 2);

    expect(date).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const date = getDaysInMonth(2024, 22);

    expect(date).toBe(31);
  });
});

describe('getWeekDates', () => {
  const expectedWeekDates = [
    new Date('2024-09-29'),
    new Date('2024-09-30'),
    new Date('2024-10-01'),
    new Date('2024-10-02'),
    new Date('2024-10-03'),
    new Date('2024-10-04'),
    new Date('2024-10-05'),
  ];

  const lastDayOfYearWeekDate = [
    new Date('2024-12-29'),
    new Date('2024-12-30'),
    new Date('2024-12-31'),
    new Date('2025-01-01'),
    new Date('2025-01-02'),
    new Date('2025-01-03'),
    new Date('2025-01-04'),
  ];

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = new Date('2024-10-02');

    expect(getWeekDates(weekDates)).toEqual(expectedWeekDates);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2024-09-30');

    expect(getWeekDates(monday)).toEqual(expectedWeekDates);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2024-09-29');

    expect(getWeekDates(sunday)).toEqual(expectedWeekDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDayOfYear = new Date('2024-12-30');

    expect(getWeekDates(lastDayOfYear)).toEqual(lastDayOfYearWeekDate);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const firstDayOfYear = new Date('2025-01-01');

    expect(getWeekDates(firstDayOfYear)).toEqual(lastDayOfYearWeekDate);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const week = [
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ];

    expect(getWeekDates(new Date('2024-02-29'))).toEqual(week);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date('2024-09-29'))).toEqual(expectedWeekDates);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2024-07-01'));

    expect(weeks[0]).toEqual([null, 1, 2, 3, 4, 5, 6]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const event = getEventsForDay(events, 1);

    const filteredEvents = events.filter((event) => new Date(event.date).getDate() === 1);

    expect(event).toEqual(filteredEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const event = getEventsForDay(events, 15);

    expect(event).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const event = getEventsForDay(events, 0);

    expect(event).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const event = getEventsForDay(events, 32);

    expect(event).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-11-15'));

    expect(week).toBe('2024년 11월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const firstWeek = formatWeek(new Date('2024-11-05'));

    expect(firstWeek).toBe('2024년 11월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastWeek = formatWeek(new Date('2024-10-31'));

    expect(lastWeek).toBe('2024년 10월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastWeek = formatWeek(new Date('2024-12-30'));

    expect(lastWeek).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastWeek = formatWeek(new Date('2024-02-28'));

    expect(lastWeek).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastWeek = formatWeek(new Date('2023-02-28'));

    expect(lastWeek).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2024-07-10'))).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-01'), rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-31'), rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2024-06-30'), rangeStart, rangeEnd)).toBeFalsy();
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2024-08-01'), rangeStart, rangeEnd)).toBeFalsy();
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2024-08-01'), new Date('2024-08-14'), new Date('2024-08-13'))
    ).toBeFalsy();
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(2)).toBe('02');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 1)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2024-11-03'))).toBe('2024-11-03');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date('2024-11-03'), 10)).toBe('2024-11-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2024-01-11'))).toBe('2024-01-11');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2024-10-01'))).toBe('2024-10-01');
  });
});
