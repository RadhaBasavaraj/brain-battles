
import { useEffect, useState } from "react";
import {
  Search,
  MessageCircleQuestion,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import MathTest from "../lib/MathText";
import { useNavigate } from "react-router-dom";

type DiscussionTab = "mine" | "all";
type DiscussionFilter = "all" | "unanswered" | "replied";

type DiscussionRow = {
  id: string;
  user_id: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
  unit_question_id: string;
  unit_questions: {
    question_text: string;
    unit_number: string;
    units: {
      name: string;
      subjects: {
        name: string;
      } | null;
    } | null;
  } | null;
};

type Discussion = {
  id: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
  question_text: string;
  unit_number: string;
  unit_name: string;
  subject_name: string;
  reply_count: number;
  posted_by: string;
};

type ProfileRow = {
  user_id: string;
  display_name: string | null;
};

export default function Discussions() {
  const { user } = useAuth();
const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DiscussionTab>("mine");
  const [activeFilter, setActiveFilter] =
    useState<DiscussionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchMyDiscussions() {
      if (!user?.id) {
        setDiscussions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
       
        let query = supabase
  .from("discussions")
  .select(`
    id,
    user_id,
    content,
    is_resolved,
    created_at,
    unit_question_id,
    unit_questions (
      question_text,
      unit_number,
      units (
        name,
        subjects (
          name
        )
      )
    )
  `)
  .is("parent_id", null);

if (activeTab === "mine") {
  query = query.eq("user_id", user.id);
}

const { data, error } = await query.order("created_at", {
  ascending: false,
});

        if (error) throw error;

        const rows = (data ?? []) as unknown as DiscussionRow[];
        const discussionIds = rows.map((row) => row.id);

        const userIds = [...new Set(rows.map((row) => row.user_id))];

const { data: profiles, error: profilesError } = await supabase
  .from("profiles")
  .select("user_id, display_name")
  .in("user_id", userIds);

if (profilesError) throw profilesError;

const displayNames: Record<string, string> = {};

(profiles ?? []).forEach((profile) => {
  const row = profile as ProfileRow;
  displayNames[row.user_id] = row.display_name?.trim() || "Student";
});

        let replyCounts: Record<string, number> = {};

        if (discussionIds.length > 0) {
          const { data: replies, error: repliesError } = await supabase
            .from("discussions")
            .select("parent_id")
            .in("parent_id", discussionIds);

          if (repliesError) throw repliesError;

          replyCounts = (replies ?? []).reduce(
            (counts, reply) => {
              if (reply.parent_id) {
                counts[reply.parent_id] =
                  (counts[reply.parent_id] ?? 0) + 1;
              }
              return counts;
            },
            {} as Record<string, number>
          );
        }

        const formatted: Discussion[] = rows.map((row) => {
          const question = row.unit_questions;
          const unit = question?.units;
          const subject = unit?.subjects;

          return {
            id: row.id,
            content: row.content,
            is_resolved: row.is_resolved,
            created_at: row.created_at,
            question_text: question?.question_text ?? "",
            unit_number: question?.unit_number ?? "",
            unit_name: unit?.name ?? "",
            subject_name: subject?.name ?? "",
            reply_count: replyCounts[row.id] ?? 0,
            posted_by: displayNames[row.user_id] ?? "Student",
          };
        });

        if (isActive) {
          setDiscussions(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch discussions:", error);

        if (isActive) {
          setErrorMessage("Unable to load your questions. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchMyDiscussions();

    return () => {
      isActive = false;
    };
  }, [user?.id, activeTab, retryCount]);

 
const filteredDiscussions = discussions.filter((discussion) => {
  const searchText = searchQuery.trim().toLowerCase();

  const matchesSearch =
    !searchText ||
    discussion.content.toLowerCase().includes(searchText) ||
    discussion.question_text.toLowerCase().includes(searchText) ||
    discussion.unit_name.toLowerCase().includes(searchText) ||
    discussion.subject_name.toLowerCase().includes(searchText);

  const matchesFilter =
    activeTab !== "all" ||
    activeFilter === "all" ||
    (activeFilter === "unanswered" && discussion.reply_count === 0 && !discussion.is_resolved) ||
    (activeFilter === "replied" && discussion.reply_count > 0 && !discussion.is_resolved) ;

  return matchesSearch && matchesFilter;
});


  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <div className="flex items-center gap-3">
          <MessageCircleQuestion
            className="h-7 w-7 text-primary"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Discussions
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Share your doubts, discuss concepts, and learn together.
        </p>
      </div>

      <div
        className="flex gap-2 border-b"
        role="tablist"
        aria-label="Discussion scope"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "mine"}
          onClick={() => setActiveTab("mine")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Questions
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Questions
        </button>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search questions by subject, unit, or keyword..."
          aria-label="Search discussions"
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {activeTab === "all" && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter discussions"
        >
          {(
            [
              { value: "all", label: "All" },
              { value: "unanswered", label: "Unanswered" },
              { value: "replied", label: "Has Replies" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={activeFilter === filter.value}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

    
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading your questions...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-destructive/30 p-6 text-center">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1) }
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center sm:p-12">
          <MessageCircleQuestion
            className="mx-auto h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold">
            {searchQuery
              ? "No matching questions"
              : "Your questions will appear here"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {searchQuery
              ? "Try another search term."
              : "Questions you submit from the Practice page will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (

            <article
  key={discussion.id}
  onClick={() => navigate(`/discussions/${discussion.id}`)}
  role="link"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/discussions/${discussion.id}`);
    }
  }}
  className="cursor-pointer rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {discussion.subject_name && (
                  <span>{discussion.subject_name}</span>
                )}
                {discussion.unit_name && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{discussion.unit_name}</span>
                  </>
                )}
                {discussion.is_resolved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 font-medium text-green-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                )}
              </div>

                <div className="mt-2 min-w-0">
  <div className="line-clamp-3 break-words text-sm whitespace-pre-line leading-6">
    <MathTest text={discussion.content} />
  </div>
</div>

           {discussion.question_text && (
  <div className="mt-3 min-w-0 rounded-lg bg-muted/50 p-3">
    <p className="text-xs font-medium text-muted-foreground">
      Original question
    </p>

    <div className="mt-1 min-w-0">
      <div className="line-clamp-3 break-words text-sm whitespace-pre-line leading-6">
        <MathTest text={discussion.question_text} />
      </div>
    </div>
  </div>
)}
              <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>
                  {discussion.reply_count}{" "}
                  {discussion.reply_count === 1 ? "reply" : "replies"}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {new Date(discussion.created_at).toLocaleDateString()}
                </span>
                 <span aria-hidden="true">·</span>
                <span>Posted by: {discussion.posted_by}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
