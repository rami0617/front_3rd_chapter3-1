import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

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
    description: '설명 1',
    location: '위치 1',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
];

describe('useEventOperations - 이벤트 CRUD', () => {
  beforeEach(() => {
    setupMockHandlerCreation(initialEvents);
  });

  it('초기 이벤트 데이터를 정확히 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });
  });

  it('새로운 이벤트를 추가하고 리스트에 저장한다', async () => {
    const newEvent: Event = {
      id: '2',
      title: '추가된 이벤트',
      date: '2024-07-05',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 이벤트 설명',
      location: '위치 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(newEvent);
    });
  });

  it('이벤트 정보를 수정하고 변경사항이 리스트에 반영된다', async () => {
    const updatedEvent: Event = {
      ...initialEvents[0],
      title: '업데이트된 이벤트',
      endTime: '12:00',
    };

    setupMockHandlerUpdating(initialEvents);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const updated = result.current.events.find((event) => event.id === updatedEvent.id);
      expect(updated?.title).toBe(updatedEvent.title);
      expect(updated?.endTime).toBe(updatedEvent.endTime);
    });
  });

  it('존재하는 이벤트를 삭제하고 리스트에서 제거한다', async () => {
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });
  });
});

describe('useEventOperations - Toast 알림', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패' 메시지를 표시한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json('Failed to fetch', { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패' 메시지를 표시한다", async () => {
    setupMockHandlerUpdating();

    const nonExistentEvent: Event = {
      id: '999',
      title: '존재하지 않는 이벤트',
      date: '2024-07-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '존재하지 않는 설명',
      location: '어딘가',
      category: '오류',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패' 메시지를 표시한다", async () => {
    setupMockHandlerDeletion();

    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});
