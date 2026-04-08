# Browserbase Evaluation Harness

## 1. What this project is
A lightweight, CLI-first evaluation harness for testing the reliability and execution capabilities of browser-based AI agents. It uses [Stagehand](https://github.com/browserbase/stagehand) running on [Browserbase](https://browserbase.com/) infrastructure to autonomously navigate web pages, execute actions, and extract structured data.

## 2. Why I built it
I needed a simple, transparent way to experimentally measure how often a standard LLM (like GPT-4o) succeeds or hallucinates when asked to perform basic web extraction and navigation tasks. Rather than relying on rigid industry benchmarks, this provides a hands-on, reproducible environment to observe raw agent behaviors in the wild.

## 3. Scope and non-goals
* **Scope:** 10 core public tasks evaluating basic web navigation, interaction, and data extraction against documentation portals and live dynamic sites (like Hacker News).
* **Non-goals:** This is an engineering experiment, not a scalable production platform. It explicitly avoids complex abstractions, concurrent test execution, retry-logic wrappers, or multi-model orchestration.

## 4. Project structure
```text
browserbase-evaluation/
├── src/
│   ├── config/       # Environment & minimal model payload setup
│   ├── tasks/        # Definitions for the 10 eval tasks
│   ├── runner/       # End-to-end execution loop for Stagehand
│   ├── scoring/      # Post-run automated validation & heuristics
│   └── reporting/    # Aggregates results into findings.md
├── results/          
│   ├── raw/          # Unscored JSON outputs directly from the LLM
│   ├── scored/       # Processed results mapping pass/partial/fail
│   └── reports/      # Aggregated markdown summaries
```

## 5. Setup
1. Clone this repository and run `npm install`.
2. Copy `.env.example` to `.env`.
3. Provide your `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, and `OPENAI_API_KEY`.

## 6. Running the tests
This harness separates execution from scoring to save on OpenAI API costs during testing.

### Standard Commands
* **Smoke Test (Fast Validation):** `npm run smoke` (Runs a simple extraction against Browserbase docs to verify your API keys)
* **Single Task:** `npm run run:task <taskId>` (e.g. `npm run run:task bb_free_plan_limits`)
* **Full Suite:** `npm run run:suite` (Runs all 10 evaluation tasks sequentially)
* **Scoring & Reporting:** `npm run report` (Grades all JSON outputs and builds `findings.md`)

## 7. Scoring methodology
The scoring engine runs entirely locally over the raw LLM outputs, assigning points via strict heuristics:
* **Pass (2 pts):** The agent completed the task seamlessly and strictly satisfied the automated validator (`exact`, `regex`, or `contains`).
* **Partial (1 pt):** The agent extracted data plausibly but hallucinated the final JSON layout, **or** the task intrinsically requires subjective manual review to verify (e.g., summarizing an article).
* **Fail (0 pts):** The stagehand session timed out, the DOM crashed, or the agent yielded an entirely blank response.

## 8. Output files
All runs leave a permanent local audit trail:
* `results/raw/`: The raw JSON execution context, final outputs, and **Browserbase Session Replay URLs**.
* `results/scored/`: Outputs normalized through the automated grading engine.
* `findings.md`: The final aggregated report of pass rates and common failure distributions.

## 9. Findings summary
A living record of the latest evaluation run is generated automatically by the reporter into `findings.md`. Expected limitations of baseline agents generally map back to extraction brittleness or timing issues with DOM rendering.

## 10. Next improvements
* **Strict Extraction:** Integrating Zod directly into the Stagehand `.extract()` calls to force structural compliance.
* **Auto-Retries:** Adding a lightweight timeout retry wrapper around `runTask` to handle transient SPA loading delays seamlessly.
* **Auth Harness:** Exploring subjective auth-gated evaluation tasks by injecting cookies into the browser session context on init.
