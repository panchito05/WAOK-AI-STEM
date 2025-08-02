// Script to create Firebase App Hosting backend via API
const { execSync } = require('child_process');
const fs = require('fs');

async function createBackend() {
  try {
    console.log('Creating Firebase App Hosting backend...');
    
    // First, let's check if we can use the non-interactive mode
    // We need to use the correct options for the command
    const command = `firebase apphosting:backends:create --project waok-ai-stem`;
    
    console.log('Executing:', command);
    
    // Create input for the interactive prompts
    const input = `waok-ai-stem\nus-central1\npanchito05/WAOK-AI-STEM\nmain\n`;
    
    // Write input to a temp file
    fs.writeFileSync('temp-input.txt', input);
    
    // Execute with input redirection
    execSync(`${command} < temp-input.txt`, { stdio: 'inherit' });
    
    // Clean up temp file
    fs.unlinkSync('temp-input.txt');
    
    console.log('Backend created successfully!');
  } catch (error) {
    console.error('Error creating backend:', error.message);
    // Try to clean up temp file if it exists
    if (fs.existsSync('temp-input.txt')) {
      fs.unlinkSync('temp-input.txt');
    }
    process.exit(1);
  }
}

createBackend();