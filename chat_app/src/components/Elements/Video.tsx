// DISABLED: Video playback not needed for text-only chat
// This component has been disabled as part of performance optimization
// To re-enable: uncomment this file, install react-player, and update Elements/index.tsx

/*
import ReactPlayer from 'react-player';

import { type IVideoElement } from '@chainlit/react-client';

const VideoElement = ({ element }: { element: IVideoElement }) => {
  if (!element.url) {
    return null;
  }

  return (
    <ReactPlayer
      className={`${element.display}-video`}
      width="100%"
      controls
      url={element.url}
      config={element.playerConfig || {}}
    />
  );
};

export { VideoElement };
*/

// Export a placeholder to maintain type compatibility
export const VideoElement = () => null;
