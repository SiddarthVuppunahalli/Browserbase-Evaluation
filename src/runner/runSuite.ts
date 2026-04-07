// Entry point for the run:suite script
const runSuite = async () => {
    console.log("Running suite...");
};

if (require.main === module) {
    runSuite().catch(console.error);
}
