import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';
import { useSearch } from '../../../hooks/useSearch.ts';
import { useEventOperations } from '../../../hooks/useEventOperations.ts';
import { useEventForm } from '../../../hooks/useEventForm.ts';
import { useCalendarView } from '../../../hooks/useCalendarView.ts';
import EventCard from './EventCard.tsx';

const EventSearchBar = () => {
  const { editingEvent, setEditingEvent } = useEventForm();

  const { view, currentDate } = useCalendarView();

  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => <EventCard event={event} key={event.id} />)
      )}
    </VStack>
  );
};

export default EventSearchBar;
