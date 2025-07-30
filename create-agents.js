#!/usr/bin/env node

/**
 * Helper script to create all project agents in Claude Code
 * Run this script to see the commands needed to create each agent
 */

const agents = [
  {
    name: 'netlify-deploy-manager',
    description: 'Netlify deployment and serverless function expert. Use PROACTIVELY for deployments, function optimization, environment configuration, and production issues.',
    tools: ['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'WebFetch', 'mcp__netlify__netlify-deploy-services', 'mcp__netlify__netlify-project-services', 'mcp__netlify__netlify-coding-rules', 'TodoWrite'],
    color: 'blue'
  },
  {
    name: 'genkit-ai-expert',
    description: 'Expert in Google Genkit AI integration, Gemini API, and AI flow development. Use PROACTIVELY when working with AI flows, prompts, or Genkit configuration.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Write', 'Bash', 'Grep', 'Glob', 'WebFetch', 'mcp__netlify__netlify-coding-rules'],
    color: 'green'
  },
  {
    name: 'mcp-orchestrator',
    description: 'Use this agent when you need to intelligently select, combine, and orchestrate multiple MCP tools to complete complex tasks.',
    tools: ['*'],
    color: 'blue'
  },
  {
    name: 'react-nextjs-optimizer',
    description: 'Next.js 15 and React performance optimization specialist. Use PROACTIVELY for component optimization, hydration issues, state management, and build performance.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob', 'TodoWrite'],
    color: 'purple'
  },
  {
    name: 'test-automation',
    description: 'Testing automation specialist for WAOK-AI-STEM. Use PROACTIVELY after code changes to run tests, validate functionality, and ensure quality.',
    tools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob', 'TodoWrite', 'mcp__firebase-community__firestore_list_documents', 'mcp__firebase-community__firestore_get_document'],
    color: 'orange'
  },
  {
    name: 'ui-ux-designer',
    description: 'Child-friendly UI/UX design specialist for educational apps. Use PROACTIVELY when creating or modifying UI components.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Write', 'Grep', 'Glob', 'WebFetch'],
    color: 'pink'
  },
  {
    name: 'qa-test-architect',
    description: 'Use this agent when you need to design, implement, or review comprehensive testing strategies for web applications.',
    tools: ['*'],
    color: 'yellow'
  },
  {
    name: 'test-agent',
    description: 'Simple test agent to verify functionality',
    tools: ['*'],
    color: 'gray'
  },
  {
    name: 'fault-classifier-structural-logic',
    description: 'Agent specialized in identifying and classifying failures in WAOK-AI-STEM code as either [STRUCTURAL FAILURE] or [LOGIC FAILURE]',
    tools: ['Read', 'Edit', 'Grep', 'Glob'],
    color: 'red'
  }
];

console.log('='.repeat(80));
console.log('WAOK-AI-STEM Agent Creation Commands');
console.log('='.repeat(80));
console.log('\nThis script generates the commands needed to create all project agents.');
console.log('Copy and paste these commands in Claude Code to create missing agents.\n');

console.log('Step 1: Check existing agents');
console.log('-'.repeat(80));
console.log('/agents\n');

console.log('Step 2: Create missing agents (one by one)');
console.log('-'.repeat(80));

agents.forEach((agent, index) => {
  console.log(`\n${index + 1}. Create ${agent.name}:`);
  
  const toolsParam = agent.tools[0] === '*' ? '*' : agent.tools.join(',');
  
  console.log(`/agents create ${agent.name} "${agent.description}" --tools ${toolsParam} --color ${agent.color} --system-prompt-file .claude/agents/${agent.name}.md`);
});

console.log('\n' + '='.repeat(80));
console.log('Alternative: Manual creation with full system prompts');
console.log('='.repeat(80));
console.log('\nIf the --system-prompt-file flag doesn\'t work, you can manually create each agent');
console.log('by copying the system prompt from the corresponding .claude/agents/*.md file.\n');

console.log('Step 3: Verify all agents were created');
console.log('-'.repeat(80));
console.log('/agents\n');

console.log('='.repeat(80));
console.log('Important Notes:');
console.log('='.repeat(80));
console.log('1. System prompts are stored in .claude/agents/ directory');
console.log('2. Some agents use all tools (*), others use specific tool sets');
console.log('3. Many agents are marked for PROACTIVE use');
console.log('4. Run this script with: node create-agents.js');
console.log('='.repeat(80));