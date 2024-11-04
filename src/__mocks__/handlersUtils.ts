import { Event } from '../types';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

let events: Event[] = [
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

export const setupMockHandlerCreation = async (initEvents = [] as Event[]) => {
  const eventData: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: eventData });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = (eventData.length + 1).toString();
      eventData.push(newEvent);

      return HttpResponse.json(newEvent, { status: 201 });
    }),
  );
};

export const setupMockHandlerUpdating = (updatedEvent: Event) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: events });
    }),
    http.put(`/api/events/${updatedEvent.id}`, async ({ request }) => {
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === updatedEvent.id);

      if (index !== -1) {
        events[index] = updatedEvent;
      }
      return HttpResponse.json(updatedEvent);
    }),
  );
};

export const setupMockHandlerDeletion = (eventId: string) => {
  let events: Event[] = [
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
      title: '회의',
      date: '2024-07-05',
      startTime: '10:00',
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
      startTime: '10:00',
      endTime: '11:00',
      description: 'Description 1',
      location: 'Location 1',
      category: 'Work',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: events });
    }),
    http.delete(`/api/events/${eventId}`, () => {
      events = events.filter((event) => event.id !== eventId);
      return new HttpResponse(null, { status: 204 });
    }),
  );
};

export const resetEventsData = () => {
  events = [
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
};
