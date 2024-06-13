import SectionWrapper from "./SectionWrapper";
import ExerciseCard from "./ExerciseCard";
import { IWorkoutOfDay } from "../utils/functions";

interface IWorkoutProps {
  workout: IWorkoutOfDay[];
}

export default function Workout(props: IWorkoutProps) {
  const { workout } = props;

  return (
    <SectionWrapper
      id={"workout"}
      header={"welcome to"}
      title={["The", "DANGER", "zone"]}
    >
      <div className="flex flex-col gap-4">
        {workout.map((exercise, index) => {
          return <ExerciseCard exercise={exercise} index={index} key={index} />;
        })}
      </div>
    </SectionWrapper>
  );
}
