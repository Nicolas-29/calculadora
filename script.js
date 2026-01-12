class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.isDegree = true; // graus por padrão
        this.maxLength = 24;
        this.clear();
    }

    // =========================
    // ESTADO
    // =========================
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.shouldResetScreen) return;

        this.currentOperand = this.currentOperand.slice(0, -1);
        if (!this.currentOperand) this.currentOperand = '0';
    }

    // =========================
    // INPUT
    // =========================
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        }
        else if (this.currentOperand.length < this.maxLength) {
            this.currentOperand += number;
        }
    }

    appendOperator(operator) {
        this.shouldResetScreen = false;
        const lastChar = this.currentOperand.slice(-1);

        // Evita operadores duplicados
        if ("+-×÷*/^".includes(lastChar) && "+-×÷*/^".includes(operator)) return;

        // Funções científicas
        if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(operator)) {
            if (this.currentOperand === '0') this.currentOperand = '';
            this.currentOperand += `${operator}(`;
            return;
        }

        // Constantes
        if (operator === 'pi') {
            this.currentOperand += 'π';
            return;
        }

        if (operator === 'e') {
            this.currentOperand += 'e';
            return;
        }

        this.currentOperand += operator;
    }

    // =========================
    // PROCESSAMENTO
    // =========================
    sanitizeExpression(expression) {
        let exp = expression;

        exp = exp.replace(/×/g, '*')
                 .replace(/÷/g, '/')
                 .replace(/\^/g, '**')
                 .replace(/π/g, 'Math.PI')
                 .replace(/\be\b/g, 'Math.E')
                 .replace(/%/g, '/100');

        // Trigonometria em graus
        if (this.isDegree) {
            exp = exp.replace(/sin\(/g, 'Math.sin(this.toRad(')
                     .replace(/cos\(/g, 'Math.cos(this.toRad(')
                     .replace(/tan\(/g, 'Math.tan(this.toRad(');
        } else {
            exp = exp.replace(/sin\(/g, 'Math.sin(')
                     .replace(/cos\(/g, 'Math.cos(')
                     .replace(/tan\(/g, 'Math.tan(');
        }

        exp = exp.replace(/log\(/g, 'Math.log10(')
                 .replace(/ln\(/g, 'Math.log(')
                 .replace(/sqrt\(/g, 'Math.sqrt(');

        return exp;
    }

    toRad(value) {
        return value * (Math.PI / 180);
    }

    compute() {
        try {
            const original = this.currentOperand;
            const sanitized = this.sanitizeExpression(original);
            const result = new Function("return " + sanitized)();

            if (!isFinite(result)) throw new Error();

            this.currentOperand = parseFloat(result.toFixed(10)).toString();
            this.previousOperand = original + ' =';
            this.shouldResetScreen = true;

        } catch {
            this.currentOperand = "Erro";
            this.shouldResetScreen = true;
        }
    }

    // =========================
    // UI
    // =========================
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        this.previousOperandTextElement.innerText = this.previousOperand;
    }
}

// =========================
// INIT
// =========================
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// =========================
// BOTÕES (MOUSE)
// =========================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const { action, value } = button.dataset;

        if (action === 'clear') calculator.clear();
        else if (action === 'delete') calculator.delete();
        else if (action === 'calculate') calculator.compute();
        else if (value) {
            if (!isNaN(value) || value === '.') calculator.appendNumber(value);
            else calculator.appendOperator(value);
        }

        calculator.updateDisplay();
    });
});

// =========================
// TECLADO
// =========================
document.addEventListener('keydown', e => {
    const key = e.key;
    const lastChar = calculator.currentOperand.slice(-1);

    if ("0123456789.".includes(key)) {
        calculator.appendNumber(key);
    }
    else if ("+-*/^()".includes(key)) {
        if ("+-*/^".includes(lastChar) && "+-*/^".includes(key)) return;
        calculator.appendOperator(key);
    }
    else if (key === "Enter") {
        e.preventDefault();
        calculator.compute();
    }
    else if (key === "Backspace") {
        calculator.delete();
    }
    else if (key === "Escape") {
        calculator.clear();
    }

    calculator.updateDisplay();
});

