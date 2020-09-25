export interface Parentheses {
  opening: string;
  closing: string;
}

export const argParser = (
  prefix: string,
  parentheses: Parentheses,
  argString: string
): string[] => {
  let cursorOne: number, cursorTwo: number;
  const args = [];
  cursorOne = 0;

  if (argString[cursorOne] !== prefix) {
    //not command
  }

  cursorOne++;
  cursorTwo = cursorOne;
  //don't need to check for block argument on command portion
  while (argString[cursorTwo] !== " ") {
    cursorTwo++;
  }

  //first entry in the array is the command
  args.push(argString.substring(cursorOne, cursorTwo));

  for (cursorOne = cursorTwo + 1; cursorOne < argString.length; cursorOne = cursorTwo + 1) {
    //tolerate multiple spaces between arguments
    while (argString[cursorOne] === " ") {
      cursorOne++;
    }

    //first character of argument determines if it is seperated by spaces or parentheses are used
    if (argString[cursorOne] === parentheses.opening) {
      for (
        cursorTwo = ++cursorOne;
        argString[cursorTwo] !== parentheses.closing && cursorTwo < argString.length;
        cursorTwo++
      );
    } else {
      for (
        cursorTwo = cursorOne;
        argString[cursorTwo] !== " " && cursorTwo < argString.length;
        cursorTwo++
      );
    }

    if (cursorTwo >= argString.length) {
      args.push(argString.substring(cursorOne));
    } else {
      args.push(argString.substring(cursorOne, cursorTwo));
    }
  }
  return args;
};
