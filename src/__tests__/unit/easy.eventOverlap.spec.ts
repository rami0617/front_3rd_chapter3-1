import { expect } from 'vitest';

import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../entities/event/lib/eventOverlap.ts';
import { Event } from '../../entities/event/model/type.ts';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2024-07-01', '14:30')).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('20110101', '14:30').toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2024-07-01', '1430').toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30').toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
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
  };

  it('일반적인 이벤트를 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(event)).toEqual({
      end: new Date('2024-10-01T11:00:00.000'),
      start: new Date('2024-10-01T10:00:00.000'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '회의',
        date: '110200',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Work',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 30,
      })
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '회의',
        date: '2024-07-01',
        startTime: '1000',
        endTime: '1100',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Work',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 30,
      })
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
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
  };

  const event2: Event = {
    id: '2',
    title: '자유시간',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Description 1',
    location: 'Location 1',
    category: 'Work',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(event1, event2)).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    event2.date = '2024-10-02';

    expect(isOverlapping(event1, event2)).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
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
      title: '자유시간',
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
      id: '3',
      title: '운동하기',
      date: '2024-10-02',
      startTime: '13:00',
      endTime: '15:00',
      description: 'Description 1',
      location: 'Location 1',
      category: 'Work',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(findOverlappingEvents(events[0], events)).toEqual([events[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    events[0].date = '2024-11-21';
    expect(findOverlappingEvents(events[0], events)).toEqual([]);
  });
});
