// DISABLED: PDF viewing not needed for text-only chat
// This component has been disabled as part of performance optimization
// To re-enable: uncomment this file and update Elements/index.tsx

/*
import { type IPdfElement } from "@chainlit/react-client";

interface Props {
  element: IPdfElement;
}

const PDFElement = ({ element }: Props) => {
  if (!element.url) {
    return null;
  }
  const url = element.page
    ? `${element.url}#page=${element.page}`
    : element.url;
  return (
    <iframe
      className={`${element.display}-pdf h-full w-full border-none`}
      src={url}
    ></iframe>
  );
};

export { PDFElement };
*/

// Export a placeholder to maintain type compatibility
export const PDFElement = () => null;
