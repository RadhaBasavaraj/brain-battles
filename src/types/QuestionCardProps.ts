export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string | null;
  unit_number: string;
  image_url?: string | null;
}


export interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  showResult: boolean;
  questionNumber: number;
  total: number;
}
