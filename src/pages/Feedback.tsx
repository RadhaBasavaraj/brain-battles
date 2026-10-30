
import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../api/supabaseClient";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

 const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const trimmedFeedback = feedback.trim();

  if (!trimmedFeedback || isSubmitting) return;

  setIsSubmitting(true);
  setMessage("");
  setError("");

  try {
    const { data, error: functionError } =
      await supabase.functions.invoke("send-feedback", {
        body: { feedback: trimmedFeedback },
      });

    if (functionError || !data?.success) {
      throw new Error(
        data?.error || functionError?.message || "Unable to send feedback."
      );
    }

    setFeedback("");
    setMessage("Thank you! Your feedback has been sent.");
  } catch (err) {
    console.error("Feedback submission failed:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Unable to send feedback. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <MessageSquareText className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Feedback
          </h1>
          <p className="text-sm text-muted-foreground">
            Help us make BrainBattles better.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="feedback"
              className="text-sm font-medium"
            >
              Your feedback
            </label>

            <textarea
              id="feedback"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Share a suggestion, report a problem, or tell us what you think..."
              rows={6}
              maxLength={2000}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />

            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/2000 characters
            </p>
          </div>

        
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!feedback.trim() || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Submit feedback"}
            </Button>
            {message && (
  <p role="status" className="text-sm text-green-600">
    {message}
  </p>
)}

{error && (
  <p role="alert" className="text-sm text-destructive">
    {error}
  </p>
)}
        </form>
      </div>
    </div>
  );
}
