import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { expect } from 'vitest';
import { formatWeek } from '../../utils/dateUtils.ts';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트',
      date: '2024-07-02',
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
      title: 'DANCETIME',
      date: '2024-07-05',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Description 1',
      location: 'Location 1',
      category: 'Work',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '이벤트3',
      date: '2024-07-20',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Description 1',
      location: 'Location 1',
      category: 'Work',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    },
  ];

  const currentDate = new Date('2024-07-05');

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvent = events.filter((event) => event.title === '이벤트 2');

    expect(getFilteredEvents(events, '이벤트 2', new Date('2024-10-01'), 'month')).toEqual(filteredEvent);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    expect(formatWeek(currentDate)).toBe('2024년 7월 1주');

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    expect(getFilteredEvents(events, '', new Date(currentDate), 'week')).toEqual(weekEvents);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvent = events.filter((event) => new Date(event.date).getMonth() + 1 === 7);

    expect(getFilteredEvents(events, '', new Date(currentDate), 'month')).toEqual(filteredEvent);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(formatWeek(currentDate)).toBe('2024년 7월 1주');

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    const filteredEvent = weekEvents.filter((event) => event.title === '이벤트');

    expect(getFilteredEvents(events, '이벤트', new Date(currentDate), 'week')).toEqual(filteredEvent);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date(currentDate), 'month')).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvent = events.filter(
      (event) => event.title === 'dancetime'.toUpperCase() || event.title === 'dancetime',
    );

    expect(getFilteredEvents(events, 'dancetime', new Date(currentDate), 'month')).toEqual(filteredEvent);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2024-07-01');

    expect(formatWeek(currentDate)).toBe('2024년 7월 1주');

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    expect(getFilteredEvents(events, '', new Date(currentDate), 'week')).toEqual(weekEvents);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date(currentDate), 'week')).toEqual([]);
  });
});
