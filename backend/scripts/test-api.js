#!/usr/bin/env node

/**
 * CI/CD Integration Test Script for Chore Coin Backend
 *
 * This script tests the API endpoints using hono request command.
 * It validates that all endpoints respond correctly without requiring
 * authentication for basic health checks.
 */

const { execSync } = require("child_process");
const path = require("path");

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Test cases configuration
const tests = [
  {
    name: "Health Check",
    command: "npx hono request -P / src/index.ts",
    expectedStatus: 200,
  },
  {
    name: "GET Chores (should require auth)",
    command: "npx hono request -P /api/chores src/index.ts",
    expectedStatus: 401,
  },
  {
    name: "GET Rewards (should require auth)",
    command: "npx hono request -P /api/rewards src/index.ts",
    expectedStatus: 401,
  },
  {
    name: "GET Users/Me (should require auth)",
    command: "npx hono request -P /api/users/me src/index.ts",
    expectedStatus: 401,
  },
  {
    name: "GET History (should require auth)",
    command: "npx hono request -P /api/history src/index.ts",
    expectedStatus: 401,
  },
  {
    name: "404 Not Found",
    command: "npx hono request -P /api/nonexistent src/index.ts",
    expectedStatus: 404,
  },
];

const parseResponse = (rawOutput) => {
  const trimmed = rawOutput.trim();

  if (!trimmed) {
    return { status: undefined, payload: trimmed, isJson: false };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const derivedStatus =
      typeof parsed.status === "number"
        ? parsed.status
        : typeof parsed.statusCode === "number"
          ? parsed.statusCode
          : undefined;

    return { status: derivedStatus, payload: parsed, isJson: true };
  } catch {
    const statusMatch = trimmed.match(/status(?:Code)?\s*[:=]\s*(\d{3})/i);
    const status = statusMatch ? Number(statusMatch[1]) : undefined;
    return { status, payload: trimmed, isJson: false };
  }
};

let passedTests = 0;

let failedTests = 0;

console.log(
  `\n${colors.blue}🧪 Chore Coin Backend - CI/CD Integration Tests${colors.reset}\n`,
);

tests.forEach((test, index) => {
  try {
    console.log(
      `${colors.yellow}[${index + 1}/${tests.length}]${colors.reset} ${test.name}...`,
    );

    let output;
    try {
      output = execSync(test.command, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        cwd: path.resolve(__dirname, ".."),
      });
    } catch (error) {
      // hono request may output to stderr even on success

      const combinedOutput = [error.stdout, error.stderr]
        .filter(Boolean)
        .join("\n");
      output = combinedOutput || error.message;
    }

    const parsed = parseResponse(output);
    const status = parsed.status;

    if (status === test.expectedStatus) {
      console.log(`${colors.green}✓ PASS${colors.reset} (Status: ${status})\n`);
      passedTests++;
    } else {
      console.log(
        `${colors.red}✗ FAIL${colors.reset} (Expected: ${test.expectedStatus}, Got: ${status ?? "unknown"})\n`,
      );

      const formattedPayload = parsed.isJson
        ? JSON.stringify(parsed.payload, null, 2)
        : parsed.payload;
      console.log(`Response: ${formattedPayload}\n`);

      failedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset}\n`);
    console.error(`Error details: ${error.message}\n`);
    failedTests++;
  }
});

// Summary
console.log(
  `${colors.blue}═══════════════════════════════════════${colors.reset}`,
);
console.log(
  `${colors.green}Passed: ${passedTests}${colors.reset} | ${colors.red}Failed: ${failedTests}${colors.reset}`,
);
console.log(
  `${colors.blue}═══════════════════════════════════════${colors.reset}\n`,
);

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
