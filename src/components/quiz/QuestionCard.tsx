import { motion } from "framer-motion";
import type { QuestionCardProps } from "../../types/QuestionCardProps";
import MathTest from "../../lib/MathText";

const optionLetters = ["A", "B", "C", "D"];
const optionKeys = ["option_a", "option_b", "option_c", "option_d"] as const;


export default function QuestionCard({ question, selectedAnswer, onSelect, showResult, questionNumber, total }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      // Responsiveness : className="bg-card border border-border rounded-2xl p-8"
      className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8"
    >
      {/* Responsiveness : <div className="flex items-center justify-between mb-6"> */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/*Responsiveness:  <span className="text-sm text-muted-foreground font-medium"> */}
         <span className="text-xs text-muted-foreground font-medium sm:text-sm">
          Question {questionNumber} of {total}
        </span>
        {/*Responsiveness :  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize"> */}
         <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
             {question.unit_number}
        </span>
      </div>

      {/*Responsiveness : <h3 className="font-display text-xl font-semibold mb-8 leading-relaxed"> */}
      <h3 className="font-display text-lg font-semibold mb-6 leading-relaxed sm:text-xl sm:mb-8">
        {/* {question.question_text} */}
          <MathTest text={question.question_text} />
      </h3>

      {question.image_url && (
        <img
          src={question.image_url}
          alt="Question diagram"
          className="max-w-full mx-auto my-4"
        />
)}

      <div className="space-y-3">
        {optionKeys.map((key, i) => {
          const letter = optionLetters[i];
          const isSelected = selectedAnswer === letter;
          const isCorrect = question.correct_answer === letter;
          let borderClass = "border-border hover:border-primary/40";
          let bgClass = "bg-card hover:bg-muted/50";

          if (showResult && isCorrect) {
            borderClass = "border-emerald-400";
            bgClass = "bg-emerald-50";
          } else if (showResult && isSelected && !isCorrect) {
            borderClass = "border-red-400";
            bgClass = "bg-red-50";
          } else if (isSelected && !showResult) {
            borderClass = "border-primary";
            bgClass = "bg-primary/5";
          }

          return (
            <button
              key={letter}
              onClick={() => !showResult && onSelect(letter)}
              disabled={showResult}
              //Responsiveness :  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border ${borderClass} ${bgClass} transition-all duration-200 text-left`}
                className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl border ${borderClass} ${bgClass} transition-all duration-200 text-left`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  isSelected && !showResult
                    ? "bg-primary text-primary-foreground"
                    : showResult && isCorrect
                    ? "bg-emerald-500 text-white"
                    : showResult && isSelected && !isCorrect
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {letter}
              </span>
              {/*Responsiveness:  <span className="text-sm font-medium"> */}
               <span className="text-sm font-medium min-w-0 break-words">
                {/* {question[key]} */}
                 <MathTest text={question[key]} />
              </span>
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          //Responsiveness :  className="mt-6 p-4 rounded-xl bg-muted/60 border border-border"
           className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl bg-muted/60 border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Explanation: </span>
            {/* {question.explanation} */}
            <MathTest text={question.explanation} />
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}