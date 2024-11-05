import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  resetEventsData,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { beforeEach, describe, expect } from 'vitest';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const original = await vi.importActual('@chakra-ui/react');
  return {
    ...original,
    useToast: () => mockToast,
  };
});

const initialEvents: Event[] = [
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

describe('useEventOperations > event 등록, 수정, 삭제', () => {
  beforeEach(() => {
    resetEventsData();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    await setupMockHandlerCreation(initialEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerUpdating([initialEvents[0]]);

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(initialEvents[0]);
    });

    expect(result.current.events).toEqual(initialEvents);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const updatedEvent: Event[] = [
      {
        id: '2',
        title: 'DANCETIME',
        date: '2024-07-05',
        startTime: '10:00',
        endTime: '12:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Work',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 30,
      },
    ];

    setupMockHandlerUpdating(updatedEvent);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent({
        ...updatedEvent[0],
        title: 'hello',
      });
    });

    await waitFor(() => {
      const updated = result.current.events.find((event) => event.id === updatedEvent[0].id);
      expect(updated?.title).toBe('hello');
      expect(updated?.endTime).toBe(updatedEvent[0].endTime);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const deletedEvent: Event = {
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
    };

    setupMockHandlerDeletion(deletedEvent.id);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent(deletedEvent.id);
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(2);
      expect(result.current.events[0].id).toBe(initialEvents[1].id);
      expect(result.current.events[1].id).toBe(initialEvents[2].id);
    });
  });
});

describe('useEventOperations > toast', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json('Failed to fetch', { status: 500 });
      }),
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      }),
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(false));

    const nonExistentEvent: Event = {
      id: '999',
      title: 'Non-existent event',
      date: '2024-07-05',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Non-existent description',
      location: 'Nowhere',
      category: 'Error',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    };

    setupMockHandlerUpdating([nonExistentEvent]);

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      }),
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    server.use(
      http.delete('/api/events/:id', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      }),
    );

    setupMockHandlerDeletion('1111');

    await act(async () => {
      await result.current.deleteEvent('111');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      }),
    );
  });
});
