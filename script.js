// BUDGET CONTROLLER
var budgetController = (function () {
   
    // constructor for all future expense;
    const Expense = function (id, description, value) {
        this.id = id;       // a unique ID which will be used to operate on this element, such as delete;
        this.description = description;
        this.value = value;
        this.percentage = -1;       // initially set to -1 which conventionally means nothing
    }

    // adding to the expense object prototype, a method which every child object will inherit
    Expense.prototype.calcPercentage = function (totalInc) {
        
        if (totalInc > 0) {
            this.percentage = ((this.value / totalInc) * 100).toFixed(1);
        } else this.percentage = "--";    
    }

    // a prototype method to return the value from the percentage calculation 
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    // a constructor for all future incomes; 
    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // function to calculate the total income and expenses in their respective arrays
    const calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach (el => sum += el.value)

        // push the calculated total to the data type (inc or exp)
        data.totals[type] = sum;    
    }

    let data = {
        // data structure to store the input items according to type
        allItems: {     
            exp: [],    //to store all data and to allow for 'ID' allocatn
            inc: [],    //remember that the elements of these arrays are objects with ppts: id, description and value
        },

        totals: {
            // set initial totals to zero;
            exp: 0,
            inc: 0,
        },

        budget: 0,
        percentage: -1,
    }

    return {
        addItem: function (type, des, val) { //'type' is from 'getInput' fnt. this  fnt is called back at d 'ctrlAddItem' fnt
            let newItem;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    //add 1 to the initial id.
            } else ID = 0    //set the initial id to 0.
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push new item to the appropriate type array;
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;            
        },

        deleteItem: function (type, id) {

            //return all the ids of all inputs of a type in a array format;
            var ids = data.allItems[type].map(el => el.id)

            //from the mapped ids, select the indexOf id of interest;
            index = ids.indexOf(id);

            //since this index is the index of the input in the type array, delete the input from the type array;
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        //function to calculate total budget left and percentage of total income spent;
        calculateBudget: function () {
          
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses, and save as a property in the data object;
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage income spent
            if (data.totals.inc > 0) {
                data.percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(1);
            }
            else data.percentage = -1;
            
        },

        //function to calculate the income percentage of each individual expense;
        calculatePercentages: function () {
            
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            const allPerc = data.allItems.exp.map(el => el.getPercentage())
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        //a tool to test the app from the console log;
        testing: function () {
            console.log(data);
        }
    }
})();


// UI CONTROLLER
const UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        descType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    }
    
    const formatNumber = function (num, type) {
        let numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        //split number into integer and mantissa, return result in an array
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3 && int.length <= 6) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } else if (int.length > 6) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' '+ '$' + int + '.' +dec;
    }

    var nodeListForEach = function (list, callbackFnt) {
                
        for (var i = 0; i < list.length; i++){
            callbackFnt(list[i], i);
        }
    };

    return {

        // function to extract the inputs from the input fields
        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp.
                description: document.querySelector(DOMstrings.descType).value,
                value: parseFloat (document.querySelector(DOMstrings.valueType).value)
            }   
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;

            //Create Html strings with placeholder texts

            // the if statement determines which side of the lists the html will be injected.
            if (type === 'inc') {
                
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'

            } else if (type === 'exp') {

                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }
        
            //Replace the placeholder text with some actual data, the DOM object '.replace' does jst that, it accepts (find string, replace string with) parameters. 

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber (obj.value, type));   // the final newHtml identifier will store the overall manipulated html.

            //Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);   //insertAdjacentHtml injects html into the original code.
        },

        deleteListItem: function (selectorID) {
            
            const el = document.getElementById(selectorID);
            document.getElementById(selectorID).parentNode.removeChild(el)
        },

        //clear input fields after entering;
        clearFields: function () {
            var fields, fieldsArr;

            //list input class in an array like object. (Node-list)
            fields = document.querySelectorAll(DOMstrings.descType + ', ' + DOMstrings.valueType);

            // hack to convert 'fields' to proper array, although fields can be used as normal array anyway :)
            fieldsArr = Array.prototype.slice.call(fields);

            //set the value to no content;
            fieldsArr.forEach(function (current) {
                current.value = '';
            })

            //return focus to the description input
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber (obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.totalInc) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {
           
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; 
                } else current.textContent = '---';               
            })
        },

        displayMonth: function () {
            let now, year, month, months;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
          
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.descType + ',' +
                DOMstrings.valueType
            );
            
            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings 
        }
    }
 })();


// GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {

    const setupEventListiners = function () {

        const DOM = UICtrl.getDOMstrings();
       
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
        document.addEventListener('keypress', function (event) {
            
            if (event.keyCode === 13  || event.which === 13) {
                ctrlAddItem();
            }
        }); 

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }

    const updateBudget = function () {
        
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();

        // 2. Return the Budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the Budget on the UI
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = function () {
        
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentage
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = function () {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        // to make sure that appropriate info is entered, the if statement:
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the input fields
            UICtrl.clearFields();

            // 5. Calculate and Update budget
            updateBudget();

            // 6. Calc and update the percentages
            updatePercentages();
        }
    }
    
    const ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID; 

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt (splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calc and update the percentages
            updatePercentages();
        }      
    }

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListiners();
        }
    }

})(budgetController, UIController);

controller.init();