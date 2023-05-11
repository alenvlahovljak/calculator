"use strict";

(function () {
  var Calculator = (function () {
    var calculator = null;

    function create() {
      var NON_NUMS = ['Delete', '+', '-', '*', '/', '×', '÷', '^'];
      var ALLOWED_KEYS = ["Escape", "Enter", "Shift", 'Backspace', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].concat(NON_NUMS);
      var CALCULATOR_OPERATORS = ['+', '-', '×', '÷', '^'];
      var OPERATORS = /[+\-×÷^/*]/;
      var IS_DISPLAYED = false;

      function filterOperators(value) {
        if (typeof value != 'string') {
          throw new TypeError('Invalid argument: expected a string');
        }

        return value.split(OPERATORS);
      }

      function getValueString(value, key) {
        if (typeof value != 'string') {
          throw new TypeError('Invalid argument: expected a string');
        }

        var str = value;

        if (key) {
          str += key;
        }

        str = str.replace(/\*/g, "×");
        str = str.replace(/\//g, "÷");

        var lastChar = str[str.length - 1];
        var numbers = str.split(/\+|\-|\×|\÷|\^/g);
        var operators = str.replace(/[0-9]|\./g, "").split("");

        return {str, numbers, operators, lastChar};
      }

      function getNumbers(numbers) {
        if (!(numbers instanceof NodeList)) {
          throw new TypeError('Invalid argument: expected a NodeList');
        }

        for (var i = 0; i < numbers.length; i++) {
          numbers[i].addEventListener("click", function (e) {
            var {str, lastChar} = getValueString(input.value);
            var substrings = filterOperators(str + e.target.textContent);

            for (var substr of substrings) {
              if (e.target.textContent == '.' && /\..*\./.test(substr)) {
                console.log("Cannot enter two dots in a number!");
                e.preventDefault();
                return false;
              }
            }

            if (IS_DISPLAYED == false) {
              input.value += e.target.textContent;
              input.focus();
            } else if (IS_DISPLAYED == true && CALCULATOR_OPERATORS.includes(lastChar)) {
              IS_DISPLAYED = false;
              input.value += e.target.textContent;
              input.focus();
            } else {
              IS_DISPLAYED = false;
              input.value = "";
              input.value += e.target.textContent;
              input.focus();
            }
          });
        }
      }

      function getOperators(operators) {
        if (!(operators instanceof NodeList)) {
          throw new TypeError('Invalid argument: expected a NodeList');
        }

        for (var i = 0; i < operators.length; i++) {
          operators[i].addEventListener("click", function (e) {
            var {str, lastChar} = getValueString(input.value);

            if (str == 'Error') {
              input.value = '';

              if (e.target.textContent == '-') {
                input.value = e.target.textContent;
              }

              input.focus();
            } else if (str[0] == '-' && str.length == 1 && NON_NUMS.includes(e.target.textContent)) {
              console.log('Cannot change the sign of the number');
              input.focus();
            } else if (CALCULATOR_OPERATORS.includes(lastChar)) {
              input.value = str.substring(0, str.length - 1) + e.target.textContent;
              input.focus();
            } else if (e.target.textContent != '-' && str.length == 0) {
              console.log("enter a number first");
            } else {
              input.value += e.target.textContent;
              input.focus();
            }
          });
        }
      }

      function getCalculation(calc) {
        if (typeof calc == 'number' && !isNaN(calc) && isFinite(calc)) {
          return calc;
        }

        return "Error";
      }

      function getResult(result, input) {
        if (!(result instanceof HTMLElement) || !(input instanceof HTMLElement)) {
          throw new TypeError('Invalid argument: expected a HTMLElement');
        }

        result.addEventListener("click", function (e) {
          var {lastChar, numbers, operators} = getValueString(input.value);

          if (CALCULATOR_OPERATORS.includes(lastChar)) {
            window.alert('Cannot submit with last operator as an input!');
            input.focus();
            return;
          }

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
                this._numbers.splice(exponent, 2, getCalculation(this._numbers[exponent] ** this._numbers[exponent + 1]));
                this._operators.splice(exponent, 1);
                exponent = this._operators.indexOf("^");
              }
            },
            divide() {
              var divide = this._operators.indexOf("÷");
              while (divide != -1) {
                this._numbers.splice(divide, 2, getCalculation(this._numbers[divide] / this._numbers[divide + 1]));
                this._operators.splice(divide, 1);
                divide = this._operators.indexOf("÷");
              }
            },
            multiply() {
              var multiply = this._operators.indexOf("×");
              while (multiply != -1) {
                this._numbers.splice(multiply, 2, getCalculation(this._numbers[multiply] * this._numbers[multiply + 1]));
                this._operators.splice(multiply, 1);
                multiply = this._operators.indexOf("×");
              }
            },
            add() {
              var add = this._operators.indexOf("+");
              while (add != -1) {
                this._numbers.splice(add, 2, getCalculation(parseFloat(this._numbers[add]) + parseFloat(this._numbers[add + 1])));
                this._operators.splice(add, 1);
                add = this._operators.indexOf("+");
              }
            },
            subtract() {
              var subtract = this._operators.indexOf("-");
              while (subtract != -1) {
                this._numbers.splice(subtract, 2, getCalculation(this._numbers[subtract] - this._numbers[subtract + 1]));
                this._operators.splice(subtract, 1);
                subtract = this._operators.indexOf("-");
              }
            }
          }

          operate.execute = function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._operators.push(name);

            if (operate[name]) {
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

          input.value = operate._numbers[0];
          input.focus();
          IS_DISPLAYED = true;
        });
      }

      function initKeyboard(input, result, clear) {
        if (!(input instanceof HTMLElement) || !(result instanceof HTMLElement) || !(clear instanceof HTMLElement)) {
          throw new TypeError('Invalid argument: expected a HTMLElement');
        }

        input.addEventListener('mousedown', function (e) {
          if (e.target == input && e.target.value.length != 0) {
            e.preventDefault();
            return false;
          }
        });

        input.addEventListener('keydown', (e) => {
          if (!ALLOWED_KEYS.includes(e.key)) {
            console.log("The key " + e.key + " is not allowed!");
            e.preventDefault();
            return false;
          }

          if (e.key == 'Enter') {
            result.click();
            return false;
          }

          var {str, lastChar} = getValueString(input.value);

          if (e.key == 'Escape' || (e.key && str == 'Error')) {
            clear.click();
            return false;
          }

          if (e.key != '-' && ((NON_NUMS.includes(e.key)) && str.length == 0)) {
            console.log("Enter a number first!");
            e.preventDefault();
            return false;
          }

          if (str[0] == '-' && str.length == 1 && NON_NUMS.includes(e.key)) {
            console.log('Cannot change the sign of the number');
            e.preventDefault();
            return false;
          }

          if (NON_NUMS.includes(e.key) && NON_NUMS.includes(str[str.length - 1])) {
            input.value = str.substring(0, str.length - 1) + e.key;
            console.log("Operator " + lastChar + " replaced with " + e.key);
            e.preventDefault();
            return false;
          }

          var {str} = getValueString(input.value, e.key);
          var substrings = filterOperators(str);

          for (var sub of substrings) {
            if (e.key == '.' && /\..*\./.test(sub)) {
              console.log("Cannot enter two dots in a number!");
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

        clear.addEventListener("click", function () {
          input.value = "";
        })
      }

      return {
        getNumbers, getOperators, clearInput, initKeyboard, getResult
      }
    }

    return {
      getInstance: function () {
        if (!calculator) {
          calculator = create();
        }

        return calculator;
      }
    }
  })();

  var input = document.getElementById('input'),
    numbers = document.querySelectorAll('.numbers div'),
    operators = document.querySelectorAll('.operators div'),
    result = document.getElementById('result'),
    clear = document.getElementById('clear');

  var calculator = Calculator.getInstance();
  calculator.initKeyboard(input, result, clear);
  calculator.getNumbers(numbers);
  calculator.getOperators(operators);
  calculator.getResult(result, input);
  calculator.clearInput(clear);
})();

