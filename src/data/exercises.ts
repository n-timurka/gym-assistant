import {
  Exercise,
  ExerciseCategory,
  ExerciseType,
} from "@/types/firebase.types";

const exercises: Omit<Exercise, "id">[] = [
  {
    extId: "1",
    name: "Barbell Bench Press",
    category: ExerciseCategory.CHEST,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A compound chest exercise that builds overall upper body strength using a barbell.",
    howTo: [
      "Lie flat on a bench with feet firmly on the floor.",
      "Grip the bar slightly wider than shoulder-width.",
      "Lower the bar to your mid-chest in a controlled motion.",
      "Press the bar upward until your arms are fully extended."
    ],
    primaryMuscles: ["Chest (Pectoralis Major)"],
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    tips: [
      "Keep your shoulder blades retracted throughout the movement.",
      "Do not bounce the bar off your chest.",
      "Maintain a neutral wrist position."
    ],
    similar: ["26", "10", "27"]
  },
  {
    extId: "2",
    name: "Barbell Squat",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A fundamental compound exercise that builds lower body strength and muscle mass.",
    howTo: [
      "Stand with feet shoulder-width apart and barbell on your upper back.",
      "Brace your core and keep your chest up.",
      "Lower your hips until thighs are at least parallel to the floor.",
      "Push through your heels to return to standing."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    tips: [
      "Keep your knees tracking over your toes.",
      "Maintain a neutral spine.",
      "Do not rush the descent."
    ],
    similar: ["9", "22", "46"]
  },
  {
    extId: "3",
    name: "Deadlift",
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A compound exercise that develops overall back strength and posterior chain power.",
    howTo: [
      "Stand with feet hip-width apart and barbell over mid-foot.",
      "Grip the bar just outside your knees and brace your core.",
      "Push through your heels and lift the bar while keeping your back straight.",
      "Stand tall with hips and knees fully extended."
    ],
    primaryMuscles: ["Lower Back", "Erector Spinae"],
    secondaryMuscles: ["Glutes", "Hamstrings", "Trapezius", "Core"],
    tips: [
      "Keep the bar close to your body.",
      "Maintain a neutral spine throughout the lift.",
      "Avoid rounding your lower back."
    ],
    similar: ["39", "33"]
  },
  {
    extId: "4",
    name: "Overhead Barbell Press",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A compound pressing exercise that builds overall shoulder strength and stability.",
    howTo: [
      "Stand with feet shoulder-width apart and hold the barbell at shoulder level.",
      "Brace your core and keep your chest up.",
      "Press the bar straight overhead until arms are fully extended.",
      "Lower the bar back to shoulder level under control."
    ],
    primaryMuscles: ["Shoulders (Deltoids)"],
    secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
    tips: [
      "Keep the bar path straight.",
      "Avoid leaning back excessively.",
      "Engage your core throughout the movement."
    ]
  },
  {
    extId: "5",
    name: "Assisted Pull-Ups",
    category: ExerciseCategory.BACK,
    type: ExerciseType.NO_EQUIPMENT,
    description: "A vertical pulling exercise that builds back strength with machine assistance.",
    howTo: [
      "Kneel or stand on the assisted platform.",
      "Grip the handles with palms facing forward.",
      "Pull your body upward until chin is above the bar.",
      "Lower yourself back down with control."
    ],
    primaryMuscles: ["Latissimus Dorsi"],
    secondaryMuscles: ["Biceps", "Upper Back", "Core"],
    tips: [
      "Reduce assistance gradually over time.",
      "Avoid swinging your body.",
      "Engage your core throughout the movement."
    ]
  },
  {
    extId: "6",
    name: "Barbell Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A classic biceps exercise that builds overall arm size and strength.",
    howTo: [
      "Stand upright holding a barbell with palms facing forward.",
      "Keep elbows close to your torso.",
      "Curl the bar upward toward your shoulders.",
      "Lower the bar slowly back to the starting position."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Avoid swinging your body.",
      "Keep wrists neutral.",
      "Control the movement throughout."
    ],
  },
  {
    extId: "7",
    name: "Seated Dips Machine",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.MACHINES,
    description: "A guided machine exercise that isolates the triceps through pressing motion.",
    howTo: [
      "Sit on the machine and grip the handles.",
      "Keep your back supported by the pad.",
      "Push the handles downward by extending your elbows.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Front Deltoids"],
    tips: [
      "Adjust seat height for proper alignment.",
      "Avoid using momentum.",
      "Control the return phase."
    ],
  },
  {
    extId: "8",
    name: "Crunches",
    category: ExerciseCategory.ABS,
    type: ExerciseType.NO_EQUIPMENT,
    description: "A basic abdominal exercise targeting the upper abs.",
    howTo: [
      "Lie on your back with knees bent and feet flat on the floor.",
      "Place hands behind your head or across your chest.",
      "Lift your shoulders off the floor using your abs.",
      "Lower back down under control."
    ],
    primaryMuscles: ["Rectus Abdominis"],
    secondaryMuscles: ["Obliques"],
    tips: [
      "Do not pull on your neck.",
      "Exhale as you lift.",
      "Focus on controlled movement."
    ],
  },
  {
    extId: "9",
    name: "Seated Leg Press Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "A machine-based exercise that targets the legs with reduced spinal load.",
    howTo: [
      "Sit in the machine with feet shoulder-width apart on the platform.",
      "Release the safety handles.",
      "Lower the platform until knees reach about 90 degrees.",
      "Press the platform away until legs are extended."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    tips: [
      "Do not fully lock your knees.",
      "Keep your lower back pressed into the seat.",
      "Use controlled movement."
    ],
  },
  {
    extId: "10",
    name: "Chest Fly Machine",
    category: ExerciseCategory.CHEST,
    type: ExerciseType.MACHINES,
    description: "An isolation exercise that emphasizes chest muscle contraction using a machine.",
    howTo: [
      "Sit on the machine with your back flat against the pad.",
      "Grip the handles with elbows slightly bent.",
      "Bring the handles together in front of your chest.",
      "Slowly return to the starting position."
    ],
    primaryMuscles: ["Chest (Pectoralis Major)"],
    secondaryMuscles: ["Front Deltoids"],
    tips: [
      "Avoid locking your elbows.",
      "Focus on squeezing the chest, not the arms.",
      "Use a controlled tempo."
    ],
  },
  {
    extId: "11",
    name: "Cable Crossover",
    category: ExerciseCategory.CHEST,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable-based fly exercise that maintains constant tension on the chest.",
    howTo: [
      "Set cable handles at chest height.",
      "Step forward slightly and keep arms extended with a slight bend.",
      "Bring the handles together in front of your chest.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Chest (Pectoralis Major)"],
    secondaryMuscles: ["Front Deltoids"],
    tips: [
      "Keep your core engaged.",
      "Avoid swinging the weights.",
      "Maintain constant tension on the cables."
    ]
  },
  {
    extId: "12",
    name: "Lat Pulldown",
    category: ExerciseCategory.BACK,
    type: ExerciseType.MACHINES,
    description: "A machine-based pulling exercise that targets the latissimus dorsi muscles.",
    howTo: [
      "Sit at the machine and grip the bar wider than shoulder-width.",
      "Pull the bar down toward your upper chest.",
      "Squeeze your shoulder blades at the bottom.",
      "Slowly return the bar to the starting position."
    ],
    primaryMuscles: ["Latissimus Dorsi"],
    secondaryMuscles: ["Biceps", "Rhomboids", "Trapezius"],
    tips: [
      "Do not swing your torso.",
      "Pull elbows down, not back.",
      "Control the return movement."
    ],
  },
  {
    extId: "13",
    name: "Seated Row Machine",
    category: ExerciseCategory.BACK,
    type: ExerciseType.CABLE_MACHINE,
    description: "A horizontal pulling exercise that develops mid-back thickness and control.",
    howTo: [
      "Sit upright and grip the handles with arms extended.",
      "Pull the handles toward your torso.",
      "Squeeze your shoulder blades together.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Middle Back", "Rhomboids"],
    secondaryMuscles: ["Latissimus Dorsi", "Biceps", "Trapezius"],
    tips: [
      "Keep chest up and shoulders down.",
      "Avoid leaning back excessively.",
      "Focus on controlled movement."
    ],
  },
  {
    extId: "14",
    name: "Shoulder Press Machine",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.MACHINES,
    description: "A machine-based pressing exercise that targets the shoulders with guided movement.",
    howTo: [
      "Sit on the machine with your back against the pad.",
      "Grip the handles at shoulder height.",
      "Press the handles upward until arms are extended.",
      "Lower the handles slowly back to the starting position."
    ],
    primaryMuscles: ["Shoulders (Deltoids)"],
    secondaryMuscles: ["Triceps", "Upper Chest"],
    tips: [
      "Do not lock your elbows at the top.",
      "Control the movement throughout the range.",
      "Keep your head neutral."
    ],
  },
  {
    extId: "15",
    name: "Dumbbell Lateral Raises",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An isolation movement that targets the lateral deltoids for shoulder width.",
    howTo: [
      "Hold dumbbells at your sides with palms facing inward.",
      "Raise arms out to the sides until they reach shoulder height.",
      "Pause briefly at the top.",
      "Lower the dumbbells slowly back to your sides."
    ],
    primaryMuscles: ["Lateral Deltoids"],
    secondaryMuscles: ["Upper Trapezius"],
    tips: [
      "Lead with your elbows.",
      "Avoid shrugging your shoulders.",
      "Use lighter weights for better control."
    ],
  },
  {
    extId: "16",
    name: "Hammer Curls",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A curl variation that targets both the biceps and brachialis muscles.",
    howTo: [
      "Hold dumbbells with palms facing each other.",
      "Curl the dumbbells upward while keeping palms neutral.",
      "Pause briefly at the top.",
      "Lower back down under control."
    ],
    primaryMuscles: ["Brachialis", "Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Keep elbows close to your sides.",
      "Avoid swinging the weights.",
      "Use controlled motion."
    ],
  },
  {
    extId: "17",
    name: "Cable Curls",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable-based curl that maintains constant tension on the biceps.",
    howTo: [
      "Attach a straight bar to a low pulley.",
      "Grip the bar with palms facing upward.",
      "Curl the bar toward your shoulders.",
      "Lower slowly back to the starting position."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Keep elbows stationary.",
      "Avoid leaning backward.",
      "Control the return phase."
    ],
  },
  {
    extId: "18",
    name: "Cable Triceps Pushdown",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable exercise that keeps constant tension on the triceps.",
    howTo: [
      "Attach a straight bar or rope to a high pulley.",
      "Grip the handle with elbows close to your sides.",
      "Push the handle downward until arms are fully extended.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Keep elbows fixed in place.",
      "Avoid leaning over the weight stack.",
      "Squeeze triceps at full extension."
    ],
  },
  {
    extId: "19",
    name: "Close-Grip Bench Press",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A compound pressing movement that heavily targets the triceps.",
    howTo: [
      "Lie on a bench and grip the bar slightly narrower than shoulder width.",
      "Lower the bar toward your chest.",
      "Press the bar upward by extending elbows.",
      "Lock out arms at the top."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Chest", "Front Deltoids"],
    tips: [
      "Keep elbows close to the body.",
      "Use moderate weight.",
      "Control the descent."
    ],
  },
  {
    extId: "20",
    name: "Plank",
    category: ExerciseCategory.ABS,
    type: ExerciseType.NO_EQUIPMENT,
    description: "An isometric core exercise that builds abdominal stability.",
    howTo: [
      "Place forearms on the floor and extend legs behind you.",
      "Keep your body in a straight line.",
      "Engage core and hold the position.",
      "Breathe steadily throughout."
    ],
    primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    tips: [
      "Avoid sagging hips.",
      "Keep neck neutral.",
      "Tighten core and glutes."
    ],
  },
  {
    extId: "21",
    name: "Cable Crunches",
    category: ExerciseCategory.ABS,
    type: ExerciseType.MACHINES,
    description: "A weighted abdominal exercise using constant cable tension.",
    howTo: [
      "Attach a rope to a high pulley.",
      "Kneel and hold the rope near your head.",
      "Crunch downward by contracting abs.",
      "Return slowly to the start."
    ],
    primaryMuscles: ["Rectus Abdominis"],
    secondaryMuscles: [],
    tips: [
      "Do not pull with arms.",
      "Focus on abdominal contraction.",
      "Control the movement."
    ],
  },
  {
    extId: "22",
    name: "Lunges",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.NO_EQUIPMENT,
    description: "A dynamic lower body exercise that targets legs and improves balance.",
    howTo: [
      "Step forward with one leg.",
      "Lower your hips until both knees are bent at 90 degrees.",
      "Push back to the starting position.",
      "Alternate legs."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    tips: [
      "Keep your upper body upright.",
      "Do not let your front knee collapse inward.",
      "Control each step."
    ],
  },
  {
    extId: "23",
    name: "Leg Extension Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "An isolation exercise that targets the quadriceps muscles.",
    howTo: [
      "Sit on the machine with ankles behind the pads.",
      "Extend your legs until they are straight.",
      "Pause briefly at the top.",
      "Lower the weight back to the starting position."
    ],
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: [],
    tips: [
      "Avoid locking your knees.",
      "Control the movement.",
      "Do not use excessive weight."
    ],
  },
  {
    extId: "24",
    name: "Lying Hamstring Curl Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "An isolation exercise that targets the hamstrings.",
    howTo: [
      "Lie face down on the machine with ankles under the pads.",
      "Curl your legs upward toward your glutes.",
      "Pause briefly at the top.",
      "Lower back to the starting position."
    ],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: [],
    tips: [
      "Avoid lifting your hips off the pad.",
      "Control the movement.",
      "Do not rush the reps."
    ],
  },
  {
    extId: "25",
    name: "Seated Hamstring Curl Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "A seated hamstring isolation exercise with controlled movement.",
    howTo: [
      "Sit on the machine with legs extended.",
      "Curl your legs downward against the pad.",
      "Pause briefly at full contraction.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: [],
    tips: [
      "Keep your back against the seat.",
      "Avoid using momentum.",
      "Use full range of motion."
    ],
  },
  {
    extId: "26",
    name: "Incline Dumbbell Press",
    category: ExerciseCategory.CHEST,
    type: ExerciseType.FREE_WEIGHTS,
    description: "Targets the upper chest by pressing dumbbells on an inclined bench.",
    howTo: [
      "Set the bench to a 30–45 degree incline.",
      "Hold dumbbells at upper chest level.",
      "Press the dumbbells upward until arms are extended.",
      "Lower them slowly back to the starting position."
    ],
    primaryMuscles: ["Upper Chest"],
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    tips: [
      "Do not set the bench too steep.",
      "Focus on squeezing the upper chest at the top.",
      "Keep movements smooth and controlled."
    ]
  },
  {
    extId: "27",
    name: "Seated Chest Press",
    category: ExerciseCategory.CHEST,
    type: ExerciseType.MACHINES,
    description: "",
  },
  {
    extId: "28",
    name: "Romanian Deadlift (Dumbbells)",
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A unilateral-friendly variation of the RDL that improves balance and muscle control.",
    howTo: [
      "Hold dumbbells in front of your thighs.",
      "Push hips back while lowering the dumbbells.",
      "Lower until you feel tension in your hamstrings.",
      "Return to standing by driving hips forward."
    ],
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes", "Core"],
    tips: [
      "Keep dumbbells close to your legs.",
      "Maintain a neutral spine.",
      "Avoid bending knees excessively."
    ]
  },
  {
    extId: "29",
    name: "Frontal Raises",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An isolation exercise that targets the front portion of the shoulders.",
    howTo: [
      "Hold dumbbells in front of your thighs with palms facing down.",
      "Raise the dumbbells to shoulder height.",
      "Pause briefly at the top.",
      "Lower the dumbbells back to the starting position."
    ],
    primaryMuscles: ["Front Deltoids"],
    secondaryMuscles: ["Upper Chest"],
    tips: [
      "Avoid swinging the weights.",
      "Keep a slight bend in your elbows.",
      "Use controlled movement."
    ],
  },
  {
    extId: "30",
    name: "Lying Barbell Triceps Extension",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A classic triceps builder that emphasizes the long head of the muscle.",
    howTo: [
      "Lie on a flat bench holding a barbell with arms extended.",
      "Lower the bar toward your forehead by bending elbows.",
      "Keep upper arms stationary.",
      "Extend elbows to return to the start."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Use an EZ bar for wrist comfort.",
      "Lower the bar under control.",
      "Avoid flaring elbows."
    ],
  },
  {
    extId: "31",
    name: "Biceps Machine Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.MACHINES,
    description: "A machine-based exercise that isolates the biceps with guided motion.",
    howTo: [
      "Sit in the machine and grip the handles.",
      "Place elbows against the pads.",
      "Curl the handles upward.",
      "Lower the handles slowly back to the start."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: [],
    tips: [
      "Adjust the seat for proper alignment.",
      "Avoid using momentum.",
      "Focus on squeezing the biceps."
    ],
  },
  {
    extId: "32",
    name: "Isolated Biceps Dumbbell Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An isolation movement that emphasizes a single biceps muscle at a time.",
    howTo: [
      "Sit on a bench with one arm resting against your inner thigh.",
      "Hold a dumbbell with palm facing upward.",
      "Curl the dumbbell toward your shoulder.",
      "Lower it slowly back to the start."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Move slowly and with control.",
      "Avoid lifting your elbow.",
      "Focus on the muscle contraction."
    ],
  },
  {
    extId: "33",
    name: "Back Extension",
    category: ExerciseCategory.BACK,
    type: ExerciseType.NO_EQUIPMENT,
    description: "An isolation exercise that strengthens the lower back and spinal stabilizers.",
    howTo: [
      "Position yourself on the back extension bench with hips supported.",
      "Cross arms or hold a weight against your chest.",
      "Lower your torso until your upper body is slightly below parallel.",
      "Raise your torso until your body forms a straight line."
    ],
    primaryMuscles: ["Lower Back", "Erector Spinae"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    tips: [
      "Avoid hyperextending at the top.",
      "Move in a controlled range of motion.",
      "Engage your core throughout."
    ],
  },
  {
    extId: "34",
    name: "Standing Calf Raise Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "An isolation exercise that strengthens the calf muscles.",
    howTo: [
      "Place your shoulders under the pads and feet on the platform.",
      "Lower your heels slowly toward the floor.",
      "Raise your heels as high as possible.",
      "Lower back down under control."
    ],
    primaryMuscles: ["Calves (Gastrocnemius)"],
    secondaryMuscles: ["Soleus"],
    tips: [
      "Pause briefly at the top.",
      "Use a full range of motion.",
      "Avoid bouncing."
    ],
  },
  {
    extId: "35",
    name: "Treadmill",
    category: ExerciseCategory.CARDIO,
    type: ExerciseType.MACHINES,
    description: "A cardio exercise that improves endurance and cardiovascular health.",
    howTo: [
      "Step onto the treadmill and select speed.",
      "Maintain upright posture.",
      "Land softly on each step.",
      "Breathe rhythmically."
    ],
    primaryMuscles: ["Quadriceps", "Hamstrings"],
    secondaryMuscles: ["Glutes", "Calves"],
    tips: [
      "Avoid holding the rails.",
      "Start with a warm-up.",
      "Maintain steady pace."
    ],
  },
  {
    extId: "36",
    name: "Stationary Bike",
    category: ExerciseCategory.CARDIO,
    type: ExerciseType.MACHINES,
    description: "A low-impact cardio exercise suitable for all fitness levels.",
    howTo: [
      "Adjust seat height.",
      "Place feet on pedals.",
      "Pedal at a steady pace.",
      "Increase resistance if needed."
    ],
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Hamstrings", "Glutes"],
    tips: [
      "Keep knees aligned.",
      "Avoid excessive leaning.",
      "Use smooth pedal strokes."
    ],
  },
  {
    extId: "37",
    name: "Elliptical",
    category: ExerciseCategory.CARDIO,
    type: ExerciseType.MACHINES,
    description: "A full-body cardio workout with minimal joint impact.",
    howTo: [
      "Step onto pedals and grip handles.",
      "Move arms and legs simultaneously.",
      "Maintain steady rhythm.",
      "Adjust resistance as needed."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Arms"],
    tips: [
      "Stand upright.",
      "Engage core.",
      "Avoid bouncing."
    ],
  },
  {
    extId: "38",
    name: "Rowing Machine",
    category: ExerciseCategory.CARDIO,
    type: ExerciseType.MACHINES,
    description: "A cardio exercise that trains both upper and lower body.",
    howTo: [
      "Sit on the rower and secure feet.",
      "Push through legs first.",
      "Pull handle toward torso.",
      "Return to start in reverse order."
    ],
    primaryMuscles: ["Back", "Quadriceps"],
    secondaryMuscles: ["Arms", "Core"],
    tips: [
      "Focus on leg drive.",
      "Keep back neutral.",
      "Use smooth strokes."
    ],
  },
  {
    extId: "39",
    name: "Romanian Deadlift (Barbell)",
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A hip-hinge exercise that emphasizes the posterior chain and lower back control.",
    howTo: [
      "Hold the barbell at hip level with a shoulder-width grip.",
      "Push your hips back while keeping legs slightly bent.",
      "Lower the bar along your thighs until you feel a stretch in the hamstrings.",
      "Drive hips forward to return to the starting position."
    ],
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes", "Core"],
    tips: [
      "Do not round your back.",
      "Keep the bar close to your legs.",
      "Move slowly and with control."
    ],
  },
  {
    extId: "40",
    name: "Bent-Over Barbell Row",
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A compound rowing exercise that builds back thickness and strength.",
    howTo: [
      "Hold a barbell with a shoulder-width grip.",
      "Hinge forward at the hips with a flat back.",
      "Pull the bar toward your lower ribs.",
      "Lower the bar back to the starting position."
    ],
    primaryMuscles: ["Middle Back", "Latissimus Dorsi"],
    secondaryMuscles: ["Biceps", "Lower Back", "Rear Deltoids"],
    tips: [
      "Keep your back flat.",
      "Pull elbows toward your hips.",
      "Avoid jerking the weight."
    ]
  },
  {
    extId: "41",
    name: "Single-Arm Dumbbell Row",
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A unilateral rowing exercise that improves muscle balance and back control.",
    howTo: [
      "Place one knee and hand on a bench.",
      "Hold a dumbbell in the opposite hand.",
      "Pull the dumbbell toward your waist.",
      "Lower it slowly to the starting position."
    ],
    primaryMuscles: ["Latissimus Dorsi"],
    secondaryMuscles: ["Middle Back", "Biceps"],
    tips: [
      "Keep your torso stable.",
      "Pull with your elbow, not your hand.",
      "Avoid twisting your body."
    ]
  },
  {
    extId: "42",
    name: "Cable Lateral Raise",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable variation of the lateral raise that maintains constant tension.",
    howTo: [
      "Set the cable handle at the lowest position.",
      "Stand sideways to the machine and grip the handle.",
      "Raise your arm out to the side until shoulder height.",
      "Lower slowly back to the starting position."
    ],
    primaryMuscles: ["Lateral Deltoids"],
    secondaryMuscles: ["Upper Trapezius"],
    tips: [
      "Keep tension on the cable throughout the movement.",
      "Avoid swinging your torso.",
      "Move slowly and with control."
    ]
  },
  {
    extId: "43",
    name: "Bent-Over Dumbbell Fly",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An isolation exercise that targets the rear deltoids and upper back.",
    howTo: [
      "Hinge forward at the hips with a flat back.",
      "Hold dumbbells with arms hanging down.",
      "Raise the dumbbells out to the sides.",
      "Lower them slowly to the starting position."
    ],
    primaryMuscles: ["Rear Deltoids"],
    secondaryMuscles: ["Upper Back", "Trapezius"],
    tips: [
      "Keep your neck neutral.",
      "Avoid using momentum.",
      "Focus on squeezing the rear delts."
    ]
  },
  {
    extId: "44",
    name: "Cable Face Pull",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable exercise that strengthens the rear shoulders and improves shoulder health.",
    howTo: [
      "Set the cable pulley at face height.",
      "Grip the rope attachment with both hands.",
      "Pull the rope toward your face while spreading your hands apart.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Rear Deltoids"],
    secondaryMuscles: ["Upper Trapezius", "Rhomboids"],
    tips: [
      "Pull elbows high and wide.",
      "Focus on external shoulder rotation.",
      "Use moderate weight for control."
    ]
  },
  {
    extId: "45",
    name: "Dumbbell Shrugs",
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An isolation exercise that targets the upper trapezius muscles.",
    howTo: [
      "Hold dumbbells at your sides with arms extended.",
      "Lift your shoulders straight upward.",
      "Pause briefly at the top.",
      "Lower your shoulders back down slowly."
    ],
    primaryMuscles: ["Upper Trapezius"],
    secondaryMuscles: ["Neck Stabilizers"],
    tips: [
      "Avoid rolling your shoulders.",
      "Use a controlled tempo.",
      "Focus on vertical movement."
    ]
  },
  {
    extId: "46",
    name: "Smith Machine Squat",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "A guided squat variation that emphasizes leg muscles with added stability.",
    howTo: [
      "Position yourself under the bar with feet slightly forward.",
      "Unrack the bar and brace your core.",
      "Lower into a squat position.",
      "Push upward to return to the starting position."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    tips: [
      "Avoid locking your knees at the top.",
      "Control the range of motion.",
      "Adjust foot placement for comfort."
    ]
  },
  {
    extId: "47",
    name: "Bulgarian Split Squat",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A unilateral leg exercise that improves strength, balance, and coordination.",
    howTo: [
      "Place one foot behind you on a bench.",
      "Lower your hips until front thigh is parallel to the floor.",
      "Push through the front heel to stand up.",
      "Repeat on the other side."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    tips: [
      "Keep your torso upright.",
      "Move slowly and under control.",
      "Ensure knee stability."
    ]
  },
  {
    extId: "48",
    name: "Standing Cable Hip Abduction",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable exercise that targets the hip abductors and glutes.",
    howTo: [
      "Attach an ankle strap to the cable.",
      "Stand sideways to the machine.",
      "Move your leg outward away from your body.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Gluteus Medius"],
    secondaryMuscles: ["Hip Abductors"],
    tips: [
      "Keep your torso stable.",
      "Move slowly and with control.",
      "Avoid leaning sideways."
    ]
  },
  {
    extId: "49",
    name: "Seated Hip Abduction Machine",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.MACHINES,
    description: "A machine-based exercise that strengthens the outer hip muscles.",
    howTo: [
      "Sit on the machine with legs inside the pads.",
      "Push your legs outward against resistance.",
      "Pause briefly at the end range.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Gluteus Medius"],
    secondaryMuscles: ["Hip Abductors"],
    tips: [
      "Do not rush the movement.",
      "Sit upright throughout.",
      "Use controlled resistance."
    ]
  },
  {
    extId: "50",
    name: "Hip Thrust",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A glute-focused exercise that builds hip strength and power.",
    howTo: [
      "Rest your upper back on a bench.",
      "Place feet flat on the floor with knees bent.",
      "Drive hips upward until torso is parallel to the floor.",
      "Lower hips back down under control."
    ],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    tips: [
      "Squeeze glutes at the top.",
      "Keep ribs down and core engaged.",
      "Avoid overextending your lower back."
    ]
  },
  {
    extId: "51",
    name: "Sumo Squat",
    category: ExerciseCategory.LEGS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A wide-stance squat variation that emphasizes inner thighs and glutes.",
    howTo: [
      "Stand with feet wider than shoulder-width and toes pointed outward.",
      "Lower hips down while keeping chest upright.",
      "Push through heels to stand back up.",
      "Maintain knee alignment throughout."
    ],
    "primaryMuscles": ["Adductors", "Glutes"],
    "secondaryMuscles": ["Quadriceps", "Hamstrings"],
    "tips": [
      "Push knees outward during descent.",
      "Maintain a neutral spine.",
      "Control the depth."
    ]
  },
  {
    extId: "52",
    name: "Dumbbell Biceps Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A unilateral biceps exercise that improves muscle balance and control.",
    howTo: [
      "Stand holding dumbbells at your sides with palms facing forward.",
      "Curl the dumbbells upward toward your shoulders.",
      "Squeeze the biceps at the top.",
      "Lower the dumbbells under control."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Move one arm at a time for better focus.",
      "Avoid locking elbows at the bottom.",
      "Maintain good posture."
    ]
  },
  {
    extId: "53",
    name: "Preacher Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A supported curl exercise that isolates the biceps and limits momentum.",
    howTo: [
      "Sit at a preacher bench and grip the bar or EZ bar.",
      "Place upper arms firmly against the pad.",
      "Curl the weight upward toward your shoulders.",
      "Lower the weight slowly back to the start."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Do not fully lock elbows at the bottom.",
      "Use moderate weight.",
      "Focus on slow negatives."
    ]
  },
  {
    extId: "54",
    name: "EZ-Bar Biceps Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A barbell curl variation that reduces wrist strain using an angled bar.",
    howTo: [
      "Hold the EZ bar with an underhand grip.",
      "Curl the bar upward toward your chest.",
      "Squeeze the biceps at the top.",
      "Lower the bar back down with control."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Choose a grip that feels comfortable.",
      "Avoid excessive body movement.",
      "Control the lowering phase."
    ]
  },
  {
    extId: "55",
    name: "Biceps Concentration Curl",
    category: ExerciseCategory.BICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "A single-arm curl that maximizes biceps contraction and focus.",
    howTo: [
      "Sit on a bench with legs apart.",
      "Rest your elbow against your inner thigh.",
      "Curl the dumbbell upward toward your shoulder.",
      "Lower slowly to the starting position."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    tips: [
      "Pause briefly at the top.",
      "Avoid swinging the arm.",
      "Focus on strict form."
    ]
  },
  {
    extId: "56",
    name: "Assisted Dips Machine",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.MACHINES,
    description: "A machine-assisted dip that reduces bodyweight for controlled triceps activation.",
    howTo: [
      "Select the desired assistance weight.",
      "Place knees or feet on the platform.",
      "Grip the handles and lower your body.",
      "Press upward by extending your elbows."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Chest", "Front Deltoids"],
    tips: [
      "Keep elbows pointing backward.",
      "Maintain an upright torso.",
      "Use controlled motion."
    ]
  },
  {
    extId: "57",
    name: "Overhead Dumbbell Triceps Extension",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.FREE_WEIGHTS,
    description: "An overhead movement that strongly activates the long head of the triceps.",
    howTo: [
      "Hold a dumbbell overhead with both hands.",
      "Lower the dumbbell behind your head.",
      "Keep elbows pointing forward.",
      "Extend arms to return to the start."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Shoulders"],
    tips: [
      "Keep core engaged.",
      "Avoid flaring elbows.",
      "Use controlled motion."
    ]
  },
  {
    extId: "58",
    name: "Cable Overhead Triceps Extension",
    category: ExerciseCategory.TRICEPS,
    type: ExerciseType.CABLE_MACHINE,
    description: "A cable-based overhead extension that keeps constant tension on the triceps.",
    howTo: [
      "Attach a rope to a high pulley.",
      "Face away from the machine and hold the rope overhead.",
      "Extend elbows until arms are straight.",
      "Return slowly to the bent-arm position."
    ],
    primaryMuscles: ["Triceps Brachii"],
    secondaryMuscles: ["Shoulders"],
    tips: [
      "Keep elbows stable.",
      "Focus on full extension.",
      "Avoid arching the lower back."
    ]
  },
  {
    extId: "59",
    name: "Hanging Leg Raise",
    category: ExerciseCategory.ABS,
    type: ExerciseType.NO_EQUIPMENT,
    description: "An advanced abdominal exercise emphasizing lower abs.",
    howTo: [
      "Hang from a pull-up bar with arms extended.",
      "Lift legs upward until they are parallel to the floor or higher.",
      "Control the movement at the top.",
      "Lower legs slowly back down."
    ],
    primaryMuscles: ["Lower Rectus Abdominis"],
    secondaryMuscles: ["Hip Flexors", "Forearms"],
    tips: [
      "Avoid swinging.",
      "Engage core throughout.",
      "Use slow controlled reps."
    ]
  },
  {
    extId: "60",
    name: "Ab Machine Crunch",
    category: ExerciseCategory.ABS,
    type: ExerciseType.MACHINES,
    description: "A machine-based exercise that isolates the abdominal muscles.",
    howTo: [
      "Sit in the ab machine and grip the handles.",
      "Crunch forward using your abs.",
      "Pause briefly at full contraction.",
      "Return slowly to the starting position."
    ],
    primaryMuscles: ["Rectus Abdominis"],
    secondaryMuscles: [],
    tips: [
      "Adjust seat properly.",
      "Avoid jerking motion.",
      "Focus on squeezing abs."
    ]
  },
  {
    extId: "61",
    name: "Stair Climber",
    category: ExerciseCategory.CARDIO,
    type: ExerciseType.MACHINES,
    description: "A cardio workout that targets legs and glutes.",
    howTo: [
      "Step onto the machine.",
      "Climb stairs at a steady pace.",
      "Maintain upright posture.",
      "Avoid leaning on handles."
    ],
    primaryMuscles: ["Glutes", "Quadriceps"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    tips: [
      "Use full steps.",
      "Keep steady pace.",
      "Engage glutes."
    ]
  },
];

export { exercises };
