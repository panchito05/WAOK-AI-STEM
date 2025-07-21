# MathMinds - Manual Test Guide

## 🧪 Test Scenarios

### 1. Practice Exercises Test
1. Open http://localhost:9002
2. In the "Practice Makes Perfect!" section:
   - Select Level: **Beginner**
   - Enter Topic: **addition**
   - Click **Generate Exercises**
3. Expected Result:
   - 5 exercises should appear below
   - Each exercise should show: Problem (e.g., "3 + 5 = ?")
   - Click on any exercise to expand
   - You should see the Solution and Explanation

### 2. Visual Solver Test  
1. In the "Snap & Solve!" section:
   - Click **Choose File** or drag an image
   - Select any image file
   - Click **Solve Problem**
2. Expected Result:
   - A mock solution should appear with:
     - Detected problem (e.g., "25 + 17 = ?")
     - Solution with step-by-step explanation

### 3. Progress Tracker Check
1. Look at the "Your Progress" section
2. You should see:
   - Problems Solved: 78
   - Day Streak: 5
   - Points Earned: 240
   - A weekly activity chart

## ✅ Success Criteria
- No errors displayed
- All sections load properly
- Exercises generate with proper format
- UI is responsive and colorful

## 📝 Notes
- The app uses mock data since no API key is configured
- With a real Gemini API key, it would generate unique exercises and analyze real images