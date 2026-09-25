export type Question = {
  id: string;
  question: string;
  options: string[];
  /** Index of the correct option, or indexes when several are correct ("select all that apply"). */
  answer: number | number[];
  /** Short explanation shown after the player answers. */
  fact?: string;
  /** Keep the written option order (True/False). Other questions are shuffled per player. */
  keepOrder?: boolean;
};

const TRUE_FALSE = ["True", "False"];

/**
 * The question bank: "Solar Pro Quiz, Set 1 of 5". Every player gets 5
 * questions picked at random from this list, with the options shuffled.
 * Add more sets by appending questions with new ids (e.g. "s2-01"). Never
 * reuse the id of a removed question: existing leads store the ids they were asked.
 */
export const QUESTIONS: Question[] = [
  {
    id: "s1-01",
    question: "What is the primary function of a solar PV module?",
    options: [
      "Convert sunlight into DC electrical energy",
      "Convert AC electricity into DC electricity",
      "Store electrical energy",
      "Convert DC electricity into AC electricity",
    ],
    answer: 0,
    fact: "PV cells turn sunlight directly into DC electricity. An inverter then converts it to AC for your home.",
  },
  {
    id: "s1-02",
    question: "Which unit is normally used to express the rated power of a solar PV module?",
    options: ["kWh", "kW or Wp", "Ah", "VAr"],
    answer: 1,
    fact: "Module power is rated in watts-peak (Wp): the output under standard test conditions. kWh measures energy, not power.",
  },
  {
    id: "s1-03",
    question:
      "In a series-connected string of identical PV modules, which electrical quantity is approximately the same through each module?",
    options: ["Voltage", "Current", "Power", "Energy"],
    answer: 1,
    fact: "In a series string the same current flows through every module, while their voltages add up.",
  },
  {
    id: "s1-04",
    question: "What happens to the voltage when identical PV modules are connected in series?",
    options: ["Their voltages add", "Their currents add", "Their voltage becomes zero", "Their power always becomes zero"],
    answer: 0,
    fact: "Series connection adds voltages: for example, 10 modules of 40 V each make a string of about 400 V.",
  },
  {
    id: "s1-05",
    question: "What is the main purpose of an MPPT in a solar inverter?",
    options: [
      "Track the PV array's maximum-power operating point",
      "Store excess solar energy",
      "Provide mechanical support to modules",
      "Measure household electricity consumption only",
    ],
    answer: 0,
    fact: "MPPT (Maximum Power Point Tracking) keeps adjusting voltage and current so the array delivers the most power possible.",
  },
  {
    id: "s1-06",
    question: "Which factors can affect the electrical output of a PV system during operation?",
    options: ["Solar irradiance", "Cell temperature", "Partial shading", "House wall paint color alone"],
    answer: [0, 1, 2],
    fact: "Sunlight intensity, cell temperature and shading all change PV output. The colour of the walls on its own does not.",
  },
  {
    id: "s1-07",
    question: "A solar PV module normally produces DC electricity.",
    options: TRUE_FALSE,
    answer: 0,
    keepOrder: true,
    fact: "PV modules produce direct current (DC). The inverter converts it to AC for your appliances.",
  },
  {
    id: "s1-08",
    question: "What does kWh measure in a solar-energy system?",
    options: ["Electrical energy", "Electrical resistance", "Electrical current", "Electrical voltage"],
    answer: 0,
    fact: "kWh is energy: power (kW) × time (hours). The “units” on your electricity bill are kWh.",
  },
  {
    id: "s1-09",
    question: "A 5 kW load operates continuously for 2 hours. How much electrical energy does it consume?",
    options: ["2.5 kWh", "7 kWh", "10 kWh", "20 kWh"],
    answer: 2,
    fact: "Energy = power × time: 5 kW × 2 h = 10 kWh.",
  },
  {
    id: "s1-10",
    question: "Which device converts the DC output of a PV array into AC electricity for typical AC loads?",
    options: ["Inverter", "Transformer only", "Circuit breaker", "Earthing electrode"],
    answer: 0,
    fact: "The inverter converts the array's DC output into AC at the grid's voltage and frequency.",
  },
  {
    id: "s1-11",
    question: "What is the main electrical characteristic of a parallel connection of identical PV strings?",
    options: [
      "Voltages add while current stays the same",
      "Currents add while voltage remains approximately the same",
      "Both voltage and current become zero",
      "Only frequency increases",
    ],
    answer: 1,
    fact: "Strings in parallel add their currents while the voltage stays about the same.",
  },
  {
    id: "s1-12",
    question: "Which condition generally causes the open-circuit voltage of a crystalline-silicon PV module to decrease?",
    options: [
      "Higher cell temperature",
      "Lower cell temperature",
      "Adding sunlight with no temperature change always lowers voltage",
      "Increasing cable length alone",
    ],
    answer: 0,
    fact: "Module voltage falls as the cells heat up, which is why panels perform better in cooler weather.",
  },
  {
    id: "s1-13",
    question: "What is the primary purpose of an MCB or appropriately selected circuit breaker in a solar installation?",
    options: [
      "Provide overcurrent protection and switching",
      "Increase PV generation",
      "Store solar energy",
      "Improve module efficiency by cooling cells",
    ],
    answer: 0,
    fact: "A breaker trips on overcurrent to protect cables and equipment, and lets circuits be switched off safely.",
  },
  {
    id: "s1-14",
    question: "Why is proper earthing important in a solar electrical installation?",
    options: [
      "It provides a path for fault currents and supports electrical safety",
      "It guarantees higher solar generation",
      "It replaces all circuit protection",
      "It converts DC to AC",
    ],
    answer: 0,
    fact: "Earthing gives fault currents a safe path so protective devices can operate and people stay safe.",
  },
  {
    id: "s1-15",
    question: "A battery is rated at 51.2 V and 314 Ah. Approximately what is its nominal energy capacity?",
    options: ["3.14 kWh", "10.0 kWh", "16.1 kWh", "51.2 kWh"],
    answer: 2,
    fact: "Energy ≈ voltage × capacity: 51.2 V × 314 Ah ≈ 16,077 Wh ≈ 16.1 kWh.",
  },
  {
    id: "s1-16",
    question: "Which are common categories of residential solar PV systems?",
    options: ["Grid-connected systems", "Off-grid systems", "Hybrid systems", "Hydraulic-only systems"],
    answer: [0, 1, 2],
    fact: "Homes use grid-connected (on-grid), off-grid (battery only) or hybrid (grid + battery) systems.",
  },
  {
    id: "s1-17",
    question: "Increasing the number of identical PV modules connected in series generally increases the string voltage.",
    options: TRUE_FALSE,
    answer: 0,
    keepOrder: true,
    fact: "Each module added in series adds its voltage to the string.",
  },
  {
    id: "s1-18",
    question: "A solar inverter's rated AC power is most directly expressed in which unit?",
    options: ["kW", "Ah", "kWh", "Ω"],
    answer: 0,
    fact: "Inverter output power is rated in kW. kWh measures energy delivered over time.",
  },
  {
    id: "s1-19",
    question:
      "If a PV system produces 24 kWh of energy over a day and the equivalent full-sun operating period is 6 hours, what is the corresponding average power over those equivalent hours?",
    options: ["2 kW", "4 kW", "6 kW", "24 kW"],
    answer: 1,
    fact: "Average power = energy ÷ time: 24 kWh ÷ 6 h = 4 kW.",
  },
  {
    id: "s1-20",
    question:
      "During a customer consultation for a residential solar system, which information is most useful as an initial basis for system sizing?",
    options: [
      "Recent electricity consumption and load profile",
      "The customer's favorite panel color",
      "Only the number of rooms",
      "Only the age of the house",
    ],
    answer: 0,
    fact: "Recent bills and the household's load profile show how much energy the system needs to produce.",
  },
];
