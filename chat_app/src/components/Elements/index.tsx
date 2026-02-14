import type { IMessageElement } from '@chainlit/react-client';

// DISABLED: Media components not needed for text-only chat
// import { AudioElement } from './Audio';
import CustomElement from './CustomElement';
// import { FileElement } from './File';
// import { ImageElement } from './Image';
// import { LazyDataframe } from './LazyDataframe';
// import { PDFElement } from './PDF';
// import { PlotlyElement } from './Plotly';
import { TextElement } from './Text';
// import { VideoElement } from './Video';

interface ElementProps {
  element?: IMessageElement;
}

const Element = ({ element }: ElementProps): JSX.Element | null => {
  switch (element?.type) {
    // DISABLED: Media types not supported in text-only chat
    // case 'file':
    //   return <FileElement element={element} />;
    // case 'image':
    //   return <ImageElement element={element} />;
    case 'text':
      return <TextElement element={element} />;
    // DISABLED: PDF viewing not needed for text-only chat
    // case 'pdf':
    //   return <PDFElement element={element} />;
    // DISABLED: Audio playback not needed for text-only chat
    // case 'audio':
    //   return <AudioElement element={element} />;
    // DISABLED: Video playback not needed for text-only chat
    // case 'video':
    //   return <VideoElement element={element} />;
    // DISABLED: Charts not needed for text-only chat
    // case 'plotly':
    //   return <PlotlyElement element={element} />;
    // DISABLED: Dataframes not needed for text-only chat
    // case 'dataframe':
    //   return <LazyDataframe element={element} />;
    case 'custom':
      return <CustomElement element={element} />;
    default:
      return null;
  }
};

export { Element };
