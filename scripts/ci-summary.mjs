import { appendFileSync, existsSync, readFileSync } from 'node:fs';
const reportPath = process.env.PLAYWRIGHT_JSON_OUTPUT_FILE ?? 'test-results/results.json';
if (process.env.GITHUB_STEP_SUMMARY && existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const failures = [];
  function walk(suite) {
    for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        if (['failed', 'timedOut', 'interrupted'].includes(result.status)) {
          failures.push(`[${test.projectName ?? test.projectId}] ${spec.file}:${spec.line} — ${spec.title}\n${(result.errors ?? []).map(e => e.message ?? '').join('\n')}`);
        }
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  }
  for (const suite of report.suites ?? []) walk(suite);
  if (process.env.GITHUB_OUTPUT) {
    // A bounded plain-text result is also visible on the public workflow graph.
    const seen = new Set();
    const brief = failures.filter(text => {
      const project = text.match(/^\[[^\]]+\]/)?.[0];
      if (seen.has(project)) return false;
      seen.add(project);
      return true;
    }).map(text => text.slice(0, 350)).join(' | ')
      .replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').slice(0, 700);
    appendFileSync(process.env.GITHUB_OUTPUT, `failure_detail=${brief}\n`);
  }
  const details = failures.slice(0, 10).map(text => `\n<pre>${text.slice(0, 5000).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>\n`).join('');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## MA browser tests\n\n${report.stats?.expected ?? 0} passed; ${report.stats?.unexpected ?? 0} unexpected; ${report.stats?.skipped ?? 0} skipped.\n${details}`);
}
