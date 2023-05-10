"use strict";

(function () {
  var initHandlers = function () {
    var OPERATORS = /[+\-×÷^/*]/;
    var IS_DISPLAYED = false;

    function getCurrentString(value) {
      var currentString = value;
      currentString = currentString.replace(/\*/g, "×");
      currentString = currentString.replace(/\//g, "÷");

      var lastChar = currentString[currentString.length - 1];

      return {currentString, lastChar};
    }

    function getInputString(value) {
      var inputString = value;
      inputString = inputString.replace(/\*/g, "×");
      inputString = inputString.replace(/\//g, "÷");

      // forming an array of numbers. e.g. for above string it will be: numbers = ["10", "26", "33", "56", "34", "23"]
      var numbers = inputString.split(/\+|\-|\×|\÷|\^/g);

      // forming an array of operators. for above string it will be: operators = ["+", "+", "-", "*", "/"]
      // first we replace all the numbers and dot with empty string and then split
      var operators = inputString.replace(/[0-9]|\./g, "").split("");

      return {inputString, numbers, operators};
    }

    function getNumbers(numbers) {
      if (!(numbers instanceof NodeList)) {
        throw new TypeError('Invalid argument: expected a NodeList');
      }

      // adding click handlers to number buttons
      for (var i = 0; i < numbers.length; i++) {
        numbers[i].addEventListener("click", function (e) {
          // storing current input string and its last character in variables - used later
          const {currentString, lastChar} = getCurrentString(input.value);

          var substrings = (currentString + e.target.textContent).split(OPERATORS);

          for (var substr of substrings) {
            if (e.target.textContent === '.' && /\..*\./.test(substr)) {
              e.preventDefault();
              return false;
            }
          }

          // if result is not displayed, just keep adding
          if (IS_DISPLAYED === false) {
            input.value += e.target.textContent;
          } else if (IS_DISPLAYED === true && lastChar === "+" || lastChar === "-" || lastChar === "×" || lastChar === "÷" || lastChar === "^") {
            // if result is currently displayed and user pressed an operator
            // we need to keep on adding to the string for next operation
            IS_DISPLAYED = false;
            input.value += e.target.textContent;
          } else {
            // if result is currently displayed and user pressed a number
            // we need clear the input string and add the new input to start the new operation
            IS_DISPLAYED = false;
            input.value = "";
            input.value += e.target.textContent;
          }

        });
      }
    }

    function getOperators(operators) {
      if (!(operators instanceof NodeList)) {
        throw new TypeError('Invalid argument: expected a NodeList');
      }

      // adding click handlers to number buttons
      for (var i = 0; i < operators.length; i++) {
        operators[i].addEventListener("click", function (e) {
          // storing current input string and its last character in variables - used later
          const {currentString, lastChar} = getCurrentString(input.value);

          // if last character entered is an operator, replace it with the currently pressed one
          if (lastChar === "+" || lastChar === "-" || lastChar === "×" || lastChar === "÷" || lastChar === "^") {
            input.value = currentString.substring(0, currentString.length - 1) + e.target.textContent;
          } else if (currentString.length === 0) {
            // if first key pressed is an operator, don't do anything
            console.log("enter a number first");
          } else {
            // else just add the operator pressed to the input
            input.value += e.target.textContent;
          }

        });
      }
    }

    function getResult(result) {
      if (!(result instanceof HTMLElement)) {
        throw new TypeError('Invalid argument: expected a HTMLElement');
      }

      // on click of 'equal' button
      result.addEventListener("click", function () {
        // this is the string that we will be processing eg. -10+26+33-56*34/23
        const {inputString, numbers, operators} = getInputString(input.value);

        console.log(inputString);
        console.log(operators);
        console.log(numbers);
        console.log("----------------------------");

        // now we are looping through the array and doing one operation at a time.
        // first divide, then multiply, then subtraction and then addition
        // as we move we are alternating the original numbers and operators array
        // the final element remaining in the array will be the output

        var operate = {
          _operators: [], _numbers: [], get(operators, numbers) {
            this._operators = operators;
            this._numbers = numbers;
          }, exponent() {
            var exponent = this._operators.indexOf("^");
            while (exponent != -1) {
              this._numbers.splice(exponent, 2, this._numbers[exponent] ** this._numbers[exponent + 1]);
              this._operators.splice(exponent, 1);
              exponent = this._operators.indexOf("^");
            }
          }, divide() {
            var divide = this._operators.indexOf("÷");
            while (divide != -1) {
              this._numbers.splice(divide, 2, this._numbers[divide] / this._numbers[divide + 1]);
              this._operators.splice(divide, 1);
              divide = this._operators.indexOf("÷");
            }
          }, multiply() {
            var multiply = this._operators.indexOf("×");
            while (multiply != -1) {
              this._numbers.splice(multiply, 2, this._numbers[multiply] * this._numbers[multiply + 1]);
              this._operators.splice(multiply, 1);
              multiply = this._operators.indexOf("×");
            }
          }, add() {
            var add = this._operators.indexOf("+");
            while (add != -1) {
              // using parseFloat is necessary, otherwise it will result in string concatenation :)
              this._numbers.splice(add, 2, parseFloat(this._numbers[add]) + parseFloat(this._numbers[add + 1]));
              this._operators.splice(add, 1);
              add = this._operators.indexOf("+");
            }
          }, subtract() {
            var subtract = this._operators.indexOf("-");
            while (subtract != -1) {
              this._numbers.splice(subtract, 2, this._numbers[subtract] - this._numbers[subtract + 1]);
              this._operators.splice(subtract, 1);
              subtract = this._operators.indexOf("-");
            }
          }
        }

        operate.execute = function (name) {
          // skip the first argument
          var args = Array.prototype.slice.call(arguments, 1);

          // push the name of the command and the arguments passed in
          this._operators.push(name);

          if (operate[name]) {
            // pass arguments to the function
            return operate[name].apply(operate, args);
          }

          return false;
        }

        operate.execute('get', operators, numbers);
        operate.execute('exponent');
        operate.execute('divide');
        operate.execute('multiply');
        operate.execute('subtract');
        operate.execute('add');

        input.value = operate._numbers[0]; // displaying the output
        IS_DISPLAYED = true; // turning flag if result is displayed
      });
    }

    function initKeyboard(input) {
      if (!(input instanceof HTMLElement)) {
        throw new TypeError('Invalid argument: expected a HTMLElement');
      }

      input.addEventListener('keydown', (e) => {
        if (!['Backspace', 'Delete', '.', '+', '-', '*', '/', 'x', '^', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
          e.preventDefault();
          return false;
        }

        var value = e.target.value + e.key;
        var substrings = value.split(OPERATORS);

        for (var sub of substrings) {
          if (e.key === '.' && /\..*\./.test(sub)) {
            e.preventDefault();
            return false;
          }
        }
      });
    }

    function clearInput(clear) {
      if (!(clear instanceof HTMLElement)) {
        throw new TypeError('Invalid argument: expected a HTMLElement');
      }

      // clear input when user click on clear button
      clear.addEventListener("click", function () {
        input.value = "";
      })
    }

    return {
      getNumbers, getOperators, clearInput, initKeyboard, getResult
    }
  }

  var input = document.getElementById('input'), // input/output button
    numbers = document.querySelectorAll('.numbers div'), // number buttons
    operators = document.querySelectorAll('.operators div'), // operator buttons
    result = document.getElementById('result'), // equal button
    clear = document.getElementById('clear'); // clear button

  var init = initHandlers();
  init.initKeyboard(input);
  init.getNumbers(numbers);
  init.getOperators(operators);
  init.getResult(result);
  init.clearInput(clear)
})();

