import { cn } from '@/lib/utils';

import type { ElementType, IMessageElement } from '@chainlit/react-client';

import { InlinedCustomElementList } from './InlineCustomElementList';
// DISABLED: Media components not needed for text-only chat
// import { InlinedAudioList } from './InlinedAudioList';
// import { InlinedDataframeList } from './InlinedDataframeList';
// import { InlinedFileList } from './InlinedFileList';
// import { InlinedImageList } from './InlinedImageList';
// import { InlinedPDFList } from './InlinedPDFList';
// import { InlinedPlotlyList } from './InlinedPlotlyList';
import { InlinedTextList } from './InlinedTextList';
// import { InlinedVideoList } from './InlinedVideoList';

interface Props {
  elements: IMessageElement[];
  className?: string;
}

const InlinedElements = ({ elements, className }: Props) => {
  if (!elements.length) {
    return null;
  }

  /**
   * Categorize the elements by element type
   * The TypeScript dance is needed to make sure we can do elementsByType.image
   * and get an array of IImageElement.
   */
  const elementsByType = elements.reduce(
    (acc, el: IMessageElement) => {
      if (!acc[el.type]) {
        acc[el.type] = [];
      }
      const array = acc[el.type] as Extract<
        IMessageElement,
        { type: typeof el.type }
      >[];
      array.push(el);
      return acc;
    },
    {} as {
      [K in ElementType]: Extract<IMessageElement, { type: K }>[];
    }
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {elementsByType.custom?.length ? (
        <InlinedCustomElementList items={elementsByType.custom} />
      ) : null}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.image?.length ? (
        <InlinedImageList items={elementsByType.image} />
      ) : null} */}
      {elementsByType.text?.length ? (
        <InlinedTextList items={elementsByType.text} />
      ) : null}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.pdf?.length ? (
        <InlinedPDFList items={elementsByType.pdf} />
      ) : null} */}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.audio?.length ? (
        <InlinedAudioList items={elementsByType.audio} />
      ) : null} */}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.video?.length ? (
        <InlinedVideoList items={elementsByType.video} />
      ) : null} */}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.file?.length ? (
        <InlinedFileList items={elementsByType.file} />
      ) : null} */}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.plotly?.length ? (
        <InlinedPlotlyList items={elementsByType.plotly} />
      ) : null} */}
      {/* DISABLED: Media elements not supported in text-only chat */}
      {/* {elementsByType.dataframe?.length ? (
        <InlinedDataframeList items={elementsByType.dataframe} />
      ) : null} */}
    </div>
  );
};

export { InlinedElements };
