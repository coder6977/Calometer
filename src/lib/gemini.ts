import { GoogleGenAI } from "@google/genai";
import { UserProfile, Meal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDietarySuggestions(
  profile: UserProfile,
  dailyGoal: number,
  remainingCalories: number,
  mealsToday: Meal[]
) {
  const mealInfo = mealsToday.length > 0 
    ? mealsToday.map(m => `${m.name} (${m.calories} cal)`).join(', ')
    : 'No meals logged yet';

  const prompt = `
    User Profile:
    - Goal: ${profile.goal}
    - Daily Calorie Goal: ${dailyGoal} calories
    - Remaining Calories for today: ${remainingCalories} calories
    - Meals already eaten today: ${mealInfo}

    Based on the remaining calories and the user's fitness goal, please suggest 2-3 healthy meal or snack options they can eat for the rest of the day to stay within their limit.
    Keep the suggestions concise, nutritional, and practical.
    Return the response in a friendly, encouraging tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional nutritionist and dietary coach. Provide helpful, accurate, and encouraging food suggestions based on calorie targets.",
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate suggestions at this time. Try again later!";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, I'm having trouble connecting to my creative kitchen. Please try again later.";
  }
}

export async function getSpecificMealSuggestions(
  profile: UserProfile,
  remainingCalories: number
) {
  const prompt = `
    User Goal: ${profile.goal}
    Available Budget for next meal: ${remainingCalories} calories
    
    Recommend 3 specific dishes the user could eat next.
    For each dish, provide:
    1. Name of the dish
    2. Approximate calorie count
    3. Why it fits their ${profile.goal} goal.
    
    Format the response as a simple list. Keep it very concise (max 2 sentences per dish).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a meal planning expert. You provide short, actionable meal recommendations based on strict calorie budgets.",
        temperature: 0.6,
      }
    });

    return response.text || "No suggestions available";
  } catch (error) {
    console.error("Gemini Suggestions error:", error);
    return "Failed to fetch meal ideas.";
  }
}

export async function estimateMealCalories(mealName: string, portion: string): Promise<number> {
  const prompt = `
    Estimate the total calories for the following meal:
    Meal: ${mealName}
    Portion Size: ${portion}

    Provide only the estimated calorie number as a plain integer. If you are unsure, provide a reasonable average estimate based on standard nutritional data. 
    Do not include any text, units, or explanation. Just the number.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", // Fast model for simple estimation
      contents: prompt,
      config: {
        systemInstruction: "You are a nutritional database. You respond with raw numbers representing calorie estimates.",
        temperature: 0.1,
      }
    });

    const text = response.text || "0";
    const calories = parseInt(text.replace(/[^0-9]/g, ''));
    return isNaN(calories) ? 0 : calories;
  } catch (error) {
    console.error("Gemini Estimation API error:", error);
    return 0;
  }
}
