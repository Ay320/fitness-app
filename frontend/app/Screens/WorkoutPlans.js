import { exercises } from './Exercises'; 

export const workoutPlans = [
  {
    id: 'plan1',
    name: 'Push Day',
    days: [
      {
        day: 'Monday',
        exercises: [exercises[0], exercises[2], exercises[4]] 
      },
      {
        day: 'Thursday',
        exercises: [exercises[0], exercises[3]] 
      }
    ]
  },
  {
    id: 'plan2',
    name: 'Pull Day',
    days: [
      {
        day: 'Tuesday',
        exercises: [exercises[5], exercises[6], exercises[7]] 
      },
      {
        day: 'Friday',
        exercises: [exercises[5], exercises[8]] 
      }
    ]
  },
  {
    id: 'plan3',
    name: 'Leg Day',
    days: [
      {
        day: 'Wednesday',
        exercises: [exercises[9], exercises[10], exercises[11]] 
      },
      {
        day: 'Saturday',
        exercises: [exercises[9], exercises[12]]
      }
    ]
  }
];
