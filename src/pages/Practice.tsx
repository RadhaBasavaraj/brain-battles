import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BookOpen, ArrowRight, RotateCcw, 
  CheckCircle2, Lightbulb,  MessageCircle, X,} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "../components/quiz/QuestionCard";
import { useToast } from "../components/ui/use-toast";
import type {Question} from "../types/QuestionCardProps";
import type {Subject} from "../types/Subject";
import type {Unit} from "../types/Unit";
import { useAuth } from '../lib/AuthContext';

export default function Practice() {
  const [phase, setPhase] = useState("setup"); // setup | practicing
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ attempted: 0, correct: 0 });
  const { toast } = useToast();
 
  // Ask Question feature
const [showQuestionComposer, setShowQuestionComposer] = useState(false);
const [questionContent, setQuestionContent] = useState("");
const [postingQuestion, setPostingQuestion] = useState(false);
 const { user } = useAuth();

  useEffect(() => {
  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name");

    if (error) {
      console.error("Error fetching subjects:", error);
      return;
    }

    setSubjects(data);
  };

  fetchSubjects();
}, []);


useEffect(() => {
  const fetchUnits = async () => {
    if (!subject) {
      setUnits([]);
      return;
    }

      setLoadingUnits(true);

    const { data, error } = await supabase
      .from("units")
      .select("id, name, subject_id")
      .eq("subject_id", subject.id);

    if (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
      setLoadingUnits(false);
      return;
    }

    setUnits(data);
    setLoadingUnits(false);
  };

  fetchUnits();
}, [subject]);

 const handleSubjectChange = (subjectId: string) => {
     const selectedSubject = subjects.find(
      (s) => s.id === subjectId
    );

    setSubject(selectedSubject ?? null);
    setUnit(null);
 }

 const handleUnitChange = (unitId: string) => {
  const selectedUnit = units.find(
    (u) => u.id === unitId
  );

  setUnit(selectedUnit ?? null);
};

  const loadQuestions = async () => {
    setLoading(true);
    try {
    if (!unit) {
        return;
     }

   let query = supabase
  .from("unit_questions")
  .select("*")
  .eq("unit_id", unit.id);

    const { data: allQuestions, error } = await query;


    if (error) {
      throw error;
    }

     
      if (allQuestions.length === 0) {
        toast({ title: "No questions found", description: "Try a different subject/unit.", variant: "destructive" });  
        setLoading(false);
        return;
      }

       const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setPracticeStats({ attempted: 0, correct: 0 });
      setPhase("practicing");
    } catch (e) {
      toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSelect = (letter: string) => {
    if (showResult) return;
    setSelectedAnswer(letter);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    setPracticeStats((prev) => ({
      attempted: prev.attempted + 1,
      correct: selectedAnswer === questions[currentIndex].correct_answer ? prev.correct + 1 : prev.correct,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      toast({ title: "Practice complete!", description: `You answered ${practiceStats.correct} out of ${practiceStats.attempted} correctly.` });
      setPhase("setup");
      setSubject(null);
      setUnit(null);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setPracticeStats({ attempted: 0, correct: 0 });
  };

  const handlePostQuestion = async () => {
  const content = questionContent.trim();
  const currentQuestion = questions[currentIndex];

  if (!content) {
    toast({
      title: "Question required",
      description: "Please enter your question.",
      variant: "destructive",
    });
    return;
  }

  if (!user?.id) {
    toast({
      title: "Login required",
      description: "Please log in to post a question.",
      variant: "destructive",
    });
    return;
  }

  if (!currentQuestion?.id) {
    toast({
      title: "No question selected",
      description: "Please select a practice question first.",
      variant: "destructive",
    });
    return;
  }

  setPostingQuestion(true);

  try {
    const { error } = await supabase.from("discussions").insert({
      unit_question_id: currentQuestion.id,
      user_id: user.id,
      content,
    });

    if (error) {
      throw error;
    }

    setQuestionContent("");
    setShowQuestionComposer(false);

    toast({
      title: "Question posted!",
      description: "Your question has been posted successfully.",
    });
  } catch (error) {
    console.error("Error posting discussion:", error);

    toast({
      title: "Unable to post question",
      description: "Please try again.",
      variant: "destructive",
    });
  } finally {
    setPostingQuestion(false);
  }
};

  // Setup Screen
  if (phase === "setup") {
    return (
      // Responsiveness : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pt-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pt-6 sm:pt-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          {/* Responsiveness : <h1 className="font-display text-3xl font-bold mb-2"> */}
            <h1 className="font-display text-2xl font-bold mb-2 sm:text-3xl">
            Practice Mode
          </h1>
          <p className="text-muted-foreground">
            No pressure, no timer. Practice questions at your own pace and learn from explanations.
          </p>
        </div>

         {/*Responsiveness : <div className="bg-card border border-border rounded-2xl p-8"> */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-8">
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Subject</label>
            {/* <Select value={subject} onValueChange={setSubject}> */}
            <Select value={subject?.id ?? ""}  onValueChange={handleSubjectChange}
>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                      {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                            {s.name}
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Unit</label>
            <Select value={unit?.id ?? ""} onValueChange={handleUnitChange} disabled={!subject || loadingUnits || units.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-xl p-5 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Take your time — no timer or score pressure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Get explanations for every answer</span>
            </div>
          </div>

           <Button
            onClick={loadQuestions}
            disabled={loading || !subject || !unit}
            className="w-full h-12 text-base font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <BookOpen className="w-5 h-5" /> Start Practice
              </>
            )}
          </Button>
        </div>

        
      </motion.div>
    );
  }

  // Practicing
  const currentQ = questions[currentIndex];
  //const currentQuestionId = currentQ?.id;
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      {/* Responsiveness : <div className="flex items-center justify-between mb-6"> */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span className="font-display font-semibold">Practice Mode</span>
        </div>
        {/* Responsiveness : <div className="flex items-center gap-4"> */}
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-muted-foreground">
            {practiceStats.correct}/{practiceStats.attempted} correct
          </span>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleShuffle}>
            <RotateCcw className="w-3.5 h-3.5" /> Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPhase("setup")}>
            Exit
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQ.id}
          question={currentQ}
          selectedAnswer={selectedAnswer}
          onSelect={handleSelect}
          showResult={showResult}
          questionNumber={currentIndex + 1}
          total={questions.length}
        />
      </AnimatePresence>

      <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between">
  {showResult && (
    <div className="w-full sm:w-auto">
      {!showQuestionComposer && (
        <Button
          variant="outline"
          className="gap-2 h-11 px-6 w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
          onClick={() => {
            //setPostStatus(null);
            setShowQuestionComposer(true);
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Clear My Doubt
        </Button>
      )}
    </div>
  )}

  <div className="flex justify-end">
    {!showResult ? (
      <Button
        onClick={handleCheck}
        disabled={!selectedAnswer}
        className="gap-2 h-11 px-6 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
      >
        <CheckCircle2 className="w-4 h-4" /> Check Answer
      </Button>
    ) : (
      <Button
        onClick={handleNext}
        className="gap-2 h-11 px-6 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
      >
        {currentIndex < questions.length - 1 ? (
          <>Next Question <ArrowRight className="w-4 h-4" /></>
        ) : (
          <>Finish Practice <CheckCircle2 className="w-4 h-4" /></>
        )}
      </Button>
    )}
  </div>
</div>


     {/* Question Composer */}
{showResult && showQuestionComposer && (
  <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Clear My Doubt</h3>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowQuestionComposer(false);
          setQuestionContent("");
         // setPostStatus(null);
        }}
        aria-label="Close question composer"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>

    <p className="text-sm text-muted-foreground">
      Share your doubt about this practice question.
    </p>

    <textarea
      value={questionContent}
      onChange={(event) => {
        setQuestionContent(event.target.value);
       // setPostStatus(null);
      }}
      placeholder="What would you like to understand?"
      rows={4}
      maxLength={5000}
      disabled={postingQuestion}
      className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    />

    <div className="flex justify-end">
      <Button
        onClick={handlePostQuestion}
        disabled={postingQuestion || !questionContent.trim()}
        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
      >
        {postingQuestion ? (
          "Posting..."
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Post Question
          </>
        )}
      </Button>
    </div>

  </div>
)}
  </div>);
}