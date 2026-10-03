const API_BASE_URL = "http://127.0.0.1:8000";

const expressionInput = document.getElementById("expression");
const calculateButton = document.getElementById("calculate-button");
const resultElement = document.getElementById("result");
const errorElement = document.getElementById("error");
const historyList = document.getElementById("history-list");
const refreshHistoryButton = document.getElementById(
    "refresh-history-button"
);


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
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    expression: expression,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Calculation failed.");
        }

        resultElement.textContent =
            `Result: ${data.result}`;

        await loadHistory();

    } catch (error) {
        errorElement.textContent = error.message;
    }
}


async function loadHistory() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/history`
        );

        if (!response.ok) {
            throw new Error("Failed to load history.");
        }

        const data = await response.json();

        renderHistory(data.history);

    } catch (error) {
        historyList.innerHTML =
            `<p>${error.message}</p>`;
    }
}


function renderHistory(history) {
    if (history.length === 0) {
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
        result.textContent = `= ${item.result}`;

        information.appendChild(expression);
        information.appendChild(result);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener(
            "click",
            () => deleteHistory(item.id)
        );

        historyItem.appendChild(information);
        historyItem.appendChild(deleteButton);

        historyList.appendChild(historyItem);
    });
}


async function deleteHistory(historyId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/history/${historyId}`,
            {
                method: "DELETE",
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


calculateButton.addEventListener(
    "click",
    calculateExpression
);


refreshHistoryButton.addEventListener(
    "click",
    loadHistory
);


expressionInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            calculateExpression();
        }
    }
);


loadHistory();