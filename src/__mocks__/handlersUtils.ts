import { http, HttpResponse } from 'msw';

import { Event } from '../entities/event/model/type.ts';
import { server } from '../setupTests';

// ? Medium: 아래 여러가지 use 함수는 어떤 역할을 할까요? 어떻게 사용될 수 있을까요?
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const initialEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: initialEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = (initialEvents.length + 1).toString();
      initialEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: initEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const eventIndex = initEvents.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      initEvents = initEvents.map((event) => (event.id === id ? (updatedEvent as Event) : event));

      return HttpResponse.json(updatedEvent);
    })
  );
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: initEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const eventIndex = initEvents.findIndex((event) => event.id === id);

      initEvents.splice(eventIndex, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
