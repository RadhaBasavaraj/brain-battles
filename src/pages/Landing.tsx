import { Link } from "react-router-dom";
import  {Button}  from "../components/ui/button";
import { Brain, Zap, Trophy, BookOpen, Users, ArrowRight, Swords } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Swords,
    title: "Battle Mode",
    desc: "Race against the clock in intense timed quizzes. Every second counts!",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Practice Mode",
    desc: "Learn at your own pace with unlimited practice questions.",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Compete with others and climb the ranks to the top.",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Join thousands of learners sharpening their skills daily.",
    color: "bg-chart-4/10 text-chart-4",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        {/* Responsive :  <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between"> */}
       <div className="max-w-7xl mx-auto px-3 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">BrainBattles</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-medium px-2 sm:px-4">Sign In</Button>
            </Link>
            <Link to="/register">
              {/*  Responsiveness : <Button className="font-medium gap-1.5">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button> */}

              <Button className="font-medium gap-1.5 px-3 sm:px-4">
                <span>Get Started</span>
                <ArrowRight className="hidden sm:block w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      {/*responsiveness : <section className="pt-40 pb-24 px-8"> */}
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              Learn. Compete. Conquer.
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              //Responsiveness :  className="font-display text-6xl font-extrabold leading-tight tracking-tight mb-6"
              className="font-display text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6"
            >
              Sharpen your mind
              <br className="hidden sm:block"/>
              through <span className="text-primary">epic battles</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              //Responsiveness :  className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-10"
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8 sm:mb-10"
            >
              Challenge yourself with quizzes across Math, Physics, Chemistry and more.
              Practice at your pace or battle under pressure — the choice is yours.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              //Responsiveness : className="flex items-center gap-4"
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <Link to="/register">
                {/*Responsiveness : <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2"> */}
                <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-semibold gap-2">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                {/*Responsiveness :  <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold"> */}
                <Button variant="outline" size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-semibold">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      {/*Responsiveness :  <section className="py-24 px-8 bg-muted/40"> */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            {/* Responsiveness :  <h2 className="font-display text-4xl font-bold mb-4"> */}
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to excel</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              A complete learning platform designed to make studying engaging and effective.
            </p>
          </motion.div>
          {/* Responsiveness : <div className="grid grid-cols-4 gap-6"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
                // Responsiveness : className="bg-card rounded-2xl p-8 border border-border/60 hover:border-primary/30 transition-colors duration-300"
                 className="bg-card rounded-2xl p-6 sm:p-8 border border-border/60 hover:border-primary/30 transition-colors duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth CTA */}
      {/*Responsiveness : <section className="py-24 px-8"> */}
      <section className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            //Responsiveness : className="bg-primary rounded-3xl p-16 text-center"
            className="bg-primary rounded-3xl p-8 sm:p-16 text-center"
          >
            {/* Responsiveness :  <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4"> */}
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to test your knowledge?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
              Join BrainBattles today and start your journey to becoming a quiz champion.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-primary-foreground/60 text-sm mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/90">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {/*Responsiveness:  <footer className="border-t border-border py-8 px-8"> */}
      <footer className="border-t border-border py-8 px-4 sm:px-8">
        {/*Responsiveness :  <div className="max-w-7xl mx-auto flex items-center justify-between"> */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-sm">BrainBattles</span>
          </div>
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} BrainBattles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}