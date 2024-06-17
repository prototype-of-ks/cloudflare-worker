import React from 'react';
import { RunningContext, GetUserContextResponse } from '@zoom/appssdk';
import { useDev } from '../../hooks/useDev';
import { useTimezone } from '../../hooks/useTimezone';
import './style.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ImmersiveModeProps {
  runningContext?: RunningContext;
  userContext?: GetUserContextResponse;
}

const ImmersiveMode: React.FC<ImmersiveModeProps> = ({
  runningContext,
  userContext,
}) => {
  const { isDev } = useDev();
  const { timeZone, TimeNode } = useTimezone();

  return (
    (runningContext === 'inImmersive' || isDev) && (
      <div className="immersive-app-wrapper">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Context</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Meeting & User Context</DialogTitle>
              <DialogDescription>
                You can view meeting and user context here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Meeting Id</Label>
                <span>{userContext?.screenName || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Meeting Language</Label>
                <span>Eng</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Meeting Name</Label>
                <span>{userContext?.screenName || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Meeting Role</Label>
                <span>{userContext?.role || 'host'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Timezone</Label>
                <span>{timeZone || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Local Time</Label>
                {TimeNode}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Audio State</Label>
                <span>Muted</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Video State</Label>
                <span>Opened</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-2 text-left">Browser</Label>
                <span>Gecko</span>
              </div>
            </div>
            {/* <DialogFooter>
              <Button type="submit">Got it</Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </div>
    )
  );
};

export default ImmersiveMode;
