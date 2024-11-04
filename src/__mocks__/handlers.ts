import { http } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ events }));
  }),

  http.post('/api/events', async (req, res, ctx) => {
    const newEvent = (await req.json()) as Event;
    newEvent.id = (events.length + 1).toString();

    return res(ctx.status(200), ctx.json(newEvent));
  }),

  http.put('/api/events/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updatedEvent = (await req.json()) as Event;

    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'not found event' }));
    }

    events[eventIndex] = updatedEvent;

    return res(ctx.status(200), ctx.json(events));
  }),

  http.delete('/api/events/:id', (req, res, ctx) => {
    const { id } = req.params;

    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'not found event' }));
    }

    return res(ctx.status(200), ctx.json({ message: 'delete success' }));
  }),
];
