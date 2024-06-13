import Hero from "./components/Hero";
import Generator from "./components/Generator";
import Workout from "./components/Workout";
import { useState } from "react";
import { generateWorkout } from "./utils/functions";
import { SCHEMES_TYPE, WORKOUTS_TYPE } from "./utils/swoldier";
import { IWorkoutOfDay } from "./utils/functions";

function App() {
  const [workout, setWorkout] = useState<Nullable<IWorkoutOfDay[]>>(null);
  const [poison, setPoison] =
    useState<keyof typeof WORKOUTS_TYPE>("individual");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [goal, setGoal] = useState<keyof typeof SCHEMES_TYPE>("strength_power");

  function updateWorkout() {
    if (muscles.length < 1) return;
    const newWorkout = generateWorkout({ poison, muscles, goal });
    setWorkout(newWorkout);

    window.location.href = "#workout";
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-r from-slate-800 to-slate-950 text-white text-sm sm:text-base">
      <Hero />
      <Generator
        poison={poison}
        setPoison={setPoison}
        muscles={muscles}
        setMuscles={setMuscles}
        goal={goal}
        setGoal={setGoal}
        updateWorkout={updateWorkout}
      />
      {workout && <Workout workout={workout} />}
    </main>
  );
}

export default App;
