import { ConfigResponse } from '@zoom/appssdk';
import zoomSdk from '@zoom/appssdk';
import { useCallback, useEffect, useState } from 'react';

export function useZoomContext(config?: ConfigResponse) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [meetingUUID, setMeetingUUID] = useState<string>();

  const getMeetingLanguages = useCallback(async () => {
    try {
      const { languages } = await zoomSdk.getMeetingLanguages();
      setLanguages(languages);
    } catch (e) {
      console.error('getMeetingLanguages::error => ', e);
    }
  }, []);

  const getMeetingUUID = useCallback(async () => {
    const { meetingUUID } = await zoomSdk.getMeetingUUID();
    setMeetingUUID(meetingUUID);
  }, [])

  useEffect(() => {
    (async () => {
      if (config) {
        await getMeetingLanguages();
        await getMeetingUUID();
      }
    })();
  }, [config, getMeetingLanguages, getMeetingUUID]);

  return {
    languages,
    meetingUUID,
    getMeetingUUID,
    getMeetingLanguages,
  };
}
