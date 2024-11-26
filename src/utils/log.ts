export const errorLog = (message) => {
  const red = "\x1b[31m"; // ANSI escape code for red
  const reset = "\x1b[0m"; // ANSI escape code to reset color
  const output = `${red}[ERROR]: ${reset} ${message}`;

  return new Error(output);
};
