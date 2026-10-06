const API_BASE_URL =
    "https://fanny-126-calculator-backend.de.deplexo.com";

const expressionInput = document.getElementById("expression");
const calculateButton = document.getElementById("calculate-button");
const resultElement = document.getElementById("result");
const errorElement = document.getElementById("error");
const historyList = document.getElementById("history-list");
const refreshHistoryButton = document.getElementById(
    "refresh-history-button"
);
const clearButton = document.getElementById("clear-button");


// Add keypad input to the expression box.
const keypadButtons = document.querySelectorAll(
    ".keypad button[data-value]"
);

keypadButtons.forEach((button) => {
    button.addEventListener("click", () => {
        expressionInput.value += button.dataset.value;
        expressionInput.focus();
    });
});


// Clear the expression and messages.
clearButton.addEventListener("click", () => {
    expressionInput.value = "";
    resultElement.textContent = "";
    errorElement.textContent = "";
    expressionInput.focus();
});


// Calculate the expression through the backend API.
async function calculateExpression() {
    const expression = expressionInput.value.trim();

    resultElement.textContent = "";
    errorElement.textContent = "";

    if (!expression) {
        errorElement.textContent = "Please enter an expression.";
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/calculate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    expression: expression
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Calculation failed."
            );
        }

        resultElement.textContent = `Result: ${data.result}`;

        await loadHistory();
    } catch (error) {
        errorElement.textContent = error.message;
    }
}


// Load calculation history from the backend.
async function loadHistory() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/history`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to load history."
            );
        }

        renderHistory(data.history);
    } catch (error) {
        historyList.innerHTML =
            `<p>${error.message}</p>`;
    }
}


// Display history records.
function renderHistory(history) {
    if (!history || history.length === 0) {
        historyList.innerHTML = "<p>No history yet.</p>";
        return;
    }

    historyList.innerHTML = "";

    history.forEach((item) => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const information = document.createElement("div");

        const expression = document.createElement("div");
        expression.className = "history-expression";
        expression.textContent = item.expression;

        const result = document.createElement("div");
        result.className = "history-result";
        result.textContent = `Result: ${item.result}`;

        information.appendChild(expression);
        information.appendChild(result);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteHistory(item.id);
        });

        historyItem.appendChild(information);
        historyItem.appendChild(deleteButton);

        historyList.appendChild(historyItem);
    });
}


// Delete a history record through the backend API.
async function deleteHistory(id) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/history/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to delete history."
            );
        }

        await loadHistory();
    } catch (error) {
        errorElement.textContent = error.message;
    }
}


// Calculate when the Calculate button is clicked.
calculateButton.addEventListener(
    "click",
    calculateExpression
);


// Refresh calculation history.
refreshHistoryButton.addEventListener(
    "click",
    loadHistory
);


// Press Enter to calculate.
expressionInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            calculateExpression();
        }
    }
);


// Load history when the page opens.
loadHistory();