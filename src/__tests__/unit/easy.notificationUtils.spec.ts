import { expect } from 'vitest';

import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
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
      notificationTime: 10,
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
      notificationTime: 5,
    },
    {
      id: '3',
      title: '스크럼',
      date: '2024-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: 'Description 3',
      location: 'Location 3',
      category: 'Meeting',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2024-10-01T09:50:00'), [])).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, new Date('2024-10-01T09:50:00'), ['1'])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2024-10-01T09:30:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2024-10-01T10:15:00'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
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
    notificationTime: 10,
  };

  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(event)).toBe('10분 후 회의 일정이 시작됩니다.');
  });
});
