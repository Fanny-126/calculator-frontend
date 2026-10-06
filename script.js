// ========================================
// Backend API
// ========================================

const API_BASE_URL =
    "https://fanny-126-calculator-backend.de.deplexo.com";


// ========================================
// Get HTML elements
// ========================================

const expressionInput =
    document.getElementById("expression");

const calculateButton =
    document.getElementById("calculate-button");

const deleteButton =
    document.getElementById("delete-button");

const clearButton =
    document.getElementById("clear-button");

const refreshHistoryButton =
    document.getElementById(
        "refresh-history-button"
    );

const resultElement =
    document.getElementById("result");

const errorElement =
    document.getElementById("error");

const historyList =
    document.getElementById("history-list");


// ========================================
// Calculator keypad
// ========================================

const keypadButtons =
    document.querySelectorAll(
        ".keypad button[data-value]"
    );


keypadButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            const value =
                button.dataset.value;

            expressionInput.value += value;

            expressionInput.focus();
        }
    );

});


// ========================================
// Delete last character
// ========================================

deleteButton.addEventListener(
    "click",
    function () {

        const currentValue =
            expressionInput.value;

        expressionInput.value =
            currentValue.substring(
                0,
                currentValue.length - 1
            );

        expressionInput.focus();
    }
);


// ========================================
// Clear input
// ========================================

clearButton.addEventListener(
    "click",
    function () {

        expressionInput.value = "";

        resultElement.textContent = "";

        errorElement.textContent = "";

        expressionInput.focus();
    }
);


// ========================================
// Calculate expression
// ========================================

async function calculateExpression() {

    const expression =
        expressionInput.value.trim();


    resultElement.textContent = "";

    errorElement.textContent = "";


    if (expression === "") {

        errorElement.textContent =
            "Please enter an expression.";

        return;
    }


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/calculate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        expression: expression
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Calculation failed."
            );
        }


        resultElement.textContent =
            "Result: " + data.result;


        await loadHistory();

    } catch (error) {

        errorElement.textContent =
            error.message;
    }
}


// ========================================
// Calculate button
// ========================================

calculateButton.addEventListener(
    "click",
    calculateExpression
);


// ========================================
// Press Enter to calculate
// ========================================

expressionInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            calculateExpression();
        }
    }
);


// ========================================
// Load history
// ========================================

async function loadHistory() {

    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/history"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to load history."
            );
        }


        renderHistory(data.history);

    } catch (error) {

        historyList.innerHTML =
            "<p>" +
            error.message +
            "</p>";
    }
}


// ========================================
// Display history
// ========================================

function renderHistory(history) {

    historyList.innerHTML = "";


    if (
        !history ||
        history.length === 0
    ) {

        historyList.innerHTML =
            "<p>No history yet.</p>";

        return;
    }


    history.forEach(
        function (item) {

            const historyItem =
                document.createElement(
                    "div"
                );

            historyItem.className =
                "history-item";


            const information =
                document.createElement(
                    "div"
                );


            const expression =
                document.createElement(
                    "div"
                );

            expression.className =
                "history-expression";

            expression.textContent =
                item.expression;


            const result =
                document.createElement(
                    "div"
                );

            result.className =
                "history-result";

            result.textContent =
                "Result: " +
                item.result;


            information.appendChild(
                expression
            );

            information.appendChild(
                result
            );


            // History delete button

            const historyDeleteButton =
                document.createElement(
                    "button"
                );

            historyDeleteButton.type =
                "button";

            historyDeleteButton.className =
                "history-delete-button";

            historyDeleteButton.textContent =
                "Delete";


            historyDeleteButton.addEventListener(
                "click",
                function () {

                    deleteHistory(
                        item.id
                    );
                }
            );


            historyItem.appendChild(
                information
            );

            historyItem.appendChild(
                historyDeleteButton
            );


            historyList.appendChild(
                historyItem
            );
        }
    );
}


// ========================================
// Delete history record
// ========================================

async function deleteHistory(id) {

    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/history/" +
                id,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to delete history."
            );
        }


        await loadHistory();

    } catch (error) {

        errorElement.textContent =
            error.message;
    }
}


// ========================================
// Refresh history button
// ========================================

refreshHistoryButton.addEventListener(
    "click",
    loadHistory
);


// ========================================
// Load history when page opens
// ========================================

loadHistory();