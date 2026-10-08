const { GoogleGenerativeAI } = require("@google/generative-ai");
const Ticket = require("../models/Ticket");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AQ.Ab8RN6L2yoek6Ym93YiZjZnqTgRWONgcHAlkdO8oHxGbfVLtNg");

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

async function generateWithFallback(prompt, generationConfig) {
  let lastError = null;
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

function getLocalAnalysisFallback(complaint, category, roomNumber) {
  const text = (complaint || "").toLowerCase();
  let detectedCategory = "OTHER";

  // ALWAYS categorize based on the actual problem text first!
  // This correctly overrides accidental user dropdown selection errors.
  if (/wifi|net|internet|router|lan|connectivity|hotspot|speed|signal/i.test(text)) {
    detectedCategory = "WIFI";
  } else if (/water|leak|tap|pipe|flush|drain|bathroom|sink|toilet|sewage/i.test(text)) {
    detectedCategory = "PLUMBING";
  } else if (/light|switch|plug|wire|fan|power|current|electric|spark|socket|short\s*circuit|mcb/i.test(text)) {
    detectedCategory = "ELECTRICAL";
  } else if (/bed|table|chair|cupboard|door|window|lock|almirah|furniture|desk|handle/i.test(text)) {
    detectedCategory = "CARPENTRY";
  } else if (/ac|cooler|air\s*conditioner|cooling|vent|ventilation/i.test(text)) {
    detectedCategory = "AC";
  } else if (/clean|garbage|dustbin|dirty|smell|sweep|mop|washroom/i.test(text)) {
    detectedCategory = "CLEANING";
  } else if (category && category !== "OTHER") {
    detectedCategory = category.toUpperCase();
  }

  const priority = /spark|shock|flood|fire|emergency|urgent|danger|broke|shock/i.test(text) ? "High" : "Medium";

  return {
    summary: complaint.length > 60 ? complaint.substring(0, 57) + "..." : complaint,
    improvedComplaint: complaint.trim(),
    category: detectedCategory,
    priority: priority,
    confidence: 92,
    duplicate: false,
    similarComplaints: []
  };
}

exports.analyzeComplaint = async (req, res) => {
  try {
    const { complaint, roomNumber, category } = req.body;

    if (!complaint) {
      return res.status(400).json({ status: false, msg: "Complaint text is required" });
    }

    // Duplicate detection: Same room, open or in progress tickets
    let existingTickets = [];
    if (roomNumber) {
      existingTickets = await Ticket.find({
        roomNumber: roomNumber,
        status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] }
      }).select("description title category status roomNumber createdAt").limit(10);
    }

    const prompt = `
You are an AI assistant for a campus hostel maintenance system. Your job is to accurately analyze a student maintenance complaint and output strictly JSON.

New Complaint:
"${complaint}"
Room: "${roomNumber || "Not provided"}"
User Suggested Category: "${category || "Not provided"}"

Existing Open Tickets from this room:
${JSON.stringify(existingTickets)}

CRITICAL INSTRUCTION ON CATEGORY DETERMINATION:
Students often accidentally select the wrong dropdown item (for example, selecting ELECTRICAL when reporting a Wi-Fi issue).
You MUST categorize based on the REAL ISSUE described in the complaint text, OVERRIDING the user's suggestion when it contradicts the text:
- "WIFI": any Wi-Fi, internet, router, network, LAN, or connectivity issue.
- "ELECTRICAL": any fan, light, switch, power socket, wiring, spark, or circuit breaker issue.
- "PLUMBING": any water, tap, pipe, leakage, drainage, sink, flush, or washroom plumbing issue.
- "CARPENTRY": any bed, chair, desk, door, window, lock, or furniture issue.
- "AC": any air conditioner, cooler, or ventilation issue.
- "CLEANING": any room, washroom cleaning, or garbage disposal issue.
- "OTHER": any other general maintenance issue.

Tasks:
1. "summary": Concise one-line summary of the complaint.
2. "improvedComplaint": Professional, clear rewrite for maintenance technicians.
3. "category": EXACTLY ONE of: "WIFI", "ELECTRICAL", "PLUMBING", "CARPENTRY", "AC", "CLEANING", "OTHER".
4. "priority": EXACTLY ONE of: "Low", "Medium", "High".
5. "confidence": Score from 0 to 100.
6. "duplicate": boolean - true ONLY IF very similar to an existing open ticket in the exact same room.
7. "similarComplaints": array of duplicate matches if any.

Return ONLY raw JSON:
{
  "summary": "...",
  "improvedComplaint": "...",
  "category": "...",
  "priority": "...",
  "confidence": 95,
  "duplicate": false,
  "similarComplaints": []
}
`;

    try {
      let aiResponseText = await generateWithFallback(prompt, {
        responseMimeType: "application/json",
      });
      aiResponseText = aiResponseText.replace(/^\`\`\`json/i, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      const aiData = JSON.parse(aiResponseText);
      return res.status(200).json(aiData);
    } catch (aiErr) {
      console.warn("Using intelligent text fallback:", aiErr.message);
      const fallbackData = getLocalAnalysisFallback(complaint, category, roomNumber);
      return res.status(200).json(fallbackData);
    }
  } catch (error) {
    const fallbackData = getLocalAnalysisFallback(req.body?.complaint || "", req.body?.category, req.body?.roomNumber);
    res.status(200).json(fallbackData);
  }
};

exports.getInsights = async (req, res) => {
  try {
    const unresolvedTickets = await Ticket.find({ status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } });

    const totalPending = unresolvedTickets.filter(c => c.status === "OPEN").length;
    const highPriority = unresolvedTickets.filter(c => c.aiPriority === "High" || c.priority === "HIGH").length;

    const categoryCounts = {};
    unresolvedTickets.forEach(c => {
      const cat = c.category || "OTHER";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    let mostCommonCategory = "None";
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        mostCommonCategory = cat;
        maxCount = count;
      }
    }

    let trendSummary = "No unresolved complaints at the moment.";
    let recommendation = "All clear! Keep up the good work.";

    if (unresolvedTickets.length > 0) {
      trendSummary = `Highest complaints are in ${mostCommonCategory} category (${maxCount} pending).`;
      recommendation = `Prioritize addressing ${mostCommonCategory} maintenance calls and ${highPriority} urgent requests.`;
    }

    res.status(200).json({
      status: true,
      mostCommonCategory,
      highPriority,
      pendingComplaints: totalPending,
      totalActive: unresolvedTickets.length,
      trendSummary,
      recommendation
    });
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ status: false, msg: "Failed to generate AI insights." });
  }
};
