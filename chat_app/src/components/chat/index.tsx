import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import {
  threadHistoryState,
  useAuth,
  useChatData,
  useChatMessages,
  useConfig
} from '@chainlit/react-client';

import Alert from '@/components/Alert';
import { TaskList } from '@/components/Tasklist';
import { Translator } from 'components/i18n';
import { useTranslation } from 'components/i18n/Translator';

import { useLayoutMaxWidth } from 'hooks/useLayoutMaxWidth';

import { ErrorBoundary } from '../ErrorBoundary';
import ChatFooter from './Footer';
import MessagesContainer from './MessagesContainer';
import ScrollContainer from './ScrollContainer';
import WelcomeScreen from './WelcomeScreen';

// DISABLED: File upload functionality not needed for text-only chat
// Removed imports:
// - useUpload hook
// - uuidv4 for attachment IDs
// - attachmentsState from Recoil
// - IAttachment type

const Chat = () => {
  const { user } = useAuth();
  const { config } = useConfig();
  const setThreads = useSetRecoilState(threadHistoryState);

  const autoScrollRef = useRef(true);
  const { error, disabled, callFn } = useChatData();
  const navigate = useNavigate();

  // DISABLED: File upload functionality not needed for text-only chat
  // Removed:
  // - uploadFile from useChatInteract
  // - setAttachments from attachmentsState
  // - fileSpec useMemo
  // - onFileUpload callback
  // - onFileUploadError callback
  // - upload hook usage

  const { t } = useTranslation();
  const layoutMaxWidth = useLayoutMaxWidth();

  useEffect(() => {
    if (callFn) {
      const event = new CustomEvent('chainlit-call-fn', {
        detail: callFn
      });
      window.dispatchEvent(event);
    }
  }, [callFn]);

  // DISABLED: File upload reference not needed
  // useEffect(() => {
  //   uploadFileRef.current = uploadFile;
  // }, [uploadFile]);

  const { threadId } = useChatMessages();

  useEffect(() => {
    const currentPage = new URL(window.location.href);
    if (
      user &&
      config?.dataPersistence &&
      threadId &&
      currentPage.pathname === '/'
    ) {
      navigate(`/thread/${threadId}`);
    } else {
      setThreads((prev) => ({
        ...prev,
        currentThreadId: threadId
      }));
    }
  }, []);

  // DISABLED: File attachments not supported in text-only chat
  // const enableAttachments =
  //   !disabled && config?.features?.spontaneous_file_upload?.enabled;

  return (
    <div className="flex w-full h-full flex-col relative">
      {error ? (
        <div className="w-full mx-auto my-2">
          <Alert className="mx-2" id="session-error" variant="error">
            <Translator path="common.status.error.serverConnection" />
          </Alert>
        </div>
      ) : null}
      <ErrorBoundary>
        <ScrollContainer
          autoScrollUserMessage={config?.features?.user_message_autoscroll}
          autoScrollRef={autoScrollRef}
        >
          <div
            className="flex flex-col mx-auto w-full flex-grow p-4"
            style={{
              maxWidth: layoutMaxWidth
            }}
          >
            <TaskList isMobile={true} />
            <WelcomeScreen autoScrollRef={autoScrollRef} />
            <MessagesContainer navigate={navigate} />
          </div>
        </ScrollContainer>
        <div
          className="flex flex-col mx-auto w-full p-4 pt-0"
          style={{
            maxWidth: layoutMaxWidth
          }}
        >
          <ChatFooter autoScrollRef={autoScrollRef} />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
