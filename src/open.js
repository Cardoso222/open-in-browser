import { spawn } from 'node:child_process';
import path from 'node:path';

export function openInBrowser(target, options = {}) {
  const { browser, quiet } = options;
  const platform = process.platform;

  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    let targetPath = target;
    if (target.startsWith('./') || (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('file://'))) {
      if (!path.isAbsolute(target)) {
        targetPath = path.resolve(process.cwd(), target);
      }
    }

    if (platform === 'darwin') {
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
        command = 'open';
        args = [targetPath];
      }
    } else if (platform === 'win32') {
      if (browser === 'chrome') {
        command = 'chrome.exe';
        args = [targetPath];
      } else if (browser === 'firefox') {
        command = 'firefox.exe';
        args = [targetPath];
      } else if (browser === 'edge') {
        command = 'msedge.exe';
        args = [targetPath];
      } else {
        command = 'cmd';
        args = ['/c', 'start', '', targetPath];
      }
    } else {
      if (browser === 'chrome') {
        command = 'google-chrome';
        args = [targetPath];
      } else if (browser === 'firefox') {
        command = 'firefox';
        args = [targetPath];
      } else if (browser === 'edge') {
        command = 'microsoft-edge';
        args = [targetPath];
      } else {
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
      
      if (platform === 'win32' && browser) {
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
            });
          } catch (fallbackError) {
          }
        }
        
        rejected = true;
        reject(new Error(`Failed to open ${targetPath}. ${browser} not found.`));
        return;
      } else if (platform !== 'win32' && platform !== 'darwin') {
        if (browser === 'chrome' && command === 'google-chrome') {
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
          }
        } else if (browser === 'edge' && command === 'microsoft-edge') {
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

      if (child.pid) {
        handleSpawn(child);
      } else {
        child.on('error', handleError);
      }
    } catch (error) {
      handleError(error);
    }
  });
}

