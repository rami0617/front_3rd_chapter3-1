import { Box, Flex } from '@chakra-ui/react';

import EventEditor from '../features/event/ui/EventEditor.tsx';
import CalendarView from '../features/calendar/ui/CalendarView.tsx';
import EventSearchBar from '../features/event/ui/EventSearchBar.tsx';
import NotificationMessage from '../features/notification/ui/NotificationMessage.tsx';
import NotificationDialog from '../features/notification/ui/NotificationDialog.tsx';

const CalendarPage = () => {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventEditor />
        <CalendarView />
        <EventSearchBar />
      </Flex>

      <NotificationDialog />
      <NotificationMessage />
    </Box>
  );
};

export default CalendarPage;
