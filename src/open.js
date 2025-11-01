import { spawn } from 'node:child_process';
import path from 'node:path';

/**
 * Opens a URL or file path in the specified browser
 * @param {string} target - URL or file path to open
 * @param {Object} options - Options object
 * @param {string} [options.browser] - Browser to use ('chrome', 'firefox', 'edge', or undefined for default)
 * @param {boolean} [options.quiet] - Suppress output
 * @returns {Promise<void>}
 */
export function openInBrowser(target, options = {}) {
  const { browser, quiet } = options;
  const platform = process.platform;

  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    // Normalize target - convert relative paths to absolute
    let targetPath = target;
    if (target.startsWith('./') || (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('file://'))) {
      // Check if it's a local file path
      if (!path.isAbsolute(target)) {
        targetPath = path.resolve(process.cwd(), target);
      }
    }

    if (platform === 'darwin') {
      // macOS
      if (browser === 'chrome') {
        command = 'open';
        args = ['-a', 'Google Chrome', targetPath];
      } else if (browser === 'firefox') {
        command = 'open';
        args = ['-a', 'Firefox', targetPath];
      } else if (browser === 'edge') {
        command = 'open';
        args = ['-a', 'Microsoft Edge', targetPath];
      } else {
        // Default browser
        command = 'open';
        args = [targetPath];
      }
    } else if (platform === 'win32') {
      // Windows
      if (browser === 'chrome') {
        // Try chrome.exe directly (usually in PATH)
        command = 'chrome.exe';
        args = [targetPath];
      } else if (browser === 'firefox') {
        // Try firefox.exe directly (usually in PATH)
        command = 'firefox.exe';
        args = [targetPath];
      } else if (browser === 'edge') {
        // Try msedge.exe directly (usually in PATH)
        command = 'msedge.exe';
        args = [targetPath];
      } else {
        // Default browser using start command
        command = 'cmd';
        args = ['/c', 'start', '', targetPath];
      }
    } else {
      // Linux and other Unix-like systems
      if (browser === 'chrome') {
        // Try google-chrome first, then chromium-browser
        command = 'google-chrome';
        args = [targetPath];
      } else if (browser === 'firefox') {
        command = 'firefox';
        args = [targetPath];
      } else if (browser === 'edge') {
        command = 'microsoft-edge';
        args = [targetPath];
      } else {
        // Default browser using xdg-open
        command = 'xdg-open';
        args = [targetPath];
      }
    }

    let resolved = false;
    let rejected = false;

    const handleSpawn = (childProcess) => {
      if (resolved || rejected) return;
      
      childProcess.unref();
      resolved = true;
      resolve();
    };

    const handleError = (error) => {
      if (resolved || rejected) return;
      
      // Try fallback options
      if (platform === 'win32' && browser) {
        // On Windows, if direct executable fails, try common installation paths
        const fallbackPaths = [];
        
        if (browser === 'chrome') {
          fallbackPaths.push(
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
          );
        } else if (browser === 'firefox') {
          fallbackPaths.push(
            'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
            'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
          );
        } else if (browser === 'edge') {
          fallbackPaths.push(
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
          );
        }
        
        for (const fallbackPath of fallbackPaths) {
          try {
            const fallbackChild = spawn(fallbackPath, [targetPath], {
              detached: true,
              stdio: 'ignore'
            });
            
            if (fallbackChild.pid) {
              handleSpawn(fallbackChild);
              return;
            }
            
            fallbackChild.on('error', () => {
              // Continue to next fallback path
            });
          } catch (fallbackError) {
            // Continue to next fallback path
          }
        }
        
        // If all fallback paths fail, reject with error
        rejected = true;
        reject(new Error(`Failed to open ${targetPath}. ${browser} not found.`));
        return;
      } else if (platform !== 'win32' && platform !== 'darwin') {
        // Linux fallbacks
        if (browser === 'chrome' && command === 'google-chrome') {
          // Try chromium-browser as fallback
          try {
            const fallbackChild = spawn('chromium-browser', [targetPath], {
              detached: true,
              stdio: 'ignore'
            });
            
            if (fallbackChild.pid) {
              handleSpawn(fallbackChild);
              return;
            }
            
            fallbackChild.on('error', () => {
              if (!resolved && !rejected) {
                rejected = true;
                reject(new Error(`Failed to open ${targetPath}. Browser not found.`));
              }
            });
            
            return;
          } catch (fallbackError) {
            // Fall through to reject
          }
        } else if (browser === 'edge' && command === 'microsoft-edge') {
          // Try microsoft-edge-stable as fallback
          try {
            const fallbackChild = spawn('microsoft-edge-stable', [targetPath], {
              detached: true,
              stdio: 'ignore'
            });
            
            if (fallbackChild.pid) {
              handleSpawn(fallbackChild);
              return;
            }
            
            fallbackChild.on('error', () => {
              if (!resolved && !rejected) {
                rejected = true;
                reject(new Error(`Failed to open ${targetPath}. Browser not found.`));
              }
            });
            
            return;
          } catch (fallbackError) {
            // Fall through to reject
          }
        }
      }
      
      rejected = true;
      reject(error);
    };

    try {
      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore'
      });

      // If spawn was successful, resolve immediately
      if (child.pid) {
        handleSpawn(child);
      } else {
        // Wait for error event if spawn failed
        child.on('error', handleError);
      }
    } catch (error) {
      handleError(error);
    }
  });
}

