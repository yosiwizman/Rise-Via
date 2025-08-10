#!/usr/bin/env node

/**
 * Tech Debt Reporter
 * Generates comprehensive technical debt reports and tracks progress
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class TechDebtReporter {
  constructor() {
    this.baseline = this.loadBaseline();
    this.currentViolations = {};
    this.history = this.loadHistory();
  }

  loadBaseline() {
    const baselinePath = path.join(process.cwd(), '.tech-debt-baseline.json');
    if (fs.existsSync(baselinePath)) {
      return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    }
    return { totalViolations: 56, timestamp: new Date().toISOString() };
  }

  loadHistory() {
    const historyPath = path.join(process.cwd(), '.tech-debt-history.json');
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
    return [];
  }

  async runESLintAnalysis() {
    console.log(`${COLORS.blue}📊 Running ESLint analysis...${COLORS.reset}`);
    
    try {
      // Run ESLint with JSON reporter
      execSync('npx eslint . --ext ts,tsx --format json --output-file eslint-report.json', {
        stdio: 'pipe'
      });
    } catch (error) {
      // ESLint exits with error code when violations found
      // This is expected, continue processing
    }

    // Parse the report
    const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
    
    // Analyze violations by type
    const violations = {
      errors: 0,
      warnings: 0,
      byRule: {},
      byFile: {},
      topFiles: [],
      topRules: []
    };

    report.forEach(file => {
      if (file.errorCount + file.warningCount > 0) {
        violations.errors += file.errorCount;
        violations.warnings += file.warningCount;
        
        const relativePath = path.relative(process.cwd(), file.filePath);
        violations.byFile[relativePath] = file.errorCount + file.warningCount;
        
        file.messages.forEach(message => {
          if (!violations.byRule[message.ruleId]) {
            violations.byRule[message.ruleId] = 0;
          }
          violations.byRule[message.ruleId]++;
        });
      }
    });

    // Sort to find top offenders
    violations.topFiles = Object.entries(violations.byFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    violations.topRules = Object.entries(violations.byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    violations.total = violations.errors + violations.warnings;
    this.currentViolations = violations;
    
    return violations;
  }

  generateMarkdownReport() {
    const violations = this.currentViolations;
    const delta = violations.total - this.baseline.totalViolations;
    const trend = delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️';
    const status = violations.total <= 56 ? '✅' : '⚠️';
    
    let report = `# Technical Debt Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Summary ${status}\n\n`;
    report += `| Metric | Value | Trend |\n`;
    report += `|--------|-------|-------|\n`;
    report += `| Total Violations | ${violations.total} | ${trend} ${delta > 0 ? '+' : ''}${delta} |\n`;
    report += `| Errors | ${violations.errors} | 🔴 |\n`;
    report += `| Warnings | ${violations.warnings} | 🟡 |\n`;
    report += `| Baseline | ${this.baseline.totalViolations} | 📊 |\n\n`;
    
    report += `## Top 5 Files with Most Violations\n\n`;
    violations.topFiles.forEach(([file, count]) => {
      report += `- \`${file}\`: ${count} violations\n`;
    });
    
    report += `\n## Top 5 Most Violated Rules\n\n`;
    violations.topRules.forEach(([rule, count]) => {
      report += `- \`${rule}\`: ${count} occurrences\n`;
    });
    
    report += `\n## Progress Tracking\n\n`;
    if (delta < 0) {
      report += `🎉 **Great job!** Technical debt reduced by ${Math.abs(delta)} violations!\n`;
    } else if (delta > 0) {
      report += `⚠️ **Attention needed!** Technical debt increased by ${delta} violations.\n`;
    } else {
      report += `➡️ **Stable:** No change in technical debt.\n`;
    }
    
    report += `\n## Action Items\n\n`;
    report += this.generateActionItems();
    
    report += `\n## How to Fix\n\n`;
    report += `1. Run \`npm run lint:fix\` to auto-fix some violations\n`;
    report += `2. Review files in the top 5 list above\n`;
    report += `3. Focus on one rule at a time from the most violated list\n`;
    report += `4. Run \`npm run debt:track\` to update progress\n`;
    
    return report;
  }

  generateActionItems() {
    const violations = this.currentViolations;
    let items = [];
    
    if (violations.errors > 0) {
      items.push(`- [ ] Fix ${violations.errors} errors (priority: HIGH)`);
    }
    
    if (violations.topRules.length > 0) {
      const [topRule, count] = violations.topRules[0];
      items.push(`- [ ] Address \`${topRule}\` violations (${count} occurrences)`);
    }
    
    if (violations.topFiles.length > 0) {
      const [topFile] = violations.topFiles[0];
      items.push(`- [ ] Refactor \`${topFile}\``);
    }
    
    if (violations.total > 40) {
      items.push(`- [ ] Schedule tech debt sprint to reduce violations below 40`);
    }
    
    return items.join('\n');
  }

  updateHistory() {
    const entry = {
      timestamp: new Date().toISOString(),
      total: this.currentViolations.total,
      errors: this.currentViolations.errors,
      warnings: this.currentViolations.warnings
    };
    
    this.history.push(entry);
    
    // Keep only last 30 entries
    if (this.history.length > 30) {
      this.history = this.history.slice(-30);
    }
    
    fs.writeFileSync(
      path.join(process.cwd(), '.tech-debt-history.json'),
      JSON.stringify(this.history, null, 2)
    );
  }

  generateGitHubIssue() {
    const violations = this.currentViolations;
    
    let issue = `## Technical Debt Tracking Issue\n\n`;
    issue += `**Created:** ${new Date().toLocaleDateString()}\n`;
    issue += `**Current Violations:** ${violations.total}\n`;
    issue += `**Target:** 0\n\n`;
    
    issue += `### Breakdown by Priority\n\n`;
    issue += `- 🔴 Errors: ${violations.errors}\n`;
    issue += `- 🟡 Warnings: ${violations.warnings}\n\n`;
    
    issue += `### Files Needing Attention\n\n`;
    violations.topFiles.forEach(([file, count]) => {
      issue += `- [ ] \`${file}\` (${count} violations)\n`;
    });
    
    issue += `\n### Rules to Address\n\n`;
    violations.topRules.forEach(([rule, count]) => {
      issue += `- [ ] Fix \`${rule}\` violations (${count} occurrences)\n`;
    });
    
    issue += `\n### Labels\n`;
    issue += `\`tech-debt\`, \`maintenance\`, \`code-quality\`\n`;
    
    return issue;
  }

  async run() {
    console.log(`${COLORS.cyan}🔍 RiseViA Tech Debt Reporter${COLORS.reset}\n`);
    
    // Analyze current state
    await this.runESLintAnalysis();
    
    // Generate reports
    const markdownReport = this.generateMarkdownReport();
    const issueTemplate = this.generateGitHubIssue();
    
    // Save reports
    fs.writeFileSync('TECHNICAL_DEBT.md', markdownReport);
    fs.writeFileSync('.github/ISSUE_TEMPLATE/tech-debt.md', issueTemplate);
    
    // Update history
    this.updateHistory();
    
    // Console output
    console.log(markdownReport);
    
    // Exit code based on trend
    const delta = this.currentViolations.total - this.baseline.totalViolations;
    if (delta > 0 && process.env.CI) {
      console.log(`\n${COLORS.red}❌ Technical debt increased! Failing CI check.${COLORS.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${COLORS.green}✅ Technical debt check passed!${COLORS.reset}`);
      process.exit(0);
    }
  }
}

// Run the reporter
const reporter = new TechDebtReporter();
reporter.run().catch(console.error);
