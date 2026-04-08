import { publicTasks } from '../tasks/publicTasks';
import { runTask } from './runTask';

const runSingleTask = async () => {
    const args = process.argv.slice(2);
    const target = args[0];

    if (!target) {
        console.error("❌ Please provide a task ID (e.g. npm run run:task bb_free_plan_limits)");
        process.exit(1);
    }

    let task;
    if (target === "--smoke") {
        // We use the free plan limits extraction task for the smoke test as it's the safest, 
        // most static, and fastest to verify if OpenAI + Browserbase keys are working.
        // Fallback to the first task if the targeted task is ever deleted.
        task = publicTasks.find(t => t.id === 'bb_free_plan_limits') || publicTasks[0];
        console.log(`💨 Initializing Smoke Test...`);
    } else {
        task = publicTasks.find(t => t.id === target);
    }

    if (!task) {
        console.error(`❌ Task '${target}' not found in publicTasks array.`);
        console.log(`Available tasks: ${publicTasks.map(t => t.id).join(', ')}`);
        process.exit(1);
    }

    try {
        const result = await runTask(task);
        // Note: runTask() natively prints the path to the generated raw JSON automatically
        if (result.errorMessage) {
            console.log(`\n❌ Task run flagged an error: ${result.errorMessage}`);
        } else {
            console.log(`\n✅ Task isolated run finished in ${result.durationSec}s`);
        }
    } catch (e: any) {
        console.error("\n❌ Catastrophic CLI execution failure:", e.message);
    }
};

if (require.main === module) {
    runSingleTask().catch((err) => {
        console.error("CLI Execution crashed natively:", err);
        process.exit(1);
    });
}
