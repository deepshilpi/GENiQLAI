// This script attempts to clean up any existing processes using port 5000
const { execSync } = require('child_process');

try {
  console.log('Attempting to clean up port 5000...');
  
  // For Linux-like systems
  try {
    // Find PID using port 5000
    const findPid = execSync('lsof -i :5000 -t 2>/dev/null || true').toString().trim();
    if (findPid) {
      console.log(`Found process ${findPid} using port 5000. Killing...`);
      execSync(`kill -9 ${findPid}`);
      console.log('Process killed.');
    } else {
      console.log('No process found using port 5000 with lsof.');
    }
  } catch (error) {
    console.log('lsof command failed, trying alternative methods...');
  }
  
  // For Linux with fuser
  try {
    execSync('fuser -k 5000/tcp 2>/dev/null || true');
    console.log('Attempted to kill processes with fuser.');
  } catch (error) {
    console.log('fuser command failed or not available.');
  }
  
  // For Linux with ss
  try {
    const ssPid = execSync("ss -lptn 'sport = :5000' | grep -oP '(?<=pid=)\\d+' 2>/dev/null || true").toString().trim();
    if (ssPid) {
      console.log(`Found process ${ssPid} using port 5000 with ss. Killing...`);
      execSync(`kill -9 ${ssPid}`);
      console.log('Process killed.');
    } else {
      console.log('No process found using port 5000 with ss.');
    }
  } catch (error) {
    console.log('ss command failed or not available.');
  }
  
  console.log('Cleanup completed. Port 5000 should be available now.');

} catch (error) {
  console.error('Error during cleanup:', error.message);
}