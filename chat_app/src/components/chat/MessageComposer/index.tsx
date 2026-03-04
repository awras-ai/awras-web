import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import {
  IStep,
  useAuth,
  useChatData,
  useChatInteract
} from '@chainlit/react-client';

import { Settings } from '@/components/icons/Settings';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'components/i18n/Translator';

import { useQuery } from '@/hooks/query';
import { useIsMobile } from '@/hooks/use-mobile';

import { chatSettingsOpenState } from '@/state/project';
import { persistentCommandState } from 'state/chat';

import CommandButtons from './CommandButtons';
import CommandButton from './CommandPopoverButton';
import Input, { InputMethods } from './Input';
import McpButton from './Mcp';
import SubmitButton from './SubmitButton';
// DISABLED: Voice and upload buttons not needed for text-only chat
// import VoiceButton from './VoiceButton';
// import UploadButton from './UploadButton';

interface Props {
  // DISABLED: File upload props removed for text-only chat
  // fileSpec: FileSpec;
  // onFileUpload: (payload: File[]) => void;
  // onFileUploadError: (error: string) => void;
  autoScrollRef: MutableRefObject<boolean>;
}

export default function MessageComposer({
  autoScrollRef
}: Props) {
  const inputRef = useRef<InputMethods>(null);
  const [value, setValue] = useState('');
  const [selectedCommand, setSelectedCommand] = useRecoilState(
    persistentCommandState
  );
  const setChatSettingsOpen = useSetRecoilState(chatSettingsOpenState);
  // DISABLED: Attachments not supported in text-only chat
  // const [attachments, setAttachments] = useRecoilState(attachmentsState);
  const { t } = useTranslation();

  const { user } = useAuth();
  const { sendMessage, replyMessage } = useChatInteract();
  const { askUser, chatSettingsInputs, disabled: _disabled } = useChatData();

  // DISABLED: No attachments to check
  const disabled = _disabled;
  // const disabled = _disabled || !!attachments.find((a) => !a.uploaded);

  const isMobile = useIsMobile();

  let promptValue = '';
  try {
    const query = useQuery();
    promptValue = query.get('prompt') || '';
  } catch {
    console.warn('Could not parse query parameters');
  }

  const [promptUsed, setPromptUsed] = useState(false);

  // DISABLED: File paste handling not needed for text-only chat
  // const onPaste = useCallback(
  //   (event: ClipboardEvent) => {
  //     if (event.clipboardData && event.clipboardData.items) {
  //       const items = Array.from(event.clipboardData.items);

  //       // If no text data, check for files (e.g., images)
  //       items.forEach((item) => {
  //         if (item.kind === 'file') {
  //           const file = item.getAsFile();
  //           if (file) {
  //             onFileUpload([file]);
  //           }
  //         }
  //       });
  //     }
  //   },
  //   [onFileUpload]
  // );

  const onSubmit = useCallback(
    async (
      msg: string,
      // DISABLED: Attachments not supported in text-only chat
      // attachments?: IAttachment[],
      selectedCommand?: string
    ) => {
      const message: IStep = {
        threadId: '',
        command: selectedCommand,
        id: uuidv4(),
        name: user?.identifier || 'User',
        type: 'user_message',
        output: msg,
        createdAt: new Date().toISOString(),
        metadata: { location: window.location.href }
      };

      // DISABLED: File references not needed for text-only chat
      // const fileReferences = attachments
      //   ?.filter((a) => !!a.serverId)
      //   .map((a) => ({ id: a.serverId! }));

      if (autoScrollRef) {
        autoScrollRef.current = true;
      }
      sendMessage(message, undefined);
      // sendMessage(message, fileReferences);
    },
    [user, sendMessage, autoScrollRef]
  );

  const onReply = useCallback(
    async (msg: string) => {
      const message: IStep = {
        threadId: '',
        id: uuidv4(),
        name: user?.identifier || 'User',
        type: 'user_message',
        output: msg,
        createdAt: new Date().toISOString(),
        metadata: { location: window.location.href }
      };

      replyMessage(message);
      if (autoScrollRef) {
        autoScrollRef.current = true;
      }
    },
    [user, replyMessage, autoScrollRef]
  );

  const submit = useCallback(() => {
    // DISABLED: No attachments to check
    if (
      disabled ||
      (value.trim() === '' && !selectedCommand)
      // (value.trim() === '' && attachments.length === 0 && !selectedCommand)
    ) {
      return;
    }

    if (askUser) {
      onReply(value);
    } else {
      onSubmit(value, selectedCommand?.id);
      // onSubmit(value, attachments, selectedCommand?.id);
    }

    // DISABLED: No attachments to clear
    // setAttachments([]);
    setValue(''); // Clear the value state
    inputRef.current?.reset();
  }, [
    value,
    disabled,
    askUser,
    // DISABLED: No attachments
    // attachments,
    selectedCommand,
    // setAttachments,
    onSubmit,
    onReply
  ]);

  useEffect(() => {
    if (inputRef.current && promptValue && !promptUsed) {
      const prompt = promptValue;
      if (prompt) {
        if (prompt.length > 1000) {
          inputRef.current?.setValueExtern(prompt.slice(0, 1000));
        } else {
          inputRef.current?.setValueExtern(prompt);
        }
        setPromptUsed(true);
      }
    }
  }, [promptValue, promptUsed]);

  return (
    <div
      id="message-composer"
      className="bg-accent dark:bg-card rounded-3xl p-3 px-4 w-full min-h-24 flex flex-col"
    >
      {/* DISABLED: Attachments UI not needed for text-only chat */}
      {/* {attachments.length > 0 ? (
        <div className="mb-1">
          <Attachments />
        </div>
      ) : null} */}
      <Input
        ref={inputRef}
        id="chat-input"
        autoFocus={!isMobile}
        selectedCommand={selectedCommand}
        setSelectedCommand={setSelectedCommand}
        onChange={setValue}
        // DISABLED: File paste not needed
        // onPaste={onPaste}
        onEnter={submit}
        placeholder={t('chat.input.placeholder')}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center -ml-1.5">
          {/* DISABLED: Voice and upload buttons not needed for text-only chat */}
          {/* <VoiceButton disabled={disabled} /> */}
          {/* <UploadButton
            disabled={disabled}
            fileSpec={fileSpec}
            onFileUploadError={onFileUploadError}
            onFileUpload={onFileUpload}
          /> */}
          {chatSettingsInputs.length > 0 && (
            <Button
              id="chat-settings-open-modal"
              disabled={disabled}
              onClick={() => setChatSettingsOpen(true)}
              className="hover:bg-muted rounded-full"
              variant="ghost"
              size="icon"
            >
              <Settings className="!size-6" />
            </Button>
          )}
          <McpButton disabled={disabled} />
          <CommandButton
            disabled={disabled}
            selectedCommandId={selectedCommand?.id}
            onCommandSelect={setSelectedCommand}
          />
          <CommandButtons
            disabled={disabled}
            selectedCommandId={selectedCommand?.id}
            onCommandSelect={setSelectedCommand}
          />
        </div>
        <div className="flex items-center gap-1">
          <SubmitButton
            onSubmit={submit}
            disabled={
              disabled ||
              (!value.trim() && !selectedCommand)
              // DISABLED: No attachments to check
              // (!value.trim() && !selectedCommand && attachments.length === 0)
            }
          />
        </div>
      </div>
    </div>
  );
}
