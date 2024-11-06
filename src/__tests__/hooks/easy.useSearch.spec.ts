import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

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
const currentDate = new Date('2024-10-02');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm(events[0].title);
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm(events[1].id);
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: monthResult } = renderHook(() => useSearch(events, currentDate, 'month'));

  const monthEvents = events.filter(
    (event) => new Date(event.date).getMonth() + 1 === currentDate.getMonth() + 1
  );
  expect(monthResult.current.filteredEvents).toEqual(monthEvents);

  const { result: weekResult } = renderHook(() => useSearch(events, currentDate, 'week'));

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });

  expect(weekResult.current.filteredEvents).toEqual(weekEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-10-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');

  const firstFilteredEvents = events.filter((event) => event.title === '회의');
  expect(result.current.filteredEvents).toEqual(firstFilteredEvents);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  const secondFilteredEvents = events.filter((event) => event.title === '점심');
  expect(result.current.filteredEvents).toEqual(secondFilteredEvents);
});
