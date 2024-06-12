import React from 'react';
import { Card } from '../ui/card';

const MeetingMode: React.FC = () => {
  return (
    <div className="flex flex-col flex-wrap gap-2 mt-4">
      <Card className="flex flex-col gap-4 w-[280px] p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 justify-start">
            <span className="w-24 h-16 text-[36px] rounded-lg bg-[#e8f9f5] text-[#19c79f]  inline-flex items-center justify-center">
              6/6
            </span>
          </div>
          <span className="text-[16px] font-bold text-left">
            Joined Participants
          </span>
        </div>
      </Card>

      <div className="my-4">
        <div className="flex flex-col gap-2 bg-[#FAD2B4] opacity-89 rounded-md p-4">
          <span className="bg-[#cc8634] px-2 rounded-2xl inline-flex text-white w-[48px]">
            Tips
          </span>
          <span className="text-left">
            Click Render button to Draw Webview in Camera Mode.
          </span>
        </div>
      </div>
      {/* <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 justify-start">
            <span className="w-24 h-16 text-[36px] rounded-lg bg-[#fdf6ed] text-[#efa54e] inline-flex items-center justify-center">
              4/6
            </span>
          </div>
          <span className="text-[16px] font-bold">
            Joined AI Companion Participants
          </span>
        </div>
      </Card> */}
    </div>
  );
};

export default MeetingMode;
