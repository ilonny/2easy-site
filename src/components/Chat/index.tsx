import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import { ClipboardEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import ChatIcon from "@/assets/icons/chat.svg";
import CloseIcon from "@/assets/icons/close.svg";
import Image from "next/image";
import { fetchPostJson } from "@/api";
import { sleep } from "@/app/editor/hooks/useExAnswer";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  lesson_id: number;
  students?: never[];
  isTeacher: boolean;
};

export const Chat: FC<TProps> = ({ lesson_id, students }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageList, setMessageList] = useState([]);

  const canGetMessages = useRef(false);

  const getMessageList = useCallback(async () => {
    if (!canGetMessages.current) {
      return;
    }
    const res = await fetchPostJson({
      path: "/chat/message-list",
      isSecure: true,
      data: {
        students,
        lesson_id,
      },
    });
    const data = await res.json();
    setMessageList(data || []);

    await sleep(1000);
    getMessageList();
  }, [lesson_id, students]);

  useEffect(() => {
    canGetMessages.current = isOpen;
    getMessageList();
  }, [getMessageList, isOpen]);

  const sendMessage = useCallback(
    async (_message: string, messageText: string) => {
      fetchPostJson({
        path: "/chat/send",
        isSecure: true,
        data: {
          lesson_id,
          message: messageText,
          student_ids: students?.map((s) => s?.student_id) || [],
        },
      });
    },
    [lesson_id, students]
  );

  const handlePaste = useCallback((evt: ClipboardEvent) => {
    evt.preventDefault();
    const text = evt.clipboardData.getData("text/plain").trim();
    if (!text) return;
    document.execCommand("insertText", false, text);
  }, []);

  if (!isOpen) {
    return (
      <Button
        endContent={<Image src={ChatIcon} alt="ChatIcon" />}
        color="primary"
        variant="light"
        onClick={() => setIsOpen(true)}
        size="lg"
        style={{ minWidth: 300 }}
      >
        <T k="lessons.lessonChat" />
      </Button>
    );
  }
  console.log("chat: ", students);
  return (
    <div style={{ position: "relative", height: "500px", minWidth: 300 }}>
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Content
            // info="Active 10 mins ago"
            />
            <ConversationHeader.Actions>
              <Button
                endContent={<Image src={CloseIcon} alt="ChatIcon" />}
                color="primary"
                variant="light"
                onClick={() => setIsOpen(false)}
              >
                <T k="common.close" />
              </Button>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList>
            {messageList?.map((m) => {
              return (
                <Message key={m?.id} model={{ ...m }}>
                  <Message.Header sender={m.sender} />
                </Message>
              );
            })}
          </MessageList>
          <MessageInput
            placeholder={i18n.t("lessons.typeMessage")}
            attachButton={false}
            onSend={sendMessage}
            onPaste={handlePaste}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};
