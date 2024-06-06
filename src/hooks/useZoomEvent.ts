import { useCallback, useEffect, useState } from 'react';
import zoomSdk, {
  ConfigResponse,
  OnWaitingRoomParticipantJoinEvent,
} from '@zoom/appssdk';



export function useZoomEvent(config?: ConfigResponse) {
  const [
    onWaitingRoomParticipantJoinEvent,
    setOnWaitingRoomParticipantJoinEvent,
  ] = useState<OnWaitingRoomParticipantJoinEvent>();

  const admitParticipantFromWaitingRoom = useCallback(
    async (participantUUID: string) => {
      try {
        const response = await zoomSdk.admitParticipantFromWaitingRoom({
          participantUUID,
        });
        console.log('admitParticipantFromWaitingRoom => ', response);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  useEffect(() => {
    if (!config) {
      console.warn('No config provided.');
      return;
    }
    zoomSdk.onWaitingRoomParticipantJoin(async (event) => {
      if (event.participant.action === 'joinMeeting') {
        setOnWaitingRoomParticipantJoinEvent(event);
        await admitParticipantFromWaitingRoom(event.participant.participantUUID);
      }
    });
  }, [admitParticipantFromWaitingRoom, config]);

  return {
    onWaitingRoomParticipantJoinEvent,
  };
}
