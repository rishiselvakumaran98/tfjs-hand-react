# tensorflow.js for handpose_tracking
## A Demo used in Qianwen's visualization with AI Course: 

[online demo](https://umn-visual-intelligence-lab.github.io/tfjs-hand/)

<img width="300" alt="image" src="https://github.com/wangqianwen0418/tfjs-hand/assets/19774198/6c54f853-1793-4d61-bd2f-9da965aafdd2">

## Run and Develop the Project in Your Laptop

#### Preparation
- Ensure you have a code IDE like [VSCode](https://code.visualstudio.com/download) installed. VSCode is recommended, but feel free to use any IDE of your choice.
- [Install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on your machine.
- (If you are familar with Github) `fork` this repository, and `clone` the forked repository to your local machine. [Learn how to fork and clone](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
- (If you are not familar with Github) directly download the code from this repo

#### Install npm Dependencies
1. Open the cloned project folder with VSCode.
2. Launch the VSCode integrated terminal from menu: `Terminal > New Terminal` or `View > Terminal`.
3. In the terminal, run `npm install` to install necessary npm packages (first-time setup only).

#### Run the Project
  Execute `npm start` in the terminal.
 
  The project will open in your default web browser.
  Any code changes will automatically update the webpage.
  Google Chrome is recommended for the development.

## Deploy to Github Page

#### 1. Build and Push
  Run `npm run build`
  
  Run `npm run deploy` in your terminal

#### 2. Configure GitHub Page

1. In your web browser, go to the forked project in your github, and select the "Settings" tab.
2. In the sidebar, under "Code and automation," choose "Pages."
3. Set up "Build and deployment" as follows:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`; Folder: `/ (root)`
4. Click "Save."

 You can now share this demo via `https://{your_github_userid}.github.io/tfjs-hand/`
