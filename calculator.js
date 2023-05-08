"use strict";

(function () {
  var initHandlers = function () {
    var _numbers = [];
    var _resultDisplayed = false;

    function addNumHandlers() {
      // adding click handlers to number buttons
      for (var i = 0; i < _numbers.length; i++) {
        _numbers[i].addEventListener("click", function (e) {
          // storing current input string and its last character in variables - used later
          var currentString = input.value;
          currentString = currentString.replace(/\*/g, "×");
          currentString = currentString.replace(/\//g, "÷");
          var lastChar = currentString[currentString.length - 1];

          var operators = /[+\-×÷^/*]/;
          var substrings = (currentString + e.target.textContent).split(operators);

          for (var substr of substrings) {
            if (e.target.textContent === '.' && /\..*\./.test(substr)) {
              return e.preventDefault();
            }
          }


          // if result is not displayed, just keep adding
          if (_resultDisplayed === false) {
            input.value += e.target.textContent;
          } else if (_resultDisplayed === true && lastChar === "+" || lastChar === "-" || lastChar === "×" || lastChar === "÷" || lastChar === "^") {
            // if result is currently displayed and user pressed an operator
            // we need to keep on adding to the string for next operation
            _resultDisplayed = false;
            input.value += e.target.textContent;
          } else {
            // if result is currently displayed and user pressed a number
            // we need clear the input string and add the new input to start the new operation
            _resultDisplayed = false;
            input.value = "";
            input.value += e.target.textContent;
          }

        });
      }
    }

    function addOperatorHandlers() {
      // adding click handlers to number buttons
      for (var i = 0; i < operator.length; i++) {
        operator[i].addEventListener("click", function (e) {

          // storing current input string and its last character in variables - used later
          var currentString = input.value;
          currentString = currentString.replace(/\*/g, "×");
          currentString = currentString.replace(/\//g, "÷");
          var lastChar = currentString[currentString.length - 1];

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

    // to do: add delay when entering with keyboard
    // slucaj kada pokusa da unsese sa keyboard i misem da se
    // disalbed mude dok ne unese sa jednog
    function addCalculationHandler() {
      // on click of 'equal' button
      result.addEventListener("click", function () {
        // this is the string that we will be processing eg. -10+26+33-56*34/23
        var inputString = input.value;
        inputString = inputString.replace(/\*/g, "×");
        inputString = inputString.replace(/\//g, "÷");

        // forming an array of numbers. e.g. for above string it will be: numbers = ["10", "26", "33", "56", "34", "23"]
        var numbers = inputString.split(/\+|\-|\×|\÷|\^/g);

        // forming an array of operators. for above string it will be: operators = ["+", "+", "-", "*", "/"]
        // first we replace all the numbers and dot with empty string and then split
        var operators = inputString.replace(/[0-9]|\./g, "").split("");

        console.log(inputString);
        console.log(operators);
        console.log(numbers);
        console.log("----------------------------");

        // now we are looping through the array and doing one operation at a time.
        // first divide, then multiply, then subtraction and then addition
        // as we move we are alternating the original numbers and operators array
        // the final element remaining in the array will be the output

        var operate = {
          _operators: [],
          _numbers: [],
          get(operators, numbers) {
            this._operators = operators;
            this._numbers = numbers;
          },
          exponent() {
            var exponent = this._operators.indexOf("^");
            while (exponent != -1) {
              this._numbers.splice(exponent, 2, this._numbers[exponent] ** this._numbers[exponent + 1]);
              this._operators.splice(exponent, 1);
              exponent = this._operators.indexOf("^");
            }
          },
          divide() {
            var divide = this._operators.indexOf("÷");
            while (divide != -1) {
              this._numbers.splice(divide, 2, this._numbers[divide] / this._numbers[divide + 1]);
              this._operators.splice(divide, 1);
              divide = this._operators.indexOf("÷");
            }
          },
          multiply() {
            var multiply = this._operators.indexOf("×");
            while (multiply != -1) {
              this._numbers.splice(multiply, 2, this._numbers[multiply] * this._numbers[multiply + 1]);
              this._operators.splice(multiply, 1);
              multiply = this._operators.indexOf("×");
            }
          },
          add() {
            var add = this._operators.indexOf("+");
            while (add != -1) {
              // using parseFloat is necessary, otherwise it will result in string concatenation :)
              this._numbers.splice(add, 2, parseFloat(this._numbers[add]) + parseFloat(this._numbers[add + 1]));
              this._operators.splice(add, 1);
              add = this._operators.indexOf("+");
            }
          },
          subtract() {
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

        _resultDisplayed = true; // turning flag if result is displayed
      });
    }

    function getNumbers(numbers) {
      if (!numbers instanceof NodeList) {
        throw new Error('Provided argument is not an array!');
      }

      _numbers = numbers;

      addNumHandlers();
      addOperatorHandlers();
      addCalculationHandler();
    }

    function clearInput(clear) {
      // clearing the input on press of clear
      clear.addEventListener("click", function () {
        input.value = "";
      })
    }

    return {
      getNumbers,
      clearInput
    }
  }

  var input = document.getElementById('input'), // input/output button
    number = document.querySelectorAll('.numbers div'), // number buttons
    operator = document.querySelectorAll('.operators div'), // operator buttons
    result = document.getElementById('result'), // equal button
    clear = document.getElementById('clear'); // clear button

  input.addEventListener('keydown', (e) => {
    var value = e.target.value + e.key;
    var operators = /[+\-×÷^/*]/;
    var substrings = value.split(operators);

    if(e.key.match(operators) && e.target.value.endsWith(e.key)){
      e.preventDefault();
    }

    for (var substr of substrings) {
      if (e.key === '.' && /\..*\./.test(substr)) {
        e.preventDefault();
      }
    }

    if (["Backspace", '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '+', '-', '×', '÷', '^', '/', '*'].indexOf(e.key) !== -1) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  });

  var init = initHandlers();
  init.getNumbers(number);
  init.clearInput(clear)
})();

