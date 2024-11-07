import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { Event } from '../../entities/event/model/type.ts';
import { createNotificationMessage } from '../../entities/notification/lib/notificationUtils.ts';
import { useNotifications } from '../../features/notification/model/useNotifications.ts';

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
    startTime: '11:00',
    endTime: '12:00',
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
    startTime: '12:00',
    endTime: '13:00',
    description: 'Description 1',
    location: 'Location 1',
    category: 'Work',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    act(() => {
      result.current.setNotifications([
        { id: events[0].id, message: createNotificationMessage(events[0]) },
      ]);
    });

    const message = createNotificationMessage(events[0]);

    act(() => {
      expect(result.current.notifications).toEqual([{ id: events[0].id, message: message }]);
    });
  });

  it('index를 기준으로 알림을 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      events.map((event) => {
        result.current.setNotifications((prev) => [
          ...prev,
          { id: event.id, message: createNotificationMessage(event) },
        ]);
      });
    });

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications.length).toBe(events.length - 1);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      result.current.setNotifications([
        { id: events[0].id, message: createNotificationMessage(events[0]) },
      ]);
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(result.current.notifications).toEqual([
      { id: events[0].id, message: createNotificationMessage(events[0]) },
    ]);
  });
});
