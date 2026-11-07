import Joi from "joi";

/* ────────────────────────────
 *  Enumerations  (from Wiza docs)
 * ──────────────────────────── */
const enrichmentLevelEnum = ["none", "partial", "full"] as const;

const jobTitleLevelEnum = [
  "CXO",
  "Director",
  "Entry",
  "Manager",
  "Owner",
  "Partner",
  "Senior",
  "Training",
  "Unpaid",
  "VP",
] as const;

const jobRoleEnum = [
  "customer_service",
  "design",
  "education",
  "engineering",
  "finance",
  "health",
  "human_resources",
  "legal",
  "marketing",
  "media",
  "operations",
  "public_relations",
  "real_estate",
  "sales",
  "trades",
] as const;

const jobSubRoleEnum = [
  "accounting",
  "accounts",
  "brand_marketing",
  "broadcasting",
  "business_development",
  "compensation",
  "content_marketing",
  "customer_success",
  "data",
  "dental",
  "devops",
  "doctor",
  "editorial",
  "education_administration",
  "electrical",
  "employee_development",
  "events",
  "fitness",
  "graphic_design",
  "information_technology",
  "instructor",
  "investment",
  "journalism",
  "judicial",
  "lawyer",
  "logistics",
  "marketing_communications",
  "mechanical",
  "media_relations",
  "network",
  "nursing",
  "office_management",
  "paralegal",
  "pipeline",
  "product",
  "product_design",
  "product_marketing",
  "professor",
  "project_engineering",
  "project_management",
  "property_management",
  "quality_assurance",
  "realtor",
  "recruiting",
  "researcher",
  "security",
  "software",
  "support",
  "systems",
  "tax",
  "teacher",
  "therapy",
  "video",
  "web",
  "web_design",
  "wellness",
  "writing",
] as const;

const companySizeEnum = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
] as const;

const companyAnnualGrowthEnum = [
  "0-5%",
  "5-10%",
  "10-20%",
  "20-50%",
  "50-100%",
  "100%+",
] as const;

const revenueEnum = [
  "$0-$1M",
  "$1M-$10M",
  "$10M-$25M",
  "$25M-$50M",
  "$50M-$100M",
  "$100M-$250M",
  "$250M-$500M",
  "$500M-$1B",
  "$1B-$10B",
  "$10B+",
] as const;

const fundingAmountEnum = [
  "$500K",
  "$1M",
  "$5M",
  "$10M",
  "$25M",
  "$50M",
  "$100M",
  "$250M",
  "$500M",
  "$1B",
] as const;

const companyTypeEnum = [
  "private",
  "public",
  "educational",
  "government",
  "nonprofit",
  "public_subsidiary",
] as const;

/* ────────────────────────────
 *  Re-usable fragments
 * ──────────────────────────── */
const flag = Joi.string()
  .valid("i", "e")
  .messages({ "any.only": `"s" must be "i" (include) or "e" (exclude)` });

const strArray = Joi.array().items(
  Joi.string().messages({ "string.base": `"value" must be a string` })
);

const valueObj = Joi.object({
  v: Joi.string().required().messages({
    "any.required": `"v" is required`,
    "string.base": `"v" must be a string`,
  }),
  s: flag.optional(),
});

const locationObj = Joi.object({
  v: Joi.string().required().messages({ "any.required": `"v" is required` }),
  b: Joi.string()
    .valid("city", "state", "country", "continent")
    .required()
    .messages({ "any.only": `"b" must be city, state, country, or continent` }),
  s: flag.optional(),
});

/* ────────────────────────────
 *  Main schema
 * ──────────────────────────── */
export const createPropectListSchema = Joi.object({
  /* ---------- list ---------- */
  list: Joi.object({
    name: Joi.string().trim().min(1).required().messages({
      "any.required": `"list.name" is required`,
      "string.empty": `"list.name" cannot be empty`,
    }),

    max_profiles: Joi.number().integer().min(1).required().messages({
      "number.base": `"list.max_profiles" must be a number`,
      "number.integer": `"list.max_profiles" must be an integer`,
      "number.min": `"list.max_profiles" must be at least {#limit}`,
      "any.required": `"list.max_profiles" is required`,
    }),

    enrichment_level: Joi.string()
      .valid(...enrichmentLevelEnum)
      .required()
      .messages({
        "any.only": `"list.enrichment_level" must be one of ${enrichmentLevelEnum.join(
          ", "
        )}`,
        "any.required": `"list.enrichment_level" is required`,
      }),

    email_options: Joi.object({
      accept_work: Joi.boolean().required(),
      accept_personal: Joi.boolean().required(),
      accept_generic: Joi.boolean().required(),
    })
      .required()
      .messages({
        "any.required": `"list.email_options" is required`,
        "object.base": `"list.email_options" must be an object`,
      }),
    callback_url: Joi.string().optional().uri(),
  })
    .required()
    .messages({
      "any.required": `"list" object is required`,
      "object.base": `"list" must be an object`,
    }),

  /* -- extra list-level options -- */
  skip_duplicates: Joi.boolean().messages({
    "boolean.base": `"skip_duplicates" must be true or false`,
  }),

  callback_url: Joi.string()
    .uri()
    .messages({ "string.uri": `"callback_url" must be a valid URL` }),

  /* --------- filters -------- */
  filters: Joi.object({
    first_name: strArray,
    last_name: strArray,

    job_title: Joi.array().items(valueObj),
    job_title_level: Joi.array()
      .items(Joi.string().valid(...jobTitleLevelEnum))
      .messages({ "any.only": `"job_title_level" has an invalid value` }),

    job_role: Joi.array()
      .items(Joi.string().valid(...jobRoleEnum))
      .messages({ "any.only": `"job_role" has an invalid value` }),

    job_sub_role: Joi.array()
      .items(Joi.string().valid(...jobSubRoleEnum))
      .messages({ "any.only": `"job_sub_role" has an invalid value` }),

    /* ←────────── updated rule ──────────→ */
    location: Joi.alternatives().try(
      locationObj, // single object (matches API example)
      Joi.array().items(locationObj) // or array (keeps original spec)
    ),

    skill: strArray,
    school: strArray,
    major: strArray,

    linkedin_slug: strArray,

    job_company: Joi.array().items(valueObj),
    past_company: Joi.array().items(valueObj),

    company_location: Joi.array().items(locationObj),

    company_industry: strArray, // enum list is huge; allow strings

    company_size: Joi.array()
      .items(Joi.string().valid(...companySizeEnum))
      .messages({ "any.only": `"company_size" has an invalid value` }),

    company_annual_growth: Joi.string()
      .valid(...companyAnnualGrowthEnum)
      .messages({
        "any.only": `"company_annual_growth" must be one of ${companyAnnualGrowthEnum.join(
          ", "
        )}`,
      }),

    department_size: Joi.array().items(
      Joi.string()
        .pattern(/^[a-z_]+:(\d*-)?(\d+)?$/)
        .messages({
          "string.pattern.base": `"department_size" must look like "sales:10-50", "sales:10-" or "sales:-50"`,
        })
    ),

    revenue: Joi.array()
      .items(Joi.string().valid(...revenueEnum))
      .messages({ "any.only": `"revenue" has an invalid value` }),

    /* ----- funding fields ----- */
    funding_date: Joi.object().unknown(true), // docs don't give exact shape
    last_funding_min: Joi.string().valid(...fundingAmountEnum),
    last_funding_max: Joi.string().valid(...fundingAmountEnum),
    funding_min: Joi.string().valid(...fundingAmountEnum),
    funding_max: Joi.string().valid(...fundingAmountEnum),

    funding_stage: Joi.object().unknown(true),
    funding_type: Joi.object().unknown(true),

    company_type: Joi.array()
      .items(Joi.string().valid(...companyTypeEnum))
      .messages({ "any.only": `"company_type" has an invalid value` }),

    company_summary: Joi.array().items(valueObj),

    year_founded_start: Joi.string()
      .pattern(/^\d{4}$/)
      .messages({
        "string.pattern.base": `"year_founded_start" must be a 4-digit year`,
      }),
    year_founded_end: Joi.string()
      .pattern(/^\d{4}$/)
      .messages({
        "string.pattern.base": `"year_founded_end" must be a 4-digit year`,
      }),
  })
    .required()
    .unknown(false)
    .messages({
      "any.required": `"filters" object is required`,
      "object.base": `"filters" must be an object`,
    }),
})
  .required()
  .messages({
    "any.required": "Request body is required",
    "object.base": "Request body must be a valid JSON object",
  });

export const callbackSchema = Joi.object({
  json_data: Joi.object().required()
})
.required()
.messages({
  "any.required": "Request body is required",
  "object.base": "Request body must be a valid JSON object",
});
