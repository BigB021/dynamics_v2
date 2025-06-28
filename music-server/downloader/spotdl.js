// const { exec } = require('child_process');
// const path = require('path');
// const dotenv = require('dotenv');
// dotenv.config();

// const downloadDir = path.resolve(process.env.DOWNLOAD_DIR || path.join(__dirname, '..', 'media'));

// const spotdlPath = '/home/youssef/spotdl-venv/bin/spotdl';


// function downloadWithSpotDL(url) {
//   const command = `"${spotdlPath}" --output "${downloadDir}/" "${url}"`;

//   return new Promise((resolve, reject) => {
//     exec(command, (err, stdout, stderr) => {
//       if (err) return reject(new Error(stderr));
//       resolve(stdout);
//     });
//   });
// }

// module.exports = { downloadWithSpotDL };

// downloadManager.js
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const downloadDir = path.resolve(process.env.DOWNLOAD_DIR || path.join(__dirname, '..', 'media'));
const spotdlPath = '/home/youssef/spotdl-venv/bin/spotdl';

const downloads = {}; // taskId => { progress: '' }

function downloadWithSpotDL(url, taskId) {
  return new Promise((resolve, reject) => {
    const args = ['--output', `${downloadDir}/`, url];
    const proc = spawn(spotdlPath, args);

    downloads[taskId] = { progress: '' };

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      downloads[taskId].progress = text; // store latest output (parse if you want)
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      downloads[taskId].progress = text;
    });

    proc.on('close', (code) => {
      if (code === 0) {
        downloads[taskId].progress = 'finished';
        resolve('Download finished');
      } else {
        downloads[taskId].progress = 'error';
        reject(new Error(`Download failed with code ${code}`));
      }
    });
  });
}

function getProgress(taskId) {
  return downloads[taskId]?.progress || '';
}

module.exports = { downloadWithSpotDL, getProgress };
