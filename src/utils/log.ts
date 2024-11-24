export const errorLog = (message) => {
  const red = "\x1b[31m"; // ANSI escape code for red
  const reset = "\x1b[0m"; // ANSI escape code to reset color
  console.log(`${red}[ERROR]: ${reset} ${message}`);
};
