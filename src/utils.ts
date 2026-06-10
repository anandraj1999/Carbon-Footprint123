/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, FootprintSummary, CommittedAction } from "./types";

// Default questionnaire state for welcoming initial experience
export const INITIAL_ANSWERS: QuestionnaireAnswers = {
  commuteMiles: 150,
  vehicleType: "gas",
  mpg: 25,
  shortFlights: 2,
  longFlights: 1,
  electricityBill: 120,
  cleanEnergy: false,
  thermostatLevel: "moderate",
  efficientAppliances: false,
  dietPreference: "balanced",
  localFoodPreference: "sometimes",
  recyclingLevel: "occasional",
  composting: false,
  shoppingHabits: "average",
};

// Calculate carbon footprint in metric tons of CO2e per year
export function calculateFootprint(answers: QuestionnaireAnswers): FootprintSummary {
  // 1. Transportation Category
  let transportEmissions = 0;
  
  if (answers.vehicleType !== "none" && answers.commuteMiles > 0) {
    const annualCommuteMiles = answers.commuteMiles * 52;
    // Estimate fuel usage based on MPG
    const gallons = annualCommuteMiles / (answers.mpg || 25);
    
    // Emissions coefficients (kg of CO2 per gallon or mile equivalent)
    if (answers.vehicleType === "gas") {
      // Gas vehicle: ~8.887 kg CO2 per gallon, plus indirect emissions
      transportEmissions += (gallons * 9.5) / 1000;
    } else if (answers.vehicleType === "hybrid") {
      // Hybrid vehicle offset
      transportEmissions += (gallons * 8.5) / 1000;
    } else if (answers.vehicleType === "electric") {
      // Electric vehicle: depends on grid footprint. Let's estimate ~0.08 kg CO2 per mile
      transportEmissions += (annualCommuteMiles * 0.08) / 1000;
    }
  }

  // Add flight emissions (short flight ~0.24 tons, long flight ~0.95 tons CO2e)
  transportEmissions += answers.shortFlights * 0.24;
  transportEmissions += answers.longFlights * 0.95;

  // 2. Home Energy Category
  // Calculate average electricity and apply optimization multipliers
  let energyEmissions = (answers.electricityBill * 12 * 0.0035); // Base estimation: ~$1 bill = ~0.0035 tons CO2e annual
  
  if (answers.cleanEnergy) {
    // Cut emissions by 75% for clean energy solar/wind subscriber
    energyEmissions *= 0.25;
  }
  
  // Efficient appliances reduce baseline energy by 15%
  if (answers.efficientAppliances) {
    energyEmissions *= 0.85;
  }

  // Thermostat adjustment
  if (answers.thermostatLevel === "energy-saving") {
    energyEmissions *= 0.88; // 12% savings
  } else if (answers.thermostatLevel === "cool" || answers.thermostatLevel === "warm") {
    energyEmissions *= 1.08; // 8% heating/cooling increase
  }

  // 3. Diet / Food Category
  let dietEmissions = 2.0; // Balanced diet average: 2.0 tons CO2e/year
  if (answers.dietPreference === "heavy-meat") {
    dietEmissions = 3.1;
  } else if (answers.dietPreference === "vegetarian") {
    dietEmissions = 1.3;
  } else if (answers.dietPreference === "vegan") {
    dietEmissions = 0.8;
  }

  // Locality offset
  if (answers.localFoodPreference === "always") {
    dietEmissions -= 0.15;
  } else if (answers.localFoodPreference === "rarely") {
    dietEmissions += 0.15;
  }

  // Ensure food emissions stay above sensible minimum
  dietEmissions = Math.max(dietEmissions, 0.6);

  // 4. Consumption & Waste Category
  let wasteEmissions = 1.6; // Average consumption footprint

  if (answers.shoppingHabits === "eco-conscious") {
    wasteEmissions = 0.7;
  } else if (answers.shoppingHabits === "high-consumption") {
    wasteEmissions = 2.6;
  }

  // Recycling offset
  if (answers.recyclingLevel === "consistent") {
    wasteEmissions -= 0.25;
  } else if (answers.recyclingLevel === "none") {
    wasteEmissions += 0.15;
  }

  // Composting offset
  if (answers.composting) {
    wasteEmissions -= 0.15;
  }

  wasteEmissions = Math.max(wasteEmissions, 0.4);

  const total = transportEmissions + energyEmissions + dietEmissions + wasteEmissions;

  return {
    transport: Number(transportEmissions.toFixed(2)),
    energy: Number(energyEmissions.toFixed(2)),
    diet: Number(dietEmissions.toFixed(2)),
    waste: Number(wasteEmissions.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// Initial set of committed actions for localized tracking
export const INITIAL_ACTIONS: CommittedAction[] = [
  { id: "act-1", name: "Walk, bike, or use transit for short trips", category: "transport", co2SavedKg: 3.5, completed: false },
  { id: "act-2", name: "Consolidate driving trips / carpool with friends", category: "transport", co2SavedKg: 4.8, completed: false },
  { id: "act-3", name: "Turn off lights & standby power in unused rooms", category: "energy", co2SavedKg: 1.2, completed: false },
  { id: "act-4", name: "Adjust thermostat level by 2°F (cooler in winter, warmer in summer)", category: "energy", co2SavedKg: 2.1, completed: false },
  { id: "act-5", name: "Skip red meat for all meals (Meatless Day)", category: "diet", co2SavedKg: 4.5, completed: false },
  { id: "act-6", name: "Choose local, organic crop ingredients for meals", category: "diet", co2SavedKg: 1.5, completed: false },
  { id: "act-7", name: "Avoid purchasing single-use plastic cups/straws", category: "waste", co2SavedKg: 0.8, completed: false },
  { id: "act-8", name: "Recycle completely or compost kitchen scraps today", category: "waste", co2SavedKg: 1.4, completed: false },
];
