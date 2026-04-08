import { publicTasks } from '../tasks/publicTasks';
import { runTask } from './runTask';
import path from 'path';

export const runSuite = async () => {
    console.log(`=========================================`);
    console.log(` Starting Browserbase Eval Suite`);
    console.log(` Total Tasks: ${publicTasks.length}`);
    console.log(`=========================================\n`);

    let completedCount = 0;
    let runtimeFailedCount = 0;

    for (let i = 0; i < publicTasks.length; i++) {
        const task = publicTasks[i];
        console.log(`[Task ${i + 1}/${publicTasks.length}] ${task.id}`);
        
        try {
            // runTask contains its own bounded try/catch, meaning it handles standard Browserbase failures.
            // We wrap it here as an extra layer of defense against unforeseen OS/Memory crashes
            // to ensure task 4 still runs even if task 3 critically aborts.
            const result = await runTask(task);
            
            if (result.errorMessage) {
                runtimeFailedCount++;
                console.log(`❌ Done with runtime error: ${result.errorMessage}\n`);
            } else {
                completedCount++;
                console.log(`✅ Done successfully in ${result.durationSec}s\n`);
            }
        } catch (error: any) {
            runtimeFailedCount++;
            console.log(`❌ Fatal uncaught runtime error executing task ${task.id}: ${error.message || String(error)}\n`);
        }
    }

    const rawDir = path.join(process.cwd(), "results", "raw");
    
    console.log(`=========================================`);
    console.log(` Suite Execution Complete`);
    console.log(`=========================================`);
    console.log(` Total Tasks   : ${publicTasks.length}`);
    console.log(` Completed     : ${completedCount}`);
    console.log(` Runtime Fails : ${runtimeFailedCount}`);
    console.log(` Raw Results stored in: ${rawDir}`);
    console.log(`=========================================`);
};

// CLI entry point allowing execution via `npm run run:suite`
if (require.main === module) {
    runSuite().catch((err) => {
        console.error("Suite catastrophically failed:", err);
        process.exit(1);
    });
}
