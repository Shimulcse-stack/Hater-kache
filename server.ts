import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for real-time assistant response
  app.post("/api/chat-assistant", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const isPlaceholderKey = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YOUR_API_KEY") || apiKey.trim() === "";

      if (isPlaceholderKey) {
        // Return a fallback simulated response if API Key is not set, to guarantee usability
        return res.json({ 
          text: "হাতে থাকা সহকারী (Hater Kache Assistant): আপনার API Key কনফিগার করা নেই। অনুগ্রহ করে Settings > Secrets প্যানেলে GEMINI_API_KEY প্রদান করুন।\n\n(Simulated response) আমি হাতের কাছে প্রোডাক্টিভিটি হাবের কৃত্রিম বুদ্ধিমত্তা। আপনি আপনার দৈনন্দিন কাজ, লক্ষ্য এবং সময়ের হিসাব এখানে রাখতে পারেন!" 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the primary artificial intelligence assistant embedded in "হাতের কাছে" (Hater Kache) All-in-One Personal Productivity Hub.
"হাতের কাছে" (meaning "at hand" or "within reach" in Bengali) is an elegant, premium, minimalist Bengali/English dashboard.
Answer the user's queries in a helpful, friendly, and concise manner (at most 3-4 sentences/paragraphs).
You should reply in Bengali if the query is in Bengali, or English if it's in English (or match their code-switching/Banglish).
Be very motivating and productivity-focused. Keep responses extremely neat and readable.`,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      // Extract error text from message, stringified form, or toString output
      let errorString = "";
      try {
        errorString = (error.message || "") + " " + String(error) + " " + JSON.stringify(error);
      } catch (e) {
        errorString = String(error) || "";
      }
      
      const errMsg = errorString.toLowerCase();
      const isHighDemand = errMsg.includes("503") || 
                           errMsg.includes("demand") || 
                           errMsg.includes("unavailable") || 
                           errMsg.includes("busy") || 
                           errMsg.includes("spike") ||
                           error.status === 503 ||
                           error.code === 503;
      
      if (isHighDemand) {
        console.log("Assistant endpoint handled high-demand fallback gracefully");
        return res.json({
          text: "হাতে থাকা সহকারী (Hater Kache Assistant): দুঃখিত, এই মুহূর্তে গুগল সার্ভারে অতিরিক্ত ট্রাফিকের (High Demand / 503) কারণে সরাসরি এআই সংযুক্ত হতে পারছে না। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন!\n\n💡 প্রোডাক্টিভিটি টিপস: আপনি আপনার ড্যাশবোর্ডে আজকের জন্য কিছু গুরুত্বপূর্ণ টাস্ক সাজিয়ে নিতে পারেন এবং কাজ শুরু করতে ২৫ মিনিটের পোমোডোরো সেশনটি চালু করতে পারেন!"
        });
      }

      console.log("Assistant endpoint handled general fallback gracefully: " + (error.message || "unknown"));
      // Fallback for general errors so the UI doesn't crash
      return res.json({
        text: "হাতে থাকা সহকারী (Hater Kache Assistant): দুঃখিত, একটি সাময়িক সংযোগ সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন!\n\n🎯 টিপস: স্ক্র্যাচপ্যাডে আপনার তাৎক্ষণিক নোটগুলো লিখে রাখুন, তা সুরক্ষিতভাবে ব্রাউজারে সংরক্ষিত থাকবে।"
      });
    }
  });

  // Serve static/vite assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
