import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gen AI client with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// POST /api/chat - AI Assistant powered by Gemini 3.8 Flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, assessmentContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A user message is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check Settings > Secrets.',
        reply: "I am ready to help, but the server does not have a GEMINI_API_KEY set yet in Settings > Secrets. In the meantime, remember that under DC Law 22-559, short-term rentals must be your primary residence and licensed through DLCP. Please confirm details with DC's licensing department at dlcp.dc.gov."
      });
    }

    // Build context summary from current assessment answers
    let contextDescription = 'Homeowner has not yet filled out their DC assessment.';
    if (assessmentContext) {
      contextDescription = `
Homeowner's Current Assessment State:
- Primary Residence: ${assessmentContext.isMainResidence === 'yes' ? 'Yes (Primary Residence)' : assessmentContext.isMainResidence === 'no' ? 'No (Second or Inherited Property)' : 'Unselected'}
- Household: ${assessmentContext.householdComposition || 'Unselected'}
- Entrance: ${assessmentContext.hasPrivateEntrance || 'Not specified'}
- Shared Facilities: ${assessmentContext.sharesKitchenBath || 'Not specified'}
- Noise Sensitivity: ${assessmentContext.isNoiseAConcern || 'Not specified'}
- Travel Nights per Year: ${assessmentContext.travelNightsPerYear || 'Not specified'}
- Condo / HOA: ${assessmentContext.isCondoOrHoa || 'Unselected'} (HOA allows STR: ${assessmentContext.hoaAllowsStr || 'N/A'})
- Ownership: ${assessmentContext.ownershipType === 'personal' ? 'Individual / Personal' : assessmentContext.ownershipType === 'entity' ? 'LLC / Trust / Corporate' : 'Unselected'}
- Regulatory Filter: ${assessmentContext.lawMode === 'proposed_2026' ? 'Proposed 2026 Bill (Pending Council Approval)' : 'Current DC Law 22-559'}
- Neighborhood: ${assessmentContext.neighborhood || 'Not yet selected'}
- Space Offered: ${assessmentContext.spaceType || 'Not yet selected'}
- Hosting Mode: ${assessmentContext.hostingMode === 'away' ? 'Away / Vacation Rental (Unhosted)' : 'Hosted Stays (Host on-site)'}
- Nightly Rate: $${assessmentContext.nightlyRate || 0}
- Projected Occupancy: ${assessmentContext.occupancyPercent || 60}%
- Projected Net Income: $${assessmentContext.netIncome ? assessmentContext.netIncome.toLocaleString() : 'N/A'}/year
- Mortgage Coverage: ${assessmentContext.mortgageCoveragePercent || 0}%
- Hosting Effort: ${assessmentContext.hoursPerWeek || 5} hrs/week
- Effective Hourly Return: $${assessmentContext.hourlyRate || 0}/hour
- Risk Rating: ${assessmentContext.overallRisk || 'N/A'}
- Current Recommendation / Verdict: ${assessmentContext.verdict || 'In progress'}
`;
    }

    const systemInstruction = `You help DC homeowners think through listing on Airbnb. Use the DC rules in this app. Be short and friendly. Do not give legal or tax advice. End each answer by suggesting the user confirm details with DC's licensing department at dlcp.dc.gov.

DC Short-Term Rental Rules Summary:
1. Primary Residence Requirement: Under DC Law 22-559, you can only short-term rent your primary residence (where you reside for at least 183 days/year). Second homes, investment properties, and inherited properties are strictly prohibited under current law.
2. Ownership: Licenses are issued only to individual natural persons, never LLCs, corporations, or trusts.
3. License & Cost: 2-year DC Basic Business License (BBL) with Short-Term Rental endorsement costs $99 through DLCP at boss.dc.gov.
4. Hosted vs. Unhosted (Away):
   - Hosted stays (you are in the home during the stay): NO annual night limit.
   - Vacation rental (you are away and guests have the entire space): Strictly capped at 90 nights per calendar year.
5. Condo / HOA: Must have written approval from the condo board or HOA president.
6. Proposed 2026 Bill: A pending proposal would allow DC residents to license ONE secondary property, but it is NOT yet enacted law.
7. Enforcement: DLCP civil infraction fines start at $1,000 for 1st offense, $2,000 for 2nd, up to $5,000+.
8. Mandatory Safety Hardware: Working smoke alarms in each bedroom, carbon monoxide alarms on every floor with bedrooms, and a working 2A:10B:C fire extinguisher.

${contextDescription}

Formatting guidelines:
- Keep responses concise (typically 2 to 4 punchy paragraphs or short bullet points).
- Tailor your answer directly to the homeowner's specific neighborhood, space type, and family setup if available in the context above.
- Always conclude with a brief sentence reminding them to confirm details with DC's licensing department at dlcp.dc.gov.`;

    // Format multi-turn conversation for generateContent
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.content && typeof turn.content === 'string') {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }]
          });
        }
      }
    }

    // Append the current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

    let replyText = (response.text || '').trim();
    if (!replyText) {
      replyText = "In Washington, DC, short-term rentals are governed by DC Law 22-559 and require a $99 2-year license from the DLCP. Please confirm details with DC's licensing department at dlcp.dc.gov.";
    }

    // Ensure it ends by suggesting the user confirm details with dlcp.dc.gov
    if (!replyText.toLowerCase().includes('dlcp.dc.gov')) {
      replyText += "\n\nPlease confirm details with DC's licensing department at dlcp.dc.gov.";
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error generating Gemini chat response:', error);
    return res.status(500).json({
      error: error?.message || 'Error communicating with Gemini AI.',
      reply: "I encountered an error connecting to the AI service. In Washington, DC, short-term rentals are governed by DC Law 22-559 and require a $99 2-year license from the DLCP. Please confirm details with DC's licensing department at dlcp.dc.gov."
    });
  }
});

// Setup Vite middleware for development or serve built files in production
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Host or Hold DC] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
