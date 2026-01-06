import { uniqBy } from "lodash";
import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  ChainlitContext,
  threadHistoryState,
  useChatMessages,
  useChatSession,
} from "@chainlit/react-client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ThreadList } from "./ThreadList";

const BATCH_SIZE = 35;
let _scrollTop = 0;

export function ThreadHistory() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiClient = useContext(ChainlitContext);
  const { firstInteraction, messages, threadId } = useChatMessages();
  const [threadHistory, setThreadHistory] = useRecoilState(threadHistoryState);
  const [error, setError] = useState<string>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  const { chatProfile } = useChatSession();

  // Restore scroll position
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = _scrollTop;
    }
  }, []);

  const fetchThreads = async (
    cursor?: string | number,
    isLoadingMoreOverride = false,
    reason = "unknown"
  ) => {
    if (!chatProfile) return;

    try {
      setIsLoadingMore(!!cursor || isLoadingMoreOverride);
      setIsFetching(!cursor && !isLoadingMoreOverride);

      console.log(`📡 FETCHING | Reason: ${reason} | Profile: "${chatProfile}"`);

      const { pageInfo, data } = await apiClient.listThreads(
        { first: BATCH_SIZE, cursor },
        {},
      );

      // --- DEBUG LOGS FOR SERVER DATA ---
      if (data && data.length > 0) {
        console.log("🔍 INSPECTING FIRST THREAD FROM SERVER:");
        console.log("ID:", data[0].id);
        console.log("Metadata:", data[0].metadata);
        console.log("Chat Profile in Metadata:", data[0].metadata?.chat_profile);
      } else {
        console.log("⚠️ Server returned 0 threads.");
      }
      // ----------------------------------

      setError(undefined);

      setThreadHistory((prev) => {
        const allThreads = uniqBy(
          cursor ? (prev?.threads || []).concat(data) : data,
          "id",
        );
        return {
          ...prev,
          pageInfo,
          threads: allThreads,
        };
      });
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setShouldLoadMore(false);
      setIsLoadingMore(false);
      setIsFetching(false);
    }
  };

  // 1. Fetch on Profile Change
  useEffect(() => {
    if (chatProfile) {
      console.log("👤 Profile Changed to:", chatProfile);
      // Optional: Clear current list to avoid mixing while loading
      setThreadHistory((prev) => ({ ...prev, threads: [] }));
      fetchThreads(undefined, false, "Profile Switch");
    }
  }, [chatProfile]);

  // 2. Fetch on New Thread (with delay for DB persistence)
  useEffect(() => {
    if (threadId && chatProfile) {
      const timeoutId = setTimeout(() => {
        fetchThreads(undefined, false, "New Thread Created");
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [threadId]);

  // 3. Navigation Logic
  useEffect(() => {
    if (!firstInteraction || !threadId) return;

    const isActualResume =
      firstInteraction === "resume" &&
      messages[0]?.output.toLowerCase() !== "resume";

    if (isActualResume) return;

    const currentPage = new URL(window.location.href);
    if (currentPage.pathname === "/") {
      navigate(`/thread/${threadId}`);
    }
  }, [firstInteraction, threadId]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
    _scrollTop = scrollTop;
    setShouldLoadMore(atBottom);
  };

  // 4. Infinite Scroll
  useEffect(() => {
    if (shouldLoadMore && !isLoadingMore && threadHistory?.pageInfo?.hasNextPage) {
      fetchThreads(threadHistory.pageInfo.endCursor, false, "Infinite Scroll");
    }
  }, [shouldLoadMore, isLoadingMore]);

  // --- FILTERING LOGIC ---
  const filteredThreads = useMemo(() => {
    const threads = threadHistory?.threads || [];
    
    // Log before filtering
    console.log(`📊 Filtering ${threads.length} threads for profile: "${chatProfile}"`);

    const result = threads.filter((thread) => {
      // Safety check: handle missing metadata
      const threadProfile = thread.metadata?.chat_profile;
      
      const isMatch = threadProfile === chatProfile;

      // Log mismatches to help debug
      if (!isMatch && threads.length < 5) { // Limit logs to avoiding spam
         console.log(`❌ Hiding Thread ${thread.id.slice(0,4)}... | Got: "${threadProfile}" | Expected: "${chatProfile}"`);
      }
      
      return isMatch;
    });

    console.log(`✅ Showing ${result.length} threads after filter.`);
    return result;
  }, [threadHistory, chatProfile]);

  return (
    <SidebarContent onScroll={handleScroll} ref={scrollRef}>
      <SidebarGroup>
        <SidebarMenu>
          {chatProfile && threadHistory ? (
            <div id="thread-history" className="flex-grow">
              <ThreadList
                // PASSING THE FILTERED LIST HERE
                threadHistory={{
                  ...threadHistory,
                  threads: filteredThreads, // <--- This must be the filtered list
                }}
                error={error}
                isFetching={isFetching}
                isLoadingMore={isLoadingMore}
              />
            </div>
          ) : null}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
