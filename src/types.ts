/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuestionnaireAnswers {
  // Transport
  commuteMiles: number; // miles per week
  vehicleType: "gas" | "hybrid" | "electric" | "none";
  mpg: number; // miles per gallon
  shortFlights: number; // flights per year (<3 hours)
  longFlights: number; // flights per year (>3 hours)

  // Energy
  electricityBill: number; // average electricity bill per month ($)
  cleanEnergy: boolean; // subscribed to renewable/clean energy
  thermostatLevel: "cool" | "moderate" | "warm" | "energy-saving";
  efficientAppliances: boolean;

  // Diet / Food
  dietPreference: "heavy-meat" | "balanced" | "vegetarian" | "vegan";
  localFoodPreference: "rarely" | "sometimes" | "always";

  // Waste / Consumption
  recyclingLevel: "none" | "occasional" | "consistent";
  composting: boolean;
  shoppingHabits: "eco-conscious" | "average" | "high-consumption";
}

export interface FootprintSummary {
  transport: number; // annual metric tons of CO2e
  energy: number;    // annual metric tons of CO2e
  diet: number;      // annual metric tons of CO2e
  waste: number;     // annual metric tons of CO2e
  total: number;     // annual metric tons of CO2e
}

export interface CommittedAction {
  id: string;
  name: string;
  category: "transport" | "energy" | "diet" | "waste";
  co2SavedKg: number; // kilograms saved per occurrence
  completed: boolean;
}

export interface SubmissionDetails {
  gitHubUrl: string;
  deployedUrl: string;
  linkedinPostUrl: string;
  savedLocally: boolean;
}

export interface AIResult {
  summary: string;
  insights: Array<{
    category: string;
    impact: "High" | "Medium" | "Low";
    observation: string;
    recommendation: string;
  }>;
  quickWins: Array<{
    action: string;
    reductionKg: number;
    difficulty: "Easy" | "Medium";
  }>;
  longTermHabits: Array<{
    habit: string;
    reductionKgPerYear: number;
    timeline: string;
  }>;
}
