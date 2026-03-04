// DISABLED: File display not needed for text-only chat
// This component has been disabled as part of performance optimization
// To re-enable: uncomment this file and update Elements/index.tsx

/*
import { type IFileElement } from '@chainlit/react-client';

import { Attachment } from '@/components/chat/MessageComposer/Attachment';

const FileElement = ({ element }: { element: IFileElement }) => {
  if (!element.url) {
    return null;
  }

  return (
    <a
      className={`${element.display}-file no-underline`}
      download={element.name}
      href={element.url}
      target="_blank"
    >
      <Attachment name={element.name} mime={element.mime!} />
    </a>
  );
};

export { FileElement };
*/

// Export a placeholder to maintain type compatibility
export const FileElement = () => null;
