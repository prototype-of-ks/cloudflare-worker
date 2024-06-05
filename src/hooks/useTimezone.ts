import { useEffect, useState } from 'react';
import moment from 'moment-timezone';

export function useTimezone() {
  const [timeZone] = useState<string>(moment.tz.guess());
  const [localTime, setLocalTime] = useState<string>();

  useEffect(() => {
    if (!timeZone) {
      console.warn('Cannot get timeZone!');
      return;
    }
    const localTime = moment().tz(timeZone).format('HH:mm:ss');
    console.log('localTime: ', localTime);
    setLocalTime(localTime);
  }, [timeZone]);

  return {
    timeZone,
    localTime
  };
}
