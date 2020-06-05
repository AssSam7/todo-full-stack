// Initial page rendering
let htmlDOM = items
  .map((item) => {
    return `
      <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
        <span class="item-text">${item.text}</span>
        <div>
          <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
          <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
        </div>
      </li>
    `;
  })
  .join("");
document.getElementById("item-list").insertAdjacentHTML("beforeend", htmlDOM);

// Asynchronously creating the ToDo item
let createField = document.querySelector("#create-field");

document.getElementById("create-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let texts = items.map((item) => item.text.toLowerCase());
  if (
    !texts.includes(createField.value.toLowerCase()) &&
    createField.value !== "" &&
    createField.value.match(/^[a-zA-Z0-9]+/i)
  ) {
    axios
      .post("/create-item", { text: createField.value })
      .then(function (response) {
        console.log(texts);
        // Create the HTML DOM for new item
        let createDOM = `
          <li id="item-list" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
          <span class="item-text">${response.data.text}</span>
          <div>
            <button data-id="${response.data._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
            <button data-id="${response.data._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
          </div>
          </li>
          `;
        document
          .querySelector("#item-list")
          .insertAdjacentHTML("beforeend", createDOM);
        createField.value = "";
        createField.focus();
      })
      .catch(function () {
        console.log("Please try again later.");
      });
  } else {
    window.alert("Sorry, Please try again!");
    createField.value = "";
    createField.focus();
  }
});

document.addEventListener("click", function (e) {
  // Delete Feature
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you really want to delete this item permanently?")) {
      axios
        .post("/delete-item", { id: e.target.getAttribute("data-id") })
        .then(function () {
          e.target.parentElement.parentElement.remove();
        })
        .catch(function () {
          console.log("Please try again later.");
        });
    }
  }

  // Update Feature
  if (e.target.classList.contains("edit-me")) {
    let userInput = prompt(
      "Enter your desired new text",
      e.target.parentElement.parentElement.querySelector(".item-text").innerHTML
    );
    if (userInput && userInput.value !== "" &&
    userInput.value.match(/^[a-zA-Z0-9]+/i)) {
      axios
        .post("/update-item", {
          text: userInput,
          id: e.target.getAttribute("data-id"),
        })
        .then(function () {
          e.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = userInput;
        })
        .catch(function () {
          console.log("Please try again later.");
        });
    }
  }
});
