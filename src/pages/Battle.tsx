import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Swords, Timer, Zap, Trophy, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "../components/quiz/QuestionCard";
import { useToast } from "../components/ui/use-toast";
import type {Question} from "../types/QuestionCardProps";
import type {Subject} from "../types/Subject";
import type {Unit} from "../types/Unit";
import { useAuth } from '../lib/AuthContext';


const TIME_PER_QUESTION = 30;

export default function Battle() {
  const [phase, setPhase] = useState("setup"); // setup | playing | result
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if(timerRef.current !== null){
            clearInterval(timerRef.current);
             timerRef.current = null;        
          }
          return 0;
     
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  // Handle time running out
  useEffect(() => {
    if (timeLeft === 0 && phase === "playing" && !showResult) {
      setShowResult(true);
      stopTimer();
    }
  }, [timeLeft, phase, showResult, stopTimer]);

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
      console.log("Subjects fetched:", data);
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
      console.log("Units fetched are : ", data);
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

  const startBattle = async () => {
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
  
      console.log("Data from supbase : ", allQuestions);
  
      if (error) {
        throw error;
      }
      

      if (allQuestions.length === 0) {
        toast({ title: "No questions found", description: "Try a different category.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setCorrectCount(0);
      setTotalTimeTaken(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setPhase("playing");
      startTimer();
    } catch (e) {
      toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSelect = (letter: string) => {
    if (showResult) return;
    setSelectedAnswer(letter);
  };

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    stopTimer();
    setShowResult(true);
    const timeTaken = TIME_PER_QUESTION - timeLeft;
    setTotalTimeTaken((prev) => prev + timeTaken);
    if (selectedAnswer === questions[currentIndex].correct_answer) {
      const bonus = Math.max(0, timeLeft * 2);
      setScore((prev) => prev + 10 + bonus);
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      startTimer();
    } else {
      stopTimer();
      setPhase("result");
      setSubject(null);
      setUnit(null);
      // Save battle result
      try {
       // const me = await base44.auth.me();
        // const { data, error } = await supabase.auth.getUser();
        // if (error) {
        //   throw error;
        // }
        // const me = data.user;
      
        const finalScore = score;

        const { error: insertError } = await supabase
                  .from("battle_results")
                  .insert({
                    user_id: user?.id,
                    user_name: user?.user_metadata.full_name || user?.email,
                    score: finalScore,
                    total_questions: questions.length,
                    correct_answers: correctCount,
                    subject:subject?.name,
                    time_taken_seconds: totalTimeTaken,
                  });

                if (insertError) {
                  throw insertError;
                }
        // Update profile

        const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("total_battles, total_score, battles_won")
                .eq("user_id", user?.id)
                .single();

              if (profileError) {
                throw profileError;
              }

        const { error: updateError } = await supabase
                .from("profiles")
                .update({
                  total_battles: (profile.total_battles || 0) + 1,
                  total_score: (profile.total_score || 0) + finalScore,
                  battles_won:
                    (profile.battles_won || 0) +
                    (correctCount >= Math.ceil(questions.length * 0.7) ? 1 : 0),
                })
                .eq("user_id", user?.id);

              if (updateError) {
                throw updateError;
              }


      } catch (e) { 
        toast({ title: "Error", description: "Could not save battle results", variant: "destructive" });
      }
    }
  };

  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor = timeLeft > 15 ? "text-emerald-500" : timeLeft > 5 ? "text-amber-500" : "text-red-500";

  // Setup Screen
  if (phase === "setup") {
    return (
      //Responsiveness : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pt-12">
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pt-6 sm:pt-12">
      
          <div className="text-center mb-12"> 
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Swords className="w-8 h-8 text-primary" />
          </div>
         {/*Responsiveness :  <h1 className="font-display text-3xl font-bold mb-2"> */}
             <h1 className="font-display text-2xl font-bold mb-2 sm:text-3xl">
            Battle Mode
          </h1>
          <p className="text-muted-foreground">
            Answer 10 questions against the clock. Faster answers earn bonus points!
          </p>
        </div>

        {/* Responsiveness : <div className="bg-card border border-border rounded-2xl p-8"> */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Subject</label>
         <Select value={subject?.id ?? ""}  onValueChange={handleSubjectChange}
>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* {SUBJECTS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))} */}

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

          {/*Responsiveness:  <div className="bg-muted/50 rounded-xl p-5 mb-6 space-y-2"> */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2 sm:p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">10</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time per question</span>
              <span className="font-medium">30 seconds</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Points per correct answer</span>
              <span className="font-medium">10 + time bonus</span>
            </div>
          </div>

          <Button
            onClick={startBattle}
            disabled={loading || !subject || !unit}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" /> Start Battle
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Result Screen
  if (phase === "result") {
    const percent = Math.round((correctCount / questions.length) * 100);
    const won = percent >= 70;
    return (
      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          //Responsiveness:  className="max-w-2xl mx-auto pt-12">
          className="max-w-2xl mx-auto pt-6 sm:pt-12">
        {/*Responsiveness: <div className="bg-card border border-border rounded-2xl p-10 text-center"> */}
         <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 lg:p-10 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${won ? "bg-emerald-100" : "bg-amber-100"}`}>
            {won ? <Trophy className="w-10 h-10 text-emerald-600" /> : <Swords className="w-10 h-10 text-amber-600" />}
          </div>
          {/*Responsiveness : <h2 className="font-display text-3xl font-bold mb-2"> */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {won ? "Victory!" : "Good Effort!"}
          </h2>
          {/*Responsiveness : <p className="text-muted-foreground mb-8"> */}
          <p className="text-muted-foreground mb-6 sm:mb-8">
            {won ? "Outstanding performance! Keep it up!" : "Practice makes perfect. Try again!"}
          </p>

          {/*Responsiveness :  <div className="grid grid-cols-3 gap-4 mb-8"> */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* Responsiveness :  <div className="bg-muted/50 rounded-xl p-5"> */}
           <div className="bg-muted/50 rounded-xl p-3 sm:p-5">
              {/* Responsiveness : <p className="text-3xl font-display font-bold text-primary"> */}
               <p className="text-2xl sm:text-3xl font-display font-bold text-primary">
                {score}
              </p>
              {/*Responsiveness :  <p className="text-sm text-muted-foreground mt-1"> */}
               <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total Score
              </p>
            </div>
            {/* Responsiveness : <div className="bg-muted/50 rounded-xl p-5"> */}
            <div className="bg-muted/50 rounded-xl p-3 sm:p-5">
              {/* Responsiveness : <p className="text-3xl font-display font-bold"> */}
              <p className="text-2xl sm:text-3xl font-display font-bold">
                {correctCount}/{questions.length}
              </p>
              {/* Responsiveness :  <p className="text-sm text-muted-foreground mt-1"> */}
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Correct
              </p>
            </div>

            {/* Responsiveness : <div className="bg-muted/50 rounded-xl p-5"> */}
             <div className="bg-muted/50 rounded-xl p-3 sm:p-5">
              {/* Responsiveness :  <p className="text-3xl font-display font-bold"> */}
                <p className="text-2xl sm:text-3xl font-display font-bold">
                {percent}%</p>
              {/* Responsiveness :  <p className="text-sm text-muted-foreground mt-1"> */}
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Accuracy</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {/*Responsiveness :  <Button variant="outline" className="gap-2" onClick={() => setPhase("setup")}> */}
            <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => setPhase("setup")}>
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Playing Screen
  const currentQ = questions[currentIndex];
  return (
    <div className="max-w-2xl mx-auto">
      {/* Timer bar */}
      {/* Responsiveness : <div className="flex items-center justify-between mb-6"> */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold">Battle Mode</span>
        </div>
        <div className="flex items-center gap-3">
          {/*Responsiveness : <span className="text-sm font-medium text-muted-foreground"> */}
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Score: {score}
          </span>
          <div className={`flex items-center gap-1.5 font-display font-bold text-lg ${timerColor}`}>
            <Timer className="w-5 h-5" />
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Timer progress bar */}
      {/* responsiveness : <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden"> */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-4 sm:mb-6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timeLeft > 15 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-red-500"}`}
          initial={false}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
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

      {/*Responsiveness :  <div className="flex justify-end mt-6 gap-3"> */}
        <div className="flex justify-end mt-4 sm:mt-6 gap-3">
        {!showResult ? (
          <Button
            onClick={handleConfirm}
            disabled={!selectedAnswer}
            // Responsiveness : className="gap-2 h-11 px-6"
            className="w-full sm:w-auto gap-2 h-11 px-6"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm Answer
          </Button>
        ) : (
          <Button onClick={handleNext} 
          //Responsiveness :  className="gap-2 h-11 px-6">
             className="w-full sm:w-auto gap-2 h-11 px-6">
            {currentIndex < questions.length - 1 ? (
              <>Next Question <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>View Results <Trophy className="w-4 h-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}