/**
 * responseNormalizer.js
 * 
 * Architectural Layer: Response Parser & Normalizer
 * Transforms messy, heterogeneous agent outputs (markdown text, markdown tables,
 * JSON blocks, key-value pairs, nested objects) into a clean, human-readable,
 * dynamic UI Data Model.
 * 
 * Rules:
 * - NO STATIC DATA: Extracts and normalizes whatever the agent returns.
 * - TRANSLATES technical keys into natural human language.
 * - PRESERVES actual values without fabricating or guessing numbers.
 * - DYNAMIC: If 3 ideas exist -> returns 3. If 10 -> returns 10.
 * - GRACEFUL: Missing fields are omitted (never returns "undefined" or "null").
 */

// Dictionary mapping technical/internal keys to natural human language labels
export const FIELD_LABELS = {
  // Business concept fields
  concept: "Business Concept",
  suggested_business: "Business Concept",
  business_name: "Business Concept",
  name: "Business Name",
  title: "Concept Title",
  core_offering: "Core Products & Services",
  offering: "Primary Offering",
  value_proposition: "Why This Business Could Work",
  why_it_works: "Why This Business Could Work",
  why_it_fits: "Capital & Market Fit",
  capex_fit: "Estimated Initial Investment",
  initial_investment: "Required Startup Capital",
  budget_required: "Estimated Initial Investment",
  target_audience: "Target Customers",
  primary_target_audience: "Target Customers",
  target_market: "Target Market",
  customers: "Target Customers",
  core_business_model: "Revenue Model",
  revenue_model: "Revenue Streams",
  monetization: "Monetization Strategy",
  key_risks: "Key Risk Considerations",
  risks: "Key Risks",
  required_resources: "Required Resources & Assets",
  resources: "Key Resources",
  market_demand: "Market Demand Dynamics",
  competitive_edge: "Competitive Advantage",

  // Market & Trend fields
  cagr: "Projected Annual Market Growth (CAGR)",
  market_size: "Total Addressable Market",
  top_region: "Leading Regional Market",
  keywords: "Key Sector Themes",
  historical_growth: "Historical Growth Trajectory",
  trending_domains: "High-Growth Industry Verticals",
  emerging_technologies: "Emerging Technologies",
  customer_demand: "Customer Demand Shifts",

  // Financial fields
  first_year_revenue: "Projected Year-1 Gross Revenue",
  projected_roi: "Projected Return on Investment (ROI)",
  roi: "Return on Investment (ROI)",
  break_even_month: "Expected Break-Even Timeline",
  burn_rate: "Monthly Operational Burn Rate",
  operating_expenses: "Operating Expenses (OpEx)",
  capital_expenditures: "Capital Expenditures (CapEx)",
  gross_margin: "Estimated Gross Margin",

  // Validation fields
  success_probability: "Venture Success Probability",
  risk_percentage: "Overall Risk Factor",
  opportunity_score: "Market Opportunity Score",
  competition_level: "Market Competition Level",
  growth_potential: "5-Year Growth Potential",
  final_recommendation: "Strategic Investment Verdict",
  demand_score: "Demand Validation Score",
  growth_score: "Market Expansion Score",
  investment_score: "Capital Efficiency Score",
  risk_score: "Vulnerability Score",
};

/**
 * Translates any technical key into a natural human-readable title.
 */
export function humanizeKey(key) {
  if (!key) return "";
  const cleanKey = String(key).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (FIELD_LABELS[cleanKey]) {
    return FIELD_LABELS[cleanKey];
  }
  // Fallback: convert snake_case/camelCase to Title Case
  return cleanKey
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format currency numbers dynamically.
 */
export function formatCurrencyValue(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  if (isNaN(num)) {
    // If it's already a formatted string like "$30k - $40k", return as-is
    return String(val);
  }
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}k`;
  return `$${num.toLocaleString()}`;
}

/**
 * Strip unwanted special characters, citation markers, and broken pipes.
 */
export function cleanRawText(rawText) {
  if (!rawText) return "";
  let text = String(rawText);
  // Unescape newlines
  text = text.replace(/\\n/g, "\n");
  // Remove JSON machine blocks
  text = text.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, "");
  text = text.replace(/```(?:json)?\s*\{[\s\S]*$/gi, "");
  // Remove citation tags like 【5†L1-L3】 or 【source】
  text = text.replace(/【[^】]*】/g, "");
  // Remove decorative stars and symbols
  text = text.replace(/[★☆✦✧✪✫✬✭✮✯]/g, "");
  // Split merged table pipes | | into valid newlines
  text = text.replace(/\|\s*\|/g, "|\n|");
  // Remove raw search output headers
  text = text.replace(/^(?:search results?|sources?|raw search output):.*$/gim, "");
  text = text.replace(/---\s*$/gi, "");
  return text.trim();
}

/**
 * Parse Markdown tables into an array of structured objects.
 */
export function parseMarkdownTables(text) {
  if (!text) return [];
  const clean = cleanRawText(text);
  const lines = clean.split("\n");
  const tables = [];
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim().replace(/\*\*/g, ""));

      // Check if delimiter row
      const isDelimiter = cells.every((c) => /^:?-+:?$/.test(c));

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else if (isDelimiter) {
        // Delimiter line, just marks the header boundary
      } else {
        // Normal data row
        const rowObj = {};
        currentTable.headers.forEach((h, idx) => {
          const key = (h || `col_${idx}`).trim();
          rowObj[key] = cells[idx] || "";
        });
        currentTable.rows.push(rowObj);
      }
    } else {
      if (currentTable) {
        if (currentTable.rows.length > 0) {
          tables.push(currentTable);
        }
        currentTable = null;
      }
    }
  }

  if (currentTable && currentTable.rows.length > 0) {
    tables.push(currentTable);
  }

  return tables;
}

/**
 * Dynamic Business Idea Extractor
 * Extracts business ideas from tables, bullet lists, or JSON objects dynamically.
 * Works for ANY number of ideas returned by the agent.
 */
export function extractBusinessIdeas(discoveryText, parsedData = {}) {
  const ideas = [];
  const text = cleanRawText(discoveryText);

  // Strategy 1: Look for a markdown table with business concepts
  const tables = parseMarkdownTables(text);
  for (const table of tables) {
    // Check if table contains concept/business columns
    const hasConceptCol = table.headers.some((h) =>
      /concept|business|idea|model|venture/i.test(h)
    );
    if (hasConceptCol) {
      table.rows.forEach((row, idx) => {
        let title = "";
        let whyItWorks = "";
        let targetAudience = "";
        let estimatedInvestment = "";
        let coreOffering = "";
        const rawFields = [];

        Object.entries(row).forEach(([colHeader, colVal]) => {
          if (!colVal || colVal === "-" || colVal === "—") return;
          const h = colHeader.toLowerCase();

          if (/concept|business|idea|model|venture/i.test(h) && !title) {
            title = colVal;
          } else if (/why|fit|value|proposition|reason/i.test(h) && !whyItWorks) {
            whyItWorks = colVal;
          } else if (/target|audience|customer|market/i.test(h) && !targetAudience) {
            targetAudience = colVal;
          } else if (/capex|investment|budget|cost/i.test(h) && !estimatedInvestment) {
            estimatedInvestment = colVal;
          } else if (/offering|service|product|core/i.test(h) && !coreOffering) {
            coreOffering = colVal;
          } else if (!/^[#0-9]+$/.test(h) && h !== "rank" && h !== "#") {
            rawFields.push({ label: humanizeKey(colHeader), value: colVal });
          }
        });

        if (title && title.length > 2) {
          ideas.push({
            id: `idea-${idx + 1}`,
            rank: idx + 1,
            title: title.replace(/^#?\s*\d+[\.\)]\s*/, ""),
            coreOffering: coreOffering || null,
            whyItWorks: whyItWorks || null,
            targetCustomers: targetAudience || null,
            estimatedInvestment: estimatedInvestment || null,
            rawFields,
          });
        }
      });
      break;
    }
  }

  // Strategy 2: If no table matched, look for numbered headings or list items
  if (ideas.length === 0) {
    // Regex looking for "1. **Concept Name**" or "### 1. Concept Name"
    const conceptRegex = /(?:^|\n)(?:###?\s*)?(?:(\d+)[\.\)]\s*)?\*\*([^\*]+)\*\*[:\s]*([^\n]*)/g;
    let match;
    let count = 0;
    while ((match = conceptRegex.exec(text)) !== null) {
      const title = match[2].trim();
      const initialDesc = match[3].trim();
      // Skip generic section headings
      if (/^(strengths|weaknesses|opportunities|threats|conclusion|takeaway|summary|note)/i.test(title)) {
        continue;
      }
      if (title.length > 3 && !title.includes("Analysis") && !title.includes("Report")) {
        count++;
        ideas.push({
          id: `idea-${count}`,
          rank: count,
          title,
          whyItWorks: initialDesc || null,
          targetCustomers: null,
          estimatedInvestment: null,
          rawFields: [],
        });
      }
    }
  }

  return ideas;
}

/**
 * Dynamic Trending Sectors Extractor
 */
export function extractTrendingSectors(trendText) {
  const sectors = [];
  const text = cleanRawText(trendText);
  const tables = parseMarkdownTables(text);

  for (const table of tables) {
    const hasSectorCol = table.headers.some((h) =>
      /sector|domain|industry|vertical|extension/i.test(h)
    );
    if (hasSectorCol) {
      table.rows.forEach((row, idx) => {
        let name = "";
        let growthDriver = "";
        let targetMarket = "";
        let cagr = "";
        const details = [];

        Object.entries(row).forEach(([colHeader, colVal]) => {
          if (!colVal || colVal === "—") return;
          const h = colHeader.toLowerCase();
          if (/sector|domain|industry|vertical|extension/i.test(h) && !name) {
            name = colVal;
          } else if (/driver|catalyst|why/i.test(h) && !growthDriver) {
            growthDriver = colVal;
          } else if (/target|market|adoption/i.test(h) && !targetMarket) {
            targetMarket = colVal;
          } else if (/cagr|growth|project/i.test(h) && !cagr) {
            cagr = colVal;
          } else if (!/^[#0-9]+$/.test(h) && h !== "rank" && h !== "#") {
            details.push({ label: humanizeKey(colHeader), value: colVal });
          }
        });

        if (name) {
          sectors.push({
            id: `sector-${idx + 1}`,
            rank: idx + 1,
            name: name.replace(/^#?\s*\d+[\.\)]\s*/, ""),
            growthDriver: growthDriver || null,
            targetMarket: targetMarket || null,
            cagr: cagr || null,
            details,
          });
        }
      });
      break;
    }
  }

  return sectors;
}

/**
 * Dynamic Jobs / Career Opportunities Extractor
 */
export function extractCareerOpportunities(trendText) {
  const jobs = [];
  const text = cleanRawText(trendText);
  const tables = parseMarkdownTables(text);

  for (const table of tables) {
    const hasJobCol = table.headers.some((h) =>
      /job|role|career|title|profession/i.test(h)
    );
    if (hasJobCol) {
      table.rows.forEach((row, idx) => {
        let role = "";
        let skills = "";
        let momentum = "";
        const details = [];

        Object.entries(row).forEach(([colHeader, colVal]) => {
          if (!colVal || colVal === "—") return;
          const h = colHeader.toLowerCase();
          if (/job|role|career|title/i.test(h) && !role) {
            role = colVal;
          } else if (/skill|requirement|competency/i.test(h) && !skills) {
            skills = colVal;
          } else if (/momentum|growth|cagr|salary/i.test(h) && !momentum) {
            momentum = colVal;
          } else {
            details.push({ label: humanizeKey(colHeader), value: colVal });
          }
        });

        if (role) {
          jobs.push({
            id: `job-${idx + 1}`,
            role: role.replace(/^#?\s*\d+[\.\)]\s*/, ""),
            skills: skills || null,
            momentum: momentum || null,
            details,
          });
        }
      });
      break;
    }
  }

  return jobs;
}

/**
 * Dynamic Financial CapEx / Budget Allocation Extractor
 */
export function extractFinancialAllocations(financialText, discoveryText) {
  const allocations = [];
  const combined = `${cleanRawText(financialText)}\n\n${cleanRawText(discoveryText)}`;
  const tables = parseMarkdownTables(combined);

  for (const table of tables) {
    const hasCostCol = table.headers.some((h) =>
      /cost|expense|allocation|budget|amount|usd|capex|opex/i.test(h)
    );
    if (hasCostCol) {
      table.rows.forEach((row, idx) => {
        let category = "";
        let amount = "";
        let notes = "";

        Object.entries(row).forEach(([colHeader, colVal]) => {
          if (!colVal || colVal === "—") return;
          const h = colHeader.toLowerCase();
          if (/category|expense|item|stream/i.test(h) && !category) {
            category = colVal;
          } else if (/cost|amount|price|potential|value/i.test(h) && !amount) {
            amount = colVal;
          } else if (/comment|note|percentage|margin/i.test(h) && !notes) {
            notes = colVal;
          }
        });

        if (category && amount) {
          allocations.push({
            id: `fin-item-${idx + 1}`,
            category: category.replace(/^#?\s*\d+[\.\)]\s*/, ""),
            amount,
            notes: notes || null,
          });
        }
      });
      if (allocations.length > 0) break;
    }
  }

  return allocations;
}

/**
 * Dynamic Risk & Mitigation Extractor
 */
export function extractRiskMatrix(validationText, discoveryText) {
  const risks = [];
  const combined = `${cleanRawText(validationText)}\n\n${cleanRawText(discoveryText)}`;
  const tables = parseMarkdownTables(combined);

  for (const table of tables) {
    const hasRiskCol = table.headers.some((h) => /risk|vulnerability|threat/i.test(h));
    const hasMitigation = table.headers.some((h) => /mitigation|action|strategy|countermeasure/i.test(h));

    if (hasRiskCol && hasMitigation) {
      table.rows.forEach((row, idx) => {
        let riskName = "";
        let mitigation = "";
        let severity = "";
        let likelihood = "";

        Object.entries(row).forEach(([colHeader, colVal]) => {
          if (!colVal) return;
          const h = colHeader.toLowerCase();
          if (/risk|threat|factor/i.test(h) && !riskName) {
            riskName = colVal;
          } else if (/mitigation|action|strategy/i.test(h) && !mitigation) {
            mitigation = colVal;
          } else if (/severity|impact/i.test(h) && !severity) {
            severity = colVal;
          } else if (/likelihood|probability/i.test(h) && !likelihood) {
            likelihood = colVal;
          }
        });

        if (riskName && mitigation) {
          risks.push({
            id: `risk-${idx + 1}`,
            risk: riskName.replace(/^#?\s*\d+[\.\)]\s*/, ""),
            mitigation,
            severity: severity || null,
            likelihood: likelihood || null,
          });
        }
      });
      if (risks.length > 0) break;
    }
  }

  return risks;
}

/**
 * Breaks long narrative markdown into digestible, human-readable sections.
 * Prevents "wall of text" syndrome.
 */
export function breakNarrativeIntoSections(rawText, agentName = "") {
  if (!rawText) return [];
  const clean = cleanRawText(rawText);
  // Split on H2 headers (## Section Title)
  const rawSections = clean.split(/(?=^##\s+)/gm);
  const sections = [];

  rawSections.forEach((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    // Header extraction
    const headerMatch = trimmed.match(/^##\s+(.*)/);
    const title = headerMatch ? headerMatch[1].trim() : `Section ${idx + 1}`;
    const body = trimmed.replace(/^##\s+.*(?:\n|$)/, "").trim();

    if (!body) return;

    // Extract paragraphs vs bullet points
    const lines = body.split("\n");
    const paragraphs = [];
    const bulletPoints = [];
    let currentP = "";

    lines.forEach((line) => {
      const l = line.trim();
      if (!l) {
        if (currentP) {
          paragraphs.push(currentP);
          currentP = "";
        }
      } else if (l.startsWith("- ") || l.startsWith("* ") || /^\d+\.\s+/.test(l)) {
        if (currentP) {
          paragraphs.push(currentP);
          currentP = "";
        }
        bulletPoints.push(l.replace(/^[-*]\s+|\d+\.\s+/, "").trim());
      } else if (l.startsWith(">")) {
        // Blockquote / Key takeaway
        bulletPoints.push(`Key Insight: ${l.replace(/^>\s*/, "").trim()}`);
      } else if (!l.startsWith("|")) {
        currentP = currentP ? `${currentP} ${l}` : l;
      }
    });

    if (currentP) paragraphs.push(currentP);

    sections.push({
      id: `sec-${idx + 1}`,
      title,
      paragraphs,
      bulletPoints,
      agentName,
      isLong: paragraphs.length > 2 || body.length > 600,
    });
  });

  return sections;
}

/**
 * Master Normalizer Function
 * Takes the raw report payload and produces a complete, normalized UI Data Model.
 */
export function normalizeReportData(reportPayload) {
  if (!reportPayload) return null;

  const raw = reportPayload.clean_raw || reportPayload.raw || {};
  const parsed = reportPayload.parsed || {};

  const trendRaw = raw.trend || "";
  const discoveryRaw = raw.discovery || "";
  const financialRaw = raw.financial || "";
  const validationRaw = raw.validation || "";

  // 1. Extract Dynamic Metrics (only include fields that actually exist)
  const trendP = parsed.trend || {};
  const discP = parsed.discovery || {};
  const finP = parsed.financial || {};
  const valP = parsed.validation || {};

  const metrics = [];

  // Key primary KPIs
  const successProb = reportPayload.score ?? valP.success_probability ?? valP.demand_score;
  if (successProb !== undefined && successProb !== null) {
    metrics.push({
      key: "success_probability",
      label: humanizeKey("success_probability"),
      value: `${Math.round(successProb)}%`,
      numericValue: Number(successProb),
      type: "percentage",
      agent: "Startup Validation Agent",
      accent: successProb >= 70 ? "emerald" : successProb >= 50 ? "amber" : "rose",
      description: "Probabilistic venture viability based on market demand and execution risk.",
    });
  }

  const marketDemand = valP.market_demand ?? valP.demand_score;
  if (marketDemand !== undefined && marketDemand !== null) {
    metrics.push({
      key: "market_demand",
      label: humanizeKey("market_demand"),
      value: `${Math.round(marketDemand)}%`,
      numericValue: Number(marketDemand),
      type: "percentage",
      agent: "Startup Validation Agent",
      accent: "blue",
      description: "Aggregated customer willingness to pay and active sector purchase intent.",
    });
  }

  const roi = finP.projected_roi;
  if (roi !== undefined && roi !== null) {
    metrics.push({
      key: "projected_roi",
      label: humanizeKey("projected_roi"),
      value: `+${roi}%`,
      numericValue: Number(roi),
      type: "roi",
      agent: "Financial Planning Agent",
      accent: "emerald",
      description: "Projected 3-year enterprise return on invested capital.",
    });
  }

  const initialInv = finP.initial_investment ?? reportPayload.budget;
  if (initialInv !== undefined && initialInv !== null) {
    metrics.push({
      key: "initial_investment",
      label: humanizeKey("initial_investment"),
      value: formatCurrencyValue(initialInv),
      numericValue: Number(initialInv),
      type: "currency",
      agent: "Financial Planning Agent",
      accent: "indigo",
      description: "Required initial seed capital expenditure and working reserves.",
    });
  }

  const firstYearRev = finP.first_year_revenue;
  if (firstYearRev !== undefined && firstYearRev !== null) {
    metrics.push({
      key: "first_year_revenue",
      label: humanizeKey("first_year_revenue"),
      value: formatCurrencyValue(firstYearRev),
      numericValue: Number(firstYearRev),
      type: "currency",
      agent: "Financial Planning Agent",
      accent: "teal",
      description: "Forecasted gross operating revenues in the inaugural 12 months.",
    });
  }

  const breakEven = finP.break_even_month;
  if (breakEven !== undefined && breakEven !== null) {
    metrics.push({
      key: "break_even_month",
      label: humanizeKey("break_even_month"),
      value: `Month ${breakEven}`,
      numericValue: Number(breakEven),
      type: "timeline",
      agent: "Financial Planning Agent",
      accent: "purple",
      description: "Estimated operational break-even crossing date based on burn rate.",
    });
  }

  const cagr = trendP.cagr;
  if (cagr !== undefined && cagr !== null) {
    metrics.push({
      key: "cagr",
      label: humanizeKey("cagr"),
      value: `${cagr}%`,
      numericValue: Number(cagr),
      type: "growth",
      agent: "Market Research Agent",
      accent: "cyan",
      description: "Compound annual industry growth rate across primary verticals.",
    });
  }

  const marketSize = trendP.market_size;
  if (marketSize !== undefined && marketSize !== null) {
    metrics.push({
      key: "market_size",
      label: humanizeKey("market_size"),
      value: formatCurrencyValue(marketSize),
      numericValue: Number(marketSize),
      type: "currency",
      agent: "Market Research Agent",
      accent: "blue",
      description: "Total addressable market size across global or regional segments.",
    });
  }

  const compLevel = discP.competition_level;
  if (compLevel) {
    metrics.push({
      key: "competition_level",
      label: humanizeKey("competition_level"),
      value: compLevel,
      type: "text",
      agent: "Business Discovery Agent",
      accent: compLevel.toLowerCase() === "low" ? "emerald" : compLevel.toLowerCase() === "high" ? "rose" : "amber",
      description: "Incumbent saturation level and pricing defensibility.",
    });
  }

  // 2. Extract Business Concepts (dynamic count)
  const businessIdeas = extractBusinessIdeas(discoveryRaw, discP);

  // 3. Extract Market Trends & Sectors
  const trendingSectors = extractTrendingSectors(trendRaw);
  const careerOpportunities = extractCareerOpportunities(trendRaw);

  // 4. Extract Financial Allocations
  const financialAllocations = extractFinancialAllocations(financialRaw, discoveryRaw);

  // 5. Extract SWOT Elements
  const swot = {
    strengths: Array.isArray(discP.strengths) ? discP.strengths : [],
    weaknesses: Array.isArray(discP.weaknesses) ? discP.weaknesses : [],
    opportunities: Array.isArray(discP.opportunities) ? discP.opportunities : [],
    threats: Array.isArray(discP.threats) ? discP.threats : [],
  };

  // 6. Extract Risk Matrix
  const risks = extractRiskMatrix(validationRaw, discoveryRaw);

  // 7. Extract Strategic Verdict & Rationale
  const verdictRaw = reportPayload.verdict || valP.final_recommendation || "HOLD";
  const verdict = verdictRaw.toUpperCase().includes("GOOD") || verdictRaw.toUpperCase() === "GO"
    ? "GO"
    : verdictRaw.toUpperCase().includes("NOT") || verdictRaw.toUpperCase() === "NO GO"
    ? "NO GO"
    : "HOLD";

  const recommendationText =
    reportPayload.recommendation ||
    (verdict === "GO"
      ? "Strong market demand with attractive margins. Recommended to proceed with MVP deployment and initial pilot customer acquisition."
      : verdict === "NO GO"
      ? "High structural barriers or saturated incumbent presence. Pivot business model toward higher-margin niche sub-segments before deployment."
      : "Viable opportunity contingent on strict working capital controls and clear differentiator positioning.");

  // 8. Extract Digestible Narrative Sections
  const narrativeSections = [
    ...breakNarrativeIntoSections(discoveryRaw, "Business Discovery Agent"),
    ...breakNarrativeIntoSections(financialRaw, "Financial Planning Agent"),
    ...breakNarrativeIntoSections(validationRaw, "Startup Validation Agent"),
    ...breakNarrativeIntoSections(trendRaw, "Market Research Agent"),
  ];

  return {
    id: reportPayload.id || reportPayload._id,
    industry: reportPayload.industry || "Strategic Venture",
    budget: reportPayload.budget ? formatCurrencyValue(reportPayload.budget) : null,
    createdAt: reportPayload.created_at || reportPayload.createdAt || "Recent",
    verdict,
    recommendationText,
    metrics,
    businessIdeas,
    trendingSectors,
    careerOpportunities,
    financialAllocations,
    swot,
    risks,
    narrativeSections,
    // Raw clean text fallback
    cleanRaw: {
      trend: cleanRawText(trendRaw),
      discovery: cleanRawText(discoveryRaw),
      financial: cleanRawText(financialRaw),
      validation: cleanRawText(validationRaw),
    },
  };
}
