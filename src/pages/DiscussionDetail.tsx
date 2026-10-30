
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { useToast } from "../components/ui/use-toast";
import MathTest from "../lib/MathText";

type DiscussionData = {
  id: string;
  user_id: string;
  unit_question_id: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
  unit_questions: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation: string;
    unit_number: string;
    units: {
      name: string;
      subjects: { name: string } | null;
    } | null;
  } | null;
};

type ReplyData = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function DiscussionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [discussion, setDiscussion] =
    useState<DiscussionData | null>(null);
  const [postedBy, setPostedBy] = useState("Student");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [replyNames, setReplyNames] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState("");
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchDiscussion() {
      if (!id || !user) return;

      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("discussions")
          .select(`
            id,
            user_id,
            unit_question_id,
            content,
            is_resolved,
            created_at,
            unit_questions (
              question_text,
              option_a,
              option_b,
              option_c,
              option_d,
              correct_answer,
              explanation,
              unit_number,
              units (
                name,
                subjects ( name )
              )
            )
          `)
          .eq("id", id)
          .is("parent_id", null)
          .single();

        if (error) throw error;

        setDiscussion(data as unknown as DiscussionData);

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select('"display_name"')
            .eq("user_id", data.user_id)
            .maybeSingle();

        if (profileError) throw profileError;

        setPostedBy(
          profile?.["display_name"]?.trim() || "Student"
        );
      } catch (error) {
        console.error("Error fetching discussion:", error);
        setErrorMessage(
          "Unable to load this discussion. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDiscussion();
  }, [id, user]);

  useEffect(() => {
    async function fetchReplies() {
      if (!id || !user || !discussion) return;

      setIsLoadingReplies(true);
      setReplyError("");

      try {
        const { data, error } = await supabase
          .from("discussions")
          .select("id, user_id, content, created_at")
          .eq("parent_id", discussion.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const fetchedReplies = (data ?? []) as ReplyData[];
        setReplies(fetchedReplies);

        const userIds = [
          ...new Set(fetchedReplies.map((reply) => reply.user_id)),
        ];

        if (userIds.length === 0) {
          setReplyNames({});
          return;
        }

        const { data: profiles, error: profilesError } =
          await supabase
            .from("profiles")
            .select('user_id, "display_name"')
            .in("user_id", userIds);

        if (profilesError) throw profilesError;

        const names: Record<string, string> = {};

        profiles?.forEach((profile) => {
          names[profile.user_id] =
            profile["display_name"]?.trim() || "Student";
        });

        setReplyNames(names);
      } catch (error) {
        console.error("Error fetching replies:", error);

        toast({
          title: "Unable to load replies",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReplies(false);
      }
    }

    void fetchReplies();
  }, [id, user, discussion]);

  async function handleSubmitReply(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const content = replyText.trim();

    if (!content || !user || !discussion || isSubmittingReply) {
      return;
    }

    if (discussion.is_resolved) {
      toast({
        title: "Discussion closed",
        description: "This discussion is closed to new replies.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReply(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const { data, error } = await supabase
        .from("discussions")
        .insert({
          unit_question_id: discussion.unit_question_id,
          user_id: user.id,
          content,
          parent_id: discussion.id,
        })
        .select("id, user_id, content, created_at")
        .single();

      if (error) throw error;

      const newReply = data as ReplyData;

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select('"display_name"')
          .eq("user_id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      const displayName =
        profile?.["display_name"]?.trim() || "Student";

      setReplies((currentReplies) => [
        ...currentReplies,
        newReply,
      ]);

      setReplyNames((currentNames) => ({
        ...currentNames,
        [user.id]: displayName,
      }));

      setReplyText("");

      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);

      toast({
        title: "Unable to submit reply",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  }

  async function handleResolveDiscussion() {
    if (!discussion || !user || isResolving) {
      return;
    }

    if (discussion.user_id !== user.id) {
      toast({
        title: "Permission denied",
        description:
          "Only the original question owner can resolve this discussion.",
        variant: "destructive",
      });
      return;
    }

    if (discussion.is_resolved) {
      return;
    }

    setIsResolving(true);

    try {
      const { data, error } = await supabase
        .from("discussions")
        .update({ is_resolved: true })
        .eq("id", discussion.id)
        .eq("user_id", user.id)
        .eq("is_resolved", false)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Discussion could not be resolved.");
      }

      setDiscussion((current) =>
        current
          ? { ...current, is_resolved: true }
          : current
      );

      toast({
        title: "Discussion resolved",
        description: "Your discussion has been marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving discussion:", error);

      toast({
        title: "Unable to resolve discussion",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading discussion...</div>;
  }

  if (errorMessage || !discussion) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <p className="text-destructive">
          {errorMessage || "Discussion not found."}
        </p>

        <Link
          to="/discussions"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Back to discussions
        </Link>
      </div>
    );
  }

  const question = discussion.unit_questions;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        to="/discussions"
        className="text-sm text-primary hover:underline"
      >
        ← Back to discussions
      </Link>

      <div className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">
            Discussion Details
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {!discussion.is_resolved &&
              discussion.user_id === user?.id && (
                <button
                  type="button"
                  onClick={handleResolveDiscussion}
                  disabled={isResolving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResolving ? "Resolving..." : "Resolve discussion"}
                </button>
              )}

            {discussion.is_resolved && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Resolved
              </span>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {question?.units?.subjects?.name ?? "Subject"} ·{" "}
          {question?.units?.name ?? "Unit"} 
          {/* ·{" "} */}
          {/* {question?.unit_number ?? ""} */}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Posted by {postedBy} ·{" "}
          {new Date(discussion.created_at).toLocaleDateString()}
        </p>

        {/* Original Question */}
        <section className="mt-6 min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:p-5">
          <h2 className="mb-4 font-semibold text-blue-900 dark:text-blue-200">
            Original Question
          </h2>

          <div className="space-y-4">
            <MathTest
              text={question?.question_text ?? "Question unavailable."}
            />

            <div className="space-y-2">
              {(["a", "b", "c", "d"] as const).map((option) => (
                <div
                  key={option}
                  className="min-w-0 rounded-md border border-blue-200 bg-white p-3 dark:border-blue-900 dark:bg-background"
                >
                  <MathTest
                    text={`${option.toUpperCase()}. ${
                      question?.[`option_${option}`] ?? ""
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-3 dark:border-blue-900 dark:bg-background">
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                Correct Answer
              </p>
              <p className="mt-1">
                {question?.correct_answer ?? "Unavailable"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                Explanation
              </h3>
              <div className="mt-2 min-w-0 break-words">
                <MathTest
                  text={
                    question?.explanation ?? "No explanation available."
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Student's Doubt */}
        <section className="mt-6 min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30 sm:p-5">
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">
            Student’s Doubt
          </h2>

          <div className="mt-3 min-w-0 break-words">
            <MathTest text={discussion.content} />
          </div>
        </section>

        {/* Replies */}
        <section className="mt-6 min-w-0 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30 sm:p-5">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-200">
            Replies ({replies.length})
          </h2>

          {isLoadingReplies ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Loading replies...
            </p>
          ) : replyError ? (
            <p className="mt-3 text-sm text-destructive">
              {replyError}
            </p>
          ) : replies.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No replies yet. Be the first to help!
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <article
                  key={reply.id}
                  className="min-w-0 rounded-lg border border-green-200 bg-white p-4 dark:border-green-900 dark:bg-background"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
                      {replyNames[reply.user_id] ?? "Student"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(reply.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3 min-w-0 break-words">
                    <MathTest text={reply.content} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Write a Reply */}
        <section className="mt-6 rounded-xl border bg-muted/30 p-4 sm:p-5">
          <h2 className="font-semibold">Write a Reply</h2>

          <form
            className="mt-3 space-y-3"
            onSubmit={handleSubmitReply}
          >
            <textarea
              value={replyText}
              onChange={(event) => {
                setReplyText(event.target.value);
                setReplyError("");
                setReplySuccess("");
              }}
              placeholder="Share your explanation or help answer this doubt..."
              rows={4}
              maxLength={5000}
              required
              disabled={
                isSubmittingReply || discussion.is_resolved
              }
              className="w-full rounded-lg border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />

            {replyError && (
              <p className="text-sm text-destructive">
                {replyError}
              </p>
            )}

            {replySuccess && (
              <p className="text-sm text-green-700">
                {replySuccess}
              </p>
            )}

            {discussion.is_resolved && (
              <p className="text-sm text-muted-foreground">
                This discussion is resolved, so new replies are disabled.
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSubmittingReply ||
                discussion.is_resolved ||
                !replyText.trim()
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingReply ? "Submitting..." : "Submit Reply"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
