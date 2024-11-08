import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../entities/event/model/type.ts';
import { createNotificationMessage } from '../../entities/notification/lib/notificationUtils.ts';
import { useNotifications } from '../../features/notification/model/useNotifications.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events as Event[]));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(events as Event[]));

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
    const { result } = renderHook(() => useNotifications(events as Event[]));

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
    const { result } = renderHook(() => useNotifications(events as Event[]));

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
