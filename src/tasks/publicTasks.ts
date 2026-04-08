import { EvalTask } from './taskTypes';

export const publicTasks: EvalTask[] = [
    {
        id: "bb_free_plan_limits",
        label: "Browserbase Free Plan Limits",
        category: "extraction",
        startUrl: "https://docs.browserbase.com/welcome/getting-started",
        instruction: "Extract the free plan limits from this page. Expected fields: concurrentSessions, browserMinutesPerMonth.",
        expectedOutput: JSON.stringify({ concurrentSessions: 1, browserMinutesPerMonth: 60 }, null, 2),
        validator: { type: "exact" }, // Requires parsing JSON and exact matching the values
        maxDurationSec: 60,
        notes: "Verifies basic nested JSON extraction from docs"
    },
    {
        id: "bb_stagehand_setup",
        label: "Stagehand Quickstart Info",
        category: "extraction",
        startUrl: "https://docs.browserbase.com/welcome/quickstarts/stagehand",
        instruction: "Extract the package to install for Node.js and whether a separate model-provider account is required in this quickstart. Expected fields: npmPackage, separateModelProviderAccountRequired.",
        expectedOutput: JSON.stringify({ npmPackage: "@browserbasehq/stagehand", separateModelProviderAccountRequired: false }, null, 2),
        validator: { type: "exact" },
        maxDurationSec: 60
    },
    {
        id: "bb_session_defaults",
        label: "Browserbase Session Defaults",
        category: "extraction",
        startUrl: "https://docs.browserbase.com/platform/browser/getting-started/create-browser-session",
        instruction: "Extract whether session recording and session logging are enabled by default. Expected fields: recordingEnabledByDefault, loggingEnabledByDefault.",
        expectedOutput: JSON.stringify({ recordingEnabledByDefault: true, loggingEnabledByDefault: true }, null, 2),
        validator: { type: "exact" },
        maxDurationSec: 60
    },
    {
        id: "bb_observability_features",
        label: "Browserbase Observability Features",
        category: "extraction",
        startUrl: "https://docs.browserbase.com/platform/browser/observability/observability",
        instruction: "Extract whether every session is automatically recorded as a video and whether a live debug URL is available while the session is running. Expected fields: autoVideoRecording, liveDebugUrlAvailable.",
        expectedOutput: JSON.stringify({ autoVideoRecording: true, liveDebugUrlAvailable: true }, null, 2),
        validator: { type: "exact" },
        maxDurationSec: 60
    },
    {
        id: "gh_pull_request_page",
        label: "GitHub Docs PR Page",
        category: "navigation",
        startUrl: "https://docs.github.com",
        instruction: "Navigate to the page about pull requests and extract the page title. Expected fields: pageTitle, finalUrl.",
        expectedOutput: "pull request", // Target string to look for
        validator: { type: "contains", value: "pull request" },
        maxDurationSec: 120,
        notes: "Tests search or navigation within a doc site"
    },
    {
        id: "gh_actions_intro",
        label: "GitHub Actions Intro",
        category: "navigation",
        startUrl: "https://docs.github.com",
        instruction: "Find an introduction page for GitHub Actions and extract a one-sentence summary of what GitHub Actions is. Expected fields: pageTitle, summary.",
        expectedOutput: "A succinct one sentence summary of GH Actions.",
        validator: { type: "manual" },
        maxDurationSec: 120,
        notes: "Subjective summary, requires manual review"
    },
    {
        id: "py_downloads_latest",
        label: "Python Latest release",
        category: "navigation",
        startUrl: "https://www.python.org",
        instruction: "Navigate to the Downloads page and extract the latest Python 3 release text shown on the page. Expected fields: releaseText, finalUrl.",
        expectedOutput: "Python 3.x.x",
        validator: { type: "regex", value: "Python 3\\..+" },
        maxDurationSec: 90
    },
    {
        id: "py_tutorial_title",
        label: "Python Tutorial Title",
        category: "navigation",
        startUrl: "https://www.python.org",
        instruction: "Go to the Python Tutorial page and extract the page title. Expected fields: pageTitle, finalUrl.",
        expectedOutput: "tutorial",
        validator: { type: "contains", value: "tutorial" },
        maxDurationSec: 90
    },
    {
        id: "hn_top_story_comments",
        label: "HN Top Story Comments",
        category: "navigation",
        startUrl: "https://news.ycombinator.com",
        instruction: "Open the comments page for the top story and extract the story title and points. Expected fields: storyTitle, points, finalUrl.",
        expectedOutput: "Title and points of current HN top story",
        validator: { type: "manual" },
        maxDurationSec: 120,
        notes: "Dynamic content, requires manual validation"
    },
    {
        id: "hn_more_page_first_story",
        label: "HN Next Page First Story",
        category: "navigation",
        startUrl: "https://news.ycombinator.com",
        instruction: "Go to the next page of stories and extract the title of the first story on that page. Expected fields: firstStoryTitle, finalUrl.",
        expectedOutput: "Title of first story on 2nd page",
        validator: { type: "manual" },
        maxDurationSec: 120,
        notes: "Dynamic content, requires manual validation"
    }
];
