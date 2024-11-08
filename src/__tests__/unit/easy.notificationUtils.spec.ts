import { expect } from 'vitest';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../entities/event/model/type.ts';
import {
  createNotificationMessage,
  getUpcomingEvents,
} from '../../entities/notification/lib/notificationUtils.ts';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events as Event[], new Date('2024-10-01T09:50:00'), [])).toEqual([
      events[0],
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events as Event[], new Date('2024-10-01T09:50:00'), ['1'])).toEqual(
      []
    );
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events as Event[], new Date('2024-10-01T09:00:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events as Event[], new Date('2024-10-01T10:15:00'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(events[0] as Event)).toBe('30분 후 회의 일정이 시작됩니다.');
  });
});
