import { EXERCISES, SCHEMES, TEMPOS, WORKOUTS } from "./swoldier";
import { IExercises, IExercise, SCHEMES_TYPE, WORKOUTS_TYPE } from "./swoldier";

const exercises = exercisesFlattener(EXERCISES);

interface IGenerateWorkout {
  poison: keyof typeof WORKOUTS_TYPE;
  muscles: string[];
  goal: keyof typeof SCHEMES_TYPE;
}

export interface IWorkoutOfDay extends IExercise {
  name: string;
  tempo: string;
  rest: number;
  reps: number;
}

export function generateWorkout(args: IGenerateWorkout): IWorkoutOfDay[] {
  const { poison, muscles, goal } = args;
  const exercise: string[] = Object.keys(exercises).filter((key) => {
    return exercises[key].meta.environment !== "home";
  });
  const includedTracker: string[] = [];
  // const numSets: number = 5;
  let listOfMuscles: string[] = [];

  if (poison === "individual") {
    listOfMuscles = muscles;
  } else {
    const workoutPoison = WORKOUTS[poison] as { [key: string]: string[] };
    listOfMuscles = workoutPoison[muscles[0]];
  }

  /** random muscle part */
  const shuffleListOfMuscles = new Set(shuffleArray(listOfMuscles));
  const arrOfMuscles = Array.from(shuffleListOfMuscles.values());

  /**
   * accroding to scheme(goal) schedule muscle group by excise type (compound、accessory)
   */
  const scheme: keyof typeof SCHEMES_TYPE = goal;
  const sets = SCHEMES[scheme as keyof typeof SCHEMES].ratio
    .reduce((acc: string[], curr: number, index: number) => {
      return [
        ...acc,
        ...[...Array(curr).keys()].map(() => {
          return index === 0 ? "compound" : "accessory";
        }),
      ];
    }, [])
    .reduce(
      (
        acc: { setType: string; muscleGroup: string }[],
        curr: string,
        index: number
      ) => {
        const muscleGroupToUse =
          index < arrOfMuscles.length
            ? arrOfMuscles[index]
            : arrOfMuscles[index % arrOfMuscles.length];

        return [
          ...acc,
          {
            setType: curr,
            muscleGroup: muscleGroupToUse,
          },
        ];
      },
      []
    );

  /**
   * specify equipment: catagorize compound、accessory
   */
  const {
    compound: compoundExercises,
    accessory: accessoryExercises,
  }: { compound: IExercises; accessory: IExercises } = exercise.reduce(
    (acc, curr) => {
      let exerciseHasRequiredMuscle = false;
      for (const muscle of exercises[curr].muscles) {
        if (listOfMuscles.includes(muscle)) {
          exerciseHasRequiredMuscle = true;
        }
      }

      return exerciseHasRequiredMuscle
        ? {
            ...acc,
            [exercises[curr].type]: {
              ...acc[exercises[curr].type as keyof typeof acc],
              [curr]: exercises[curr],
            },
          }
        : acc;
    },
    {
      compound: {},
      accessory: {},
    }
  );

  const genWOD = sets.map(({ setType, muscleGroup }) => {
    const data =
      setType === "compound" ? compoundExercises : accessoryExercises;
    const filterObj = Object.keys(data).reduce((acc, curr: string) => {
      if (
        includedTracker.includes(curr) ||
        !data[curr as keyof typeof data].muscles.includes(muscleGroup)
      ) {
        return acc;
      }
      return { ...acc, [curr]: exercises[curr] };
    }, {});

    const filteredDataList = Object.keys(filterObj);
    const filteredOppList = Object.keys(
      setType === "compound" ? compoundExercises : accessoryExercises
    ).filter((val) => !includedTracker.includes(val));

    /** pick a random exercise */
    const randomExercise =
      filteredDataList[Math.floor(Math.random() * filteredDataList.length)] ||
      filteredOppList[Math.floor(Math.random() * filteredOppList.length)];

    if (!randomExercise) return {} as IWorkoutOfDay;

    /** time and set */
    const repRanges = SCHEMES[scheme as keyof typeof SCHEMES_TYPE].repRanges;
    let repsOrDuraction =
      exercises[randomExercise].unit === "reps"
        ? Math.min(...repRanges) +
          Math.floor(
            Math.random() * (Math.max(...repRanges) - Math.min(...repRanges))
          ) +
          (setType === "accessory" ? 4 : 0)
        : Math.floor(Math.random() * 40) + 20;
    const tempo = TEMPOS[Math.floor(Math.random() * TEMPOS.length)];

    if (exercises[randomExercise].unit === "reps") {
      const tempoSum = tempo.split(" ").reduce((acc: number, curr: string) => {
        return acc + parseInt(curr);
      }, 0);

      if (tempoSum * repsOrDuraction > 85) {
        repsOrDuraction = Math.floor(85 / tempoSum);
      }
    } else {
      // set to nearest 5 seconds
      repsOrDuraction = Math.ceil(repsOrDuraction / 5) * 5;
    }

    includedTracker.push(randomExercise);

    return {
      name: randomExercise,
      tempo,
      rest: SCHEMES[scheme]["rest"][setType === "compound" ? 0 : 1],
      reps: repsOrDuraction,
      ...exercises[randomExercise],
    };
  });

  return genWOD.filter((element) => Object.keys(element).length > 0);
}

/**
 * random array
 * @param array
 * @returns
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * flattens EXERCISES with all the variants、add all the other variants to the substitute list
 * @param exercisesObj
 * @returns
 */
export function exercisesFlattener(exercisesObj: IExercises) {
  const flattenedObj: { [key: string]: IExercise } = {};

  for (const [key, val] of Object.entries(exercisesObj)) {
    if (!("variants" in val)) {
      flattenedObj[key] = val;
    } else {
      for (const variant in val.variants) {
        const variantName = `${variant}_${key}`;
        const variantSubstitutes = Object.keys(val.variants)
          .map((element) => {
            return `${element} ${key}`;
          })
          .filter((element) => element.replaceAll(" ", "_") !== variantName);

        flattenedObj[variantName] = {
          ...val,
          description: `${val.description}___${val.variants[variant]}`,
          substitutes: [...val.substitutes, ...variantSubstitutes].slice(0, 5),
        };
      }
    }
  }

  return flattenedObj;
}
