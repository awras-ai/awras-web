import { cn, isRTLText } from '@/lib/utils';
import { PropsWithChildren, useMemo } from 'react';

import type { IStep } from '@chainlit/react-client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Translator } from 'components/i18n';

interface Props {
  step: IStep;
  isRunning?: boolean;
  isRTL?: boolean;
}

export default function Step({
  step,
  children,
  isRunning,
  isRTL: propIsRTL
}: PropsWithChildren<Props>) {
  const using = useMemo(() => {
    return isRunning && step.start && !step.end && !step.isError;
  }, [step, isRunning]);

  const isRTL = useMemo(() => {
    if (propIsRTL !== undefined) return propIsRTL;
    // Check output first, then input for RTL detection
    const text = step.output || step.input;
    return isRTLText(text);
  }, [propIsRTL, step.output, step.input]);

  const hasContent = step.input || step.output || step.steps?.length;
  const isError = step.isError;
  const stepName = step.name;

  // If there's no content, just render the status without accordion
  if (!hasContent) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'flex flex-col flex-grow w-0',
          isRTL && 'text-right'
        )}
      >
        <p
          className={cn(
            'flex items-center gap-1 font-medium',
            isError && 'text-red-500',
            !using && 'text-muted-foreground',
            using && 'loading-shimmer'
          )}
          id={`step-${stepName}`}
        >
          {using ? (
            <>
              <Translator path="chat.messages.status.using" /> {stepName}
            </>
          ) : (
            <>
              <Translator path="chat.messages.status.used" /> {stepName}
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        'flex flex-col flex-grow w-0',
        isRTL && 'text-right'
      )}
    >
      <Accordion
        type="single"
        collapsible
        defaultValue={step.defaultOpen ? step.id : undefined}
        className="w-full"
      >
        <AccordionItem value={step.id} className="border-none">
          <AccordionTrigger
            className={cn(
              'flex items-center gap-1 justify-start transition-none p-0 hover:no-underline',
              isError && 'text-red-500',
              !using && 'text-muted-foreground hover:text-foreground',
              using && 'loading-shimmer'
            )}
            id={`step-${stepName}`}
          >
            {using ? (
              <>
                <Translator path="chat.messages.status.using" /> {stepName}
              </>
            ) : (
              <>
                <Translator path="chat.messages.status.used" /> {stepName}
              </>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className={cn(
                'flex-grow mt-4 border-primary',
                isRTL
                  ? 'mr-1 pr-4 border-r-2 text-right'
                  : 'ml-1 pl-4 border-l-2'
              )}
            >
              {children}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
