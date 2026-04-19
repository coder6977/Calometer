import { UserProfile, Meal } from "../types";

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
    const response = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        systemInstruction: "You are a professional nutritionist and dietary coach. Provide helpful, accurate, and encouraging food suggestions based on calorie targets.",
      })
    });
    
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.text || "I couldn't generate suggestions at this time. Try again later!";
  } catch (error) {
    console.error("Gemini API proxy error:", error);
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
    const response = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        systemInstruction: "You are a meal planning expert. You provide short, actionable meal recommendations based on strict calorie budgets.",
      })
    });

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.text || "No suggestions available";
  } catch (error) {
    console.error("Gemini Suggestions proxy error:", error);
    return "Failed to fetch meal ideas.";
  }
}

export async function estimateMealCalories(mealName: string, portion: string): Promise<number> {
  try {
    const response = await fetch("/api/ai/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealName, portion })
    });
    
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.calories || 0;
  } catch (error) {
    console.error("Gemini Estimation proxy error:", error);
    return 0;
  }
}
