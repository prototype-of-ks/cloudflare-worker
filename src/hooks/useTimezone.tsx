import { useEffect, useMemo, useState } from 'react';
import moment from 'moment-timezone';

export function useTimezone() {
  const [timeZone] = useState<string>(moment.tz.guess());
  const [localTime, setLocalTime] = useState<string>();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 组件卸载时清除定时器
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!timeZone) {
      console.warn('Cannot get timeZone!');
      return;
    }
    const localTime = moment().tz(timeZone).format('HH:mm:ss');
    console.log('localTime: ', localTime);
    setLocalTime(localTime);
  }, [timeZone]);

  const TimeNode = useMemo(() => {
    return <span>{currentTime.toLocaleTimeString()}</span>
  }, [currentTime]);

  return {
    timeZone,
    localTime,
    currentTime,
    TimeNode
  };
}
