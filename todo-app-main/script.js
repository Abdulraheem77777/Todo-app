class TodoApp {
  constructor() {
    this._parentElement = document.querySelector(".todo-form");
    this._listHolder = document.querySelector(".list-items");
    this._allBtn = document.querySelector(".all-btn");
    this._completeBtn = document.querySelector(".complete-btn");
    this._activeBtn = document.querySelector(".active-btn");
    this._clearCompleteBtn = document.querySelector(".clear-btn");
    this._todosPack = [];

    console.log(this._allBtn, this._completeBtn, this._activeBtn); // should not be null

    this._handleSubmit();
    this._handleDeleteBtn();
    this._handleCheckBox();
    this._handleFilterBtns();
    this._flexVisibility();
    this._handlelightMode();
    this._itemsLeft();
    this._clearComplete();
    this._loadLocalStorage();
  }

  _flexVisibility() {
    const lister = document.querySelectorAll(".todo");
    const filterBtns = document.querySelector(".filter-buttons");
    const controls = document.querySelector(".controls");
    if (lister.length > 0) {
      filterBtns.classList.remove("hidden");
      controls.classList.remove("hidden");
    } else {
      filterBtns.classList.add("hidden");
      controls.classList.add("hidden");
    }
  }

  _renderList(data) {
    this._todosPack.push(data);
    this._saveLocalStorage();
    this._listHolder.insertAdjacentHTML("beforeend", this._markup(data));
    this._flexVisibility();

    this._itemsLeft();
  }
  _handleSubmit() {
    this._parentElement.addEventListener(
      "submit",
      this._onSubmitButton.bind(this)
    );
  }
  _itemsLeft() {
    const listContent = document.querySelectorAll(".todo");
    // const controlz = document.querySelector(".controls");

    const itemLeftText = document.querySelector(".controls span");

    //Array.from() converts Nodelist to Array
    const activeOnly = Array.from(listContent).filter(
      (list) => list.dataset.status === "active"
    );
    // itemLeftText.textContent = `${activeOnly.length}`;

    // itemp.textContent = ` ${activeOnly.length === 1 ? "item" : "items"}`;

    itemLeftText.textContent = `${activeOnly.length} item${
      activeOnly.length === 1 ? "" : "s"
    }`; //1 result// not 👈, 2... results
    this._flexVisibility();
  }
  _handleDeleteBtn() {
    this._listHolder.addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-btn");
      if (!btn) return;

      const li = btn.closest("li");
      const todoId = +li.dataset.id;

      li.remove();
      this._flexVisibility();
      this._itemsLeft();

      //update state
      this._todosPack = this._todosPack.filter((todo) => todo.id !== todoId);
      this._saveLocalStorage();
    });
  }
  _onSubmitButton(e) {
    e.preventDefault();
    const formData = [...new FormData(this._parentElement)];
    const data = Object.fromEntries(formData);

    //if the value from FormData exist, trim it if it doesnt(|| return '' list to the app)
    const todoText = data.list?.trim() || "";

    if (!todoText) return; //ignore empty submissions

    const newTodo = {
      list: todoText,
      status: "active",
      id: Date.now(),
    };
    this._renderList(newTodo);
    this._flexVisibility();
    this._parentElement.reset();
  }
  _markup(data) {
    return `
    <li class="todo" data-status="${data.status}" data-id="${data.id}">
      <div class="input-wrapper">
        <input type="checkbox" class="todo-checkbox" ${
          data.status === "completed" ? "checked" : ""
        } />

        <p class="todo-text">${data.list}</p>
      <button class="delete-btn"><img src="images/icon-cross.svg" alt="Delete" /></button>
      </div>
    
    </li>`;
  }
  _handleCheckBox() {
    //event Delegation
    this._listHolder.addEventListener("change", (e) => {
      const checkbox = e.target.closest(".todo-checkbox");
      if (!checkbox) return;

      const li = e.target.closest(".todo");
      const ischecked = checkbox.checked;
      li.dataset.status = ischecked ? "completed" : "active";

      // ✅ Update state
      const todoId = +li.dataset.id;

      this._todosPack = this._todosPack.map((todo) =>
        todo.id === todoId ? { ...todo, status: li.dataset.status } : todo
      );
      this._flexVisibility();

      this._itemsLeft();
      this._saveLocalStorage();
    });
  }
  _clearComplete() {
    const todoz = () => document.querySelectorAll(".todo");
    this._clearCompleteBtn.addEventListener("click", () => {
      todoz().forEach((li) => {
        if (li.dataset.status === "completed") {
          li.remove();
        }
      });
      // ✅ Update state
      //filter() creates a new array only including todos that are not completed.
      //This effectively deletes all completed todos from the state.
      this._todosPack = this._todosPack.filter(
        (todo) => todo.status !== "completed"
      );
      this._flexVisibility();
      this._itemsLeft();
      this._saveLocalStorage();
    });
  }
  _handleFilterBtns() {
    const listItems = () => document.querySelectorAll(".todo"); //<l>

    const buttons = [this._allBtn, this._completeBtn, this._activeBtn];

    const clearSelected = () => {
      buttons.forEach((btn) => btn.classList.remove("selected"));
    };
    this._allBtn.addEventListener("click", () => {
      console.log("All filter clicked");
      listItems().forEach((item) => {
        item.style.display = "block";
      });
      clearSelected();
      this._allBtn.classList.add("selected");
    });

    this._completeBtn.addEventListener("click", () => {
      console.log("All filter clicked");
      listItems().forEach((item) => {
        item.style.display =
          item.dataset.status === "completed" ? "block" : "none";
      });
      clearSelected();
      this._completeBtn.classList.add("selected");
    });

    this._activeBtn.addEventListener("click", () => {
      console.log("All filter clicked");
      listItems().forEach((item) => {
        item.style.display =
          item.dataset.status === "active" ? "block" : "none";
      });
      clearSelected();
      this._activeBtn.classList.add("selected");
    });
  }
  _saveLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(this._todosPack));
  }
  _loadLocalStorage() {
    const data = localStorage.getItem("todos");
    if (!data) return;
    this._todosPack = JSON.parse(data);
    this._todosPack.forEach((pack) => {
      this._listHolder.insertAdjacentHTML("beforeend", this._markup(pack));
    });
    this._flexVisibility();
    this._itemsLeft();
  }
  _handlelightMode() {
    const mode = document.querySelector(".mode");
    const listWrapper = document.querySelector(".todo-list-wrapper");
    const flexContainer = document.querySelectorAll(".flex button");
    mode.addEventListener("click", () => {
      const todoInput = document.querySelector(".input-wrappers");
      const inputField = document.querySelector("#todo-input");

      const img = document.querySelector(".img-class");
      const btnSun = mode.querySelector(".btn-mode-sun");
      const btnMoon = mode.querySelector(".btn-mode-moon");
      const isHidden = btnSun.classList.contains("hidden");
      const listArounds = document.querySelectorAll(".input-wrapper");
      const emergency = document.querySelector(".emergency");
      const filterBtns = document.querySelector(".filter-buttons");
      const controls = document.querySelector(".controls");

      if (isHidden) {
        btnSun.classList.remove("hidden");
        btnMoon.classList.add("hidden");
        img.src = "images/bg-desktop-dark.jpg";
        img.alt = "image";

        listWrapper.style.background = "hsl(235, 21%, 11%)";
        todoInput.style.background = "hsl(235, 21%, 11%)";
        inputField.style.backgroundColor = "hsl(235, 21%, 11%)"; // ✅ DARK BG
        inputField.style.color = "#fff"; // ✅ WHITE TEXT
        emergency.style.background = "hsl(235, 21%, 11%)";
        filterBtns.style.background = "hsl(237, 14%, 26%)";
        controls.style.background = "hsl(237, 14%, 26%)";
        flexContainer.forEach((bew) => {
          bew.style.color = "#fff";
        });
        listArounds.forEach((listAround) => {
          listAround.style.background = " hsl(237, 14%, 26%)";
          const text = listAround.querySelector(".todo-text");
          text.style.color = "#fff";
          listAround.style.boxShadow = "";
          listAround.style.borderBottom = "1px solid #ccc";
        });
      } else {
        btnSun.classList.add("hidden");
        btnMoon.classList.remove("hidden");
        img.src = "images/bg-desktop-light.jpg";
        listWrapper.style.background = "#fff";
        img.alt = "image";
        todoInput.style.background = "#fff";
        emergency.style.background = "#fff";
        filterBtns.style.background = "#fff";
        controls.style.background = "#fff";
        flexContainer.forEach((bew) => {
          bew.style.color = "#111";
          bew.classList.add("hover-effect");
        });
        inputField.style.backgroundColor = "#fff"; // ✅ LIGHT BG
        inputField.style.color = "#000"; // ✅ BLACK TEXT
        listArounds.forEach((listAround) => {
          listAround.style.background = "#fff";
          const text = listAround.querySelector(".todo-text");
          text.style.color = "#000";
        });
      }
    });
  }
}

const app = new TodoApp();
